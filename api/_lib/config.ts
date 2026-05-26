import fs from "fs";
import path from "path";
import yaml from "yaml";
import { execSync } from "child_process";

export interface BackendConfig {
  owner: string;
  repo: string;
  branch: string;
  githubToken: string | undefined;
  adminPassword: string | undefined;
  adminUsername: string | undefined;
  isProduction: boolean;
  isLocalMode: boolean;
}

/**
 * Manually parses the .env file directly from disk.
 * This completely bypasses Vite, Node process.env, and operating system caching layers,
 * guaranteeing the absolute freshest credentials are read in local development at runtime.
 */
function readDotEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  try {
    const dotenvPath = path.resolve(process.cwd(), ".env");
    if (fs.existsSync(dotenvPath)) {
      const content = fs.readFileSync(dotenvPath, "utf-8");
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        // Skip empty lines and comment lines
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.substring(0, eqIdx).trim();
          let val = trimmed.substring(eqIdx + 1).trim();
          // Remove wrapping quotes if present
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.substring(1, val.length - 1);
          }
          env[key] = val;
        }
      }
    }
  } catch (e: any) {
    console.warn("[Config Service] Failed to read .env dynamically from disk:", e.message);
  }
  return env;
}

/**
 * Centered Runtime Configuration Loader (Dynamic Getters)
 * Ensures changes in environment variables reflect immediately without server restart.
 */
export function getRuntimeConfig(): BackendConfig {
  const isProduction = process.env.NODE_ENV === "production" || !!process.env.VERCEL || !!process.env.NETLIFY;

  // Load fresh .env values directly from disk in development to bypass memory caching
  const localEnv = !isProduction ? readDotEnv() : {};

  // Priority 1: Read from local env file or process.env
  let owner = localEnv.GITHUB_OWNER || localEnv.CMS_REPO_OWNER || localEnv.VITE_GITHUB_OWNER || process.env.GITHUB_OWNER || process.env.CMS_REPO_OWNER || process.env.VITE_GITHUB_OWNER;
  let repo = localEnv.GITHUB_REPO || localEnv.CMS_REPO_NAME || localEnv.VITE_GITHUB_REPO || process.env.GITHUB_REPO || process.env.CMS_REPO_NAME || process.env.VITE_GITHUB_REPO;
  let branch = localEnv.GITHUB_BRANCH || localEnv.VITE_GITHUB_BRANCH || process.env.GITHUB_BRANCH || process.env.VITE_GITHUB_BRANCH;

  // Priority 2: Read from project YAML configuration files
  const configFiles = ["config.yaml", "app.yaml", "site.yaml", "cms.yaml", "deployment.yaml", "github.yaml"];
  for (const file of configFiles) {
    const filePath = path.resolve(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const parsed = yaml.parse(raw);
        if (parsed && typeof parsed === "object") {
          owner = owner || parsed.github_owner || parsed.owner || parsed.github?.owner || parsed.cms?.owner;
          repo = repo || parsed.github_repo || parsed.repo || parsed.github?.repo || parsed.cms?.repo;
          branch = branch || parsed.github_branch || parsed.branch || parsed.github?.branch || parsed.cms?.branch;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  // Priority 3: Read from deployment platform variables
  if (!owner || !repo) {
    // Vercel
    if (process.env.VERCEL_GIT_REPO_OWNER && process.env.VERCEL_GIT_REPO_SLUG) {
      owner = owner || process.env.VERCEL_GIT_REPO_OWNER;
      repo = repo || process.env.VERCEL_GIT_REPO_SLUG;
    }
    // GitHub Actions
    if (process.env.GITHUB_REPOSITORY) {
      const [ghOwner, ghRepo] = process.env.GITHUB_REPOSITORY.split("/");
      owner = owner || ghOwner;
      repo = repo || ghRepo;
    }
    // Netlify
    if (process.env.REPOSITORY_URL) {
      const match = process.env.REPOSITORY_URL.match(/github\.com\/([^\/]+)\/([^\/.]+)/);
      if (match) {
        owner = owner || match[1];
        repo = repo || match[2];
      }
    }
  }
  branch = branch || process.env.VERCEL_GIT_COMMIT_REF || process.env.HEAD || process.env.BRANCH;

  // Priority 4: Auto-detect from git metadata
  if (!owner || !repo || !branch) {
    try {
      if (!owner || !repo) {
        const remoteUrl = execSync("git remote get-url origin", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
        const match = remoteUrl.match(/github\.com[\/:][^\/]+\/([^\/.]+)(?:\.git)?/);
        const ownerMatch = remoteUrl.match(/github\.com[\/:]([^\/]+)/);
        if (ownerMatch && match) {
          owner = owner || ownerMatch[1];
          repo = repo || match[1].replace(/\.git$/, "");
        }
      }
      if (!branch) {
        branch = execSync("git rev-parse --abbrev-ref HEAD", { encoding: "utf-8", stdio: ["ignore", "pipe", "ignore"] }).trim();
      }
    } catch (e) {
      // ignore
    }
  }

  // Final static fallback
  owner = owner || "Shivanshvyas1729";
  repo = repo || "My_personal_portfolio";
  branch = branch || "main";

  const githubToken = (localEnv.GITHUB_TOKEN || process.env.GITHUB_TOKEN)?.trim();
  const adminPassword = (localEnv.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD)?.trim();
  const adminUsername = (localEnv.ADMIN_USERNAME || process.env.ADMIN_USERNAME)?.trim();
  const cmsMode = localEnv.CMS_MODE || process.env.CMS_MODE;
  const isLocalMode = !isProduction && (cmsMode === "local" || !githubToken);

  return {
    owner,
    repo,
    branch,
    githubToken,
    adminPassword,
    adminUsername,
    isProduction,
    isLocalMode,
  };
}

export function getAdminPassword(): string | undefined {
  return getRuntimeConfig().adminPassword;
}

export function getAdminUsername(): string | undefined {
  return getRuntimeConfig().adminUsername;
}

export function getOwner(): string {
  return getRuntimeConfig().owner;
}

export function getRepo(): string {
  return getRuntimeConfig().repo;
}

export function getBranch(): string {
  return getRuntimeConfig().branch;
}

export function getGithubToken(): string | undefined {
  return getRuntimeConfig().githubToken;
}

export function getIsLocalMode(): boolean {
  return getRuntimeConfig().isLocalMode;
}
