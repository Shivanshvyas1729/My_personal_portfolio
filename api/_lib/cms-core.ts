import { Octokit } from "@octokit/rest";
import yaml, { Document } from "yaml";
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

import { getOwner, getRepo, getBranch, getGithubToken, getIsLocalMode } from "./config";

export const RATE_LIMIT_SECONDS = 30;

// Path Security & Normalization
const BASE_DATA_DIR = path.normalize(path.resolve(process.cwd(), "src/data"));

export const ALLOWED_CMS_FILES = [
  "src/data/portfolio.yaml",
  "src/data/projects.yaml",
  "src/data/blog.yaml"
];

export function validateCmsFilePath(filePath: string): boolean {
  const normalized = filePath.replace(/\\/g, '/').toLowerCase();
  return ALLOWED_CMS_FILES.some(allowed => allowed.toLowerCase() === normalized);
}

const logCms = (msg: string, level: 'info' | 'error' = 'info') => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  if (level === 'error') {
    console.error(`[CMS ${timestamp}] ERROR: ${msg}`);
  } else {
    console.log(`[CMS ${timestamp}] ${msg}`);
  }
};

/**
 * Validates and normalizes paths for local filesystem operations.
 * Ensures the target file is strictly within the allowed data directory.
 */
function validateLocalPath(filePath: string): string {
  const normalizedRequested = path.normalize(filePath);
  const absoluteTarget = path.isAbsolute(normalizedRequested) 
    ? normalizedRequested 
    : path.resolve(process.cwd(), normalizedRequested);

  if (!absoluteTarget.toLowerCase().startsWith(BASE_DATA_DIR.toLowerCase())) {
    logCms(`🚨 SECURITY: Blocked out-of-bounds path: ${absoluteTarget}`);
    throw new Error(`Access denied: ${filePath} is outside of BASE_DATA_DIR`);
  }
  
  return absoluteTarget;
}

// In-memory Singleton Lock (Local Dev Only)
let isSaving = false;

export interface CmsApiResult {
  success: boolean;
  mode: "local" | "github";
  message?: string;
  error?: string;
  code?: number;
  data?: any;
}

export function getUseLocalMode(): boolean {
  return getIsLocalMode();
}

export function getOctokit() {
  const token = getGithubToken();
  if (!token && !getUseLocalMode()) {
     throw new Error("GITHUB_TOKEN is missing. Cannot use GitHub mode.");
  }
  return new Octokit({ auth: token });
}

// ─── Safe Nested YAML Update ───────────────────────────────────────────────
function safelyUpdateNode(doc: Document, pathKeys: string[], data: any) {
  if (data === null || data === undefined) {
    doc.deleteIn(pathKeys);
    return;
  }

  if (typeof data === 'object' && !Array.isArray(data)) {
    const existingNode = doc.getIn(pathKeys);
    if (existingNode === undefined || existingNode === null) {
      doc.setIn(pathKeys, doc.createNode(data));
      return;
    }
    Object.keys(data).forEach((key) => {
      safelyUpdateNode(doc, [...pathKeys, key], data[key]);
    });
  } else {
    doc.setIn(pathKeys, data);
  }
}

// ─── Mode Implementations ───────────────────────────────────────────────────

async function fetchFromGitHub(octokit: Octokit, filePath: string, ref: string = getBranch()) {
  const response = await octokit.repos.getContent({
    owner: getOwner(),
    repo: getRepo(),
    path: filePath,
    ref: ref,
  });
  const fileData = response.data as any;
  if (fileData.type !== "file") throw new Error("Target is not a file");
  return {
    sha: fileData.sha,
    content: Buffer.from(fileData.content, "base64").toString("utf-8"),
  };
}

// ─── Main Logic ─────────────────────────────────────────────────────────────

export async function coreUpdateYamlSection(
  role: string | null,
  filePath: string,
  sectionKey: string,
  newData: any,
  providedSha: string | undefined,
  isSafeMode: boolean,
): Promise<CmsApiResult> {
  const useLocalMode = getUseLocalMode();
  if (!validateCmsFilePath(filePath)) {
    logCms(`🚨 SECURITY: Blocked unauthorized write to: ${filePath}`);
    return { success: false, error: `Access denied: ${filePath} is not an authorized CMS data file`, code: 403, mode: useLocalMode ? "local" : "github" };
  }

  // 1. Singleton Lock (Local Mode Only)
  if (useLocalMode && isSaving) {
    return { success: false, error: "Saving in progress...", code: 423, mode: "local" };
  }
  
  if (useLocalMode) isSaving = true;

  try {
    // 2. RBAC Check at Backend Level
    const restrictedSections = ["emailjs", "personal", "resume"];
    if (role === "editor" && restrictedSections.includes(sectionKey)) {
      return { success: false, error: `Forbidden: Editors cannot modify ${sectionKey}`, code: 403, mode: useLocalMode ? "local" : "github" };
    }

    let rawContent: string;
    let sha: string = "";
    let absolutePath: string = "";

    // 3. Fetch Data Source
    if (useLocalMode) {
      try {
        absolutePath = validateLocalPath(filePath);
        logCms(`LOCAL MODE: Writing to ${absolutePath} (Role: ${role})`);
        rawContent = fs.readFileSync(absolutePath, "utf-8");
      } catch (e: any) {
        logCms(`Local path error: ${e.message}`, 'error');
        return { success: false, error: `Path Error: ${e.message}`, code: 403, mode: "local" };
      }
    } else {
      const octokit = getOctokit();
      const token = process.env.GITHUB_TOKEN;
      logCms(`GITHUB MODE: Saving ${filePath} | token present: ${!!token} | role: ${role}`);
      const fetched = await fetchFromGitHub(octokit, filePath);
      sha = fetched.sha;
      rawContent = fetched.content;
      
      // Conflict Detection (GitHub only)
      if (providedSha && providedSha !== sha) {
        return { success: false, error: "Conflict: SHA mismatch", code: 409, mode: "github", data: { latestSha: sha, latestContent: rawContent } };
      }
    }

    // 4. Update YAML Document
    const doc = yaml.parseDocument(rawContent);
    if (doc.errors?.length) throw new Error("YAML Parsing Error");

    safelyUpdateNode(doc, [sectionKey], newData);
    const updatedContent = doc.toString({ lineWidth: -1 });

    // 5. Safe Mode / Logging
    if (isSafeMode) {
      logCms(`Safe mode active: update to ${sectionKey} simulated.`);
      return { success: true, mode: useLocalMode ? "local" : "github", message: "Success. (Safe Mode simulation)" };
    }

    // 6. Persistence
    if (useLocalMode) {
      logCms(`Applying atomic local write to: ${filePath} (Section: ${sectionKey})`);
      const bakPath = `${absolutePath}.bak`;
      const tmpPath = `${absolutePath}.tmp`;
      
      // Atomic Loop
      try {
        fs.copyFileSync(absolutePath, bakPath);
        fs.writeFileSync(tmpPath, updatedContent);
        fs.renameSync(tmpPath, absolutePath);
        fs.unlinkSync(bakPath);
      } catch (e: any) {
        logCms(`Write failed, restoring from backup.`, 'error');
        if (fs.existsSync(bakPath)) fs.renameSync(bakPath, absolutePath);
        throw e;
      }
    } else {
      logCms(`Committing to GitHub: ${filePath} section=${sectionKey}`);
      const octokit = getOctokit();
      try {
        const result = await octokit.repos.createOrUpdateFileContents({
          owner: getOwner(),
          repo: getRepo(),
          path: filePath,
          message: `feat: update ${sectionKey} content [skip ci]`,
          content: Buffer.from(updatedContent, "utf-8").toString("base64"),
          sha,
          branch: getBranch(),
        });
        sha = (result.data as any).content.sha;
        logCms(`GitHub commit successful. New SHA: ${sha}`);
      } catch (ghErr: any) {
        logCms(`GitHub API commit failed: ${ghErr.message}`, 'error');
        throw ghErr;
      }
    }

    return { 
      success: true, 
      mode: useLocalMode ? "local" : "github", 
      message: `${sectionKey} updated successfully.`,
      data: { newSha: sha } 
    };

  } catch (e: any) {
    logCms(`CMS Error: ${e.message}`, 'error');
    return { success: false, error: e.message, code: 500, mode: useLocalMode ? "local" : "github" };
  } finally {
    if (useLocalMode) isSaving = false;
  }
}

export async function coreGetLatestData(filePath: string): Promise<CmsApiResult> {
  const useLocalMode = getUseLocalMode();
  if (!validateCmsFilePath(filePath)) {
    logCms(`🚨 SECURITY: Blocked unauthorized read from: ${filePath}`);
    return { success: false, error: `Access denied: ${filePath} is not an authorized CMS data file`, code: 403, mode: useLocalMode ? "local" : "github" };
  }

  try {
    let rawContent: string;
    
    if (useLocalMode) {
      const absolutePath = validateLocalPath(filePath);
      rawContent = fs.readFileSync(absolutePath, "utf-8");
    } else {
      const octokit = getOctokit();
      logCms(`Fetching absolute latest from GitHub API: ${filePath}`);
      const fetched = await fetchFromGitHub(octokit, filePath);
      rawContent = fetched.content;
    }

    const data = yaml.parse(rawContent);
    return { 
      success: true, 
      mode: useLocalMode ? "local" : "github", 
      data 
    };
  } catch (e: any) {
    return { success: false, error: e.message, code: 500, mode: useLocalMode ? "local" : "github" };
  }
}

export async function coreGetHistory(filePath: string): Promise<CmsApiResult> {
  const useLocalMode = getUseLocalMode();
  if (!validateCmsFilePath(filePath)) {
    logCms(`🚨 SECURITY: Blocked unauthorized history request for: ${filePath}`);
    return { success: false, error: `Access denied: ${filePath} is not an authorized CMS data file`, code: 403, mode: useLocalMode ? "local" : "github" };
  }

  if (useLocalMode) {
    try {
      const absolutePath = validateLocalPath(filePath);
      const relativeGitPath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');
      const command = `git log -n 4 --pretty=format:"%H|%s|%cI|%an" -- "${relativeGitPath}"`;
      const output = execSync(command, { encoding: 'utf-8', cwd: process.cwd() });
      
      const commits = output.split('\n').filter(Boolean).map(line => {
        const [sha, message, date, author] = line.split('|');
        return {
          sha: sha || 'unknown',
          message: message || 'No message',
          date: date || new Date().toISOString(),
          author: author || 'Unknown Author'
        };
      });
      
      return {
        success: true,
        mode: "local",
        data: { commits }
      };
    } catch (e: any) {
      console.warn("[CMS LOCAL HISTORY] git log failed, returning empty fallback:", e.message);
      return { success: true, mode: "local", message: "Local mode: history unavailable.", data: { commits: [] } };
    }
  }
  
  try {
    const octokit = getOctokit();
    const commits = await octokit.repos.listCommits({
      owner: getOwner(),
      repo: getRepo(),
      path: filePath,
      per_page: 4,
    });
    
    return {
      success: true,
      mode: "github",
      data: {
        commits: (commits.data || []).map((c: any) => ({
          sha: c.sha || 'unknown',
          message: c.commit?.message || 'No message',
          date: c.commit?.committer?.date || c.commit?.author?.date || new Date().toISOString(),
          author: c.commit?.author?.name || 'Unknown Author'
        }))
      }
    };
  } catch (e: any) {
    return { success: false, error: e.message, code: 500, mode: "github" };
  }
}

export async function coreGetCommitData(filePath: string, sha: string): Promise<CmsApiResult> {
  const useLocalMode = getUseLocalMode();
  if (!validateCmsFilePath(filePath)) {
    logCms(`🚨 SECURITY: Blocked unauthorized commit snapshot request for: ${filePath}`);
    return { success: false, error: `Access denied: ${filePath} is not an authorized CMS data file`, code: 403, mode: useLocalMode ? "local" : "github" };
  }

  if (useLocalMode) {
    try {
      const absolutePath = validateLocalPath(filePath);
      const relativeGitPath = path.relative(process.cwd(), absolutePath).replace(/\\/g, '/');
      const command = `git show ${sha}:"${relativeGitPath}"`;
      const output = execSync(command, { encoding: 'utf-8', cwd: process.cwd() });
      const data = yaml.parse(output);
      return {
        success: true,
        mode: "local",
        data
      };
    } catch (e: any) {
      console.error(`[CMS LOCAL ROLLBACK] Failed to fetch local commit data: ${e.message}`);
      return { success: false, error: `Local git rollback failed: ${e.message}`, code: 500, mode: "local" };
    }
  }
  
  try {
    const octokit = getOctokit();
    console.log(`[CRM-GITHUB] Fetching commit snapshot for ${filePath} at SHA ${sha}`);
    const fetched = await fetchFromGitHub(octokit, filePath, sha);
    const data = yaml.parse(fetched.content);
    console.log(`[CRM-GITHUB] Successfully loaded and parsed commit snapshot for SHA ${sha}`);
    return { 
      success: true, 
      mode: "github", 
      data 
    };
  } catch (e: any) {
    console.error(`[CRM-GITHUB] Failed to fetch commit: ${e.message}`);
    return { success: false, error: e.message, code: 500, mode: "github" };
  }
}

