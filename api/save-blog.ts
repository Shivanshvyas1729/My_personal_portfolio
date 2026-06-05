/**
 * api/save-blog.ts — Vercel Serverless Function (self-contained)
 * Does NOT import from src/lib/ to guarantee correct bundling on Vercel.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Octokit } from "@octokit/rest";
import yaml from "js-yaml";
import { getAdminPassword, getOwner, getRepo, getBranch, getGithubToken } from "./_lib/config.js";

const RATE_LIMIT_SECONDS = 30;
const FILE_PATH = "src/data/blog.yaml";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const body     = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const password = body.password;
    const blogData = body.blogData;

    // ── Auth ──────────────────────────────────────────────────────────────
    const adminPassword = getAdminPassword();
    if (!password || !adminPassword || password !== adminPassword) {
      return res.status(401).json({ error: "Invalid Password" });
    }

    // Ping-only (auth check without real data)
    if (!blogData?.title || !blogData?.content || !blogData?.category) {
      return res.status(400).json({ error: "Bad Request: Missing required blog fields" });
    }

    const octokit = new Octokit({ auth: getGithubToken() });

    // ── Rate limit ────────────────────────────────────────────────────────
    try {
      const commits = await octokit.repos.listCommits({
        owner: getOwner(), repo: getRepo(), path: FILE_PATH, per_page: 1,
      });
      if (commits.data.length > 0) {
        const lastDate = commits.data[0].commit.committer?.date;
        if (lastDate) {
          const elapsed = (Date.now() - new Date(lastDate).getTime()) / 1000;
          if (elapsed < RATE_LIMIT_SECONDS) {
            const retryAfter = Math.ceil(RATE_LIMIT_SECONDS - elapsed);
            res.setHeader("Retry-After", String(retryAfter));
            return res.status(429).json({ error: `Rate limited. Wait ${retryAfter}s.`, retryAfter });
          }
        }
      }
    } catch (e: any) {
      console.warn("Rate-limit check failed (non-fatal):", e.message);
    }

    // ── Fetch blog.yaml ───────────────────────────────────────────────────
    let fileSha = "", decodedContent = "";
    try {
      const response = await octokit.repos.getContent({
        owner: getOwner(), repo: getRepo(), path: FILE_PATH, ref: getBranch(),
      });
      const fileData = response.data as any;
      if (fileData.type !== "file") throw new Error("Target path is not a file");
      fileSha = fileData.sha;
      decodedContent = Buffer.from(fileData.content, "base64").toString("utf-8");
    } catch (e: any) {
      return res.status(500).json({
        error: `Failed to access GitHub repo. Status: ${e.status}. ${e.message}. Token exists: ${!!getGithubToken()}`,
      });
    }

    // ── Parse YAML ────────────────────────────────────────────────────────
    let parsed: any;
    try {
      parsed = yaml.load(decodedContent);
      if (!parsed || typeof parsed !== "object") parsed = { blog: [] };
      if (!Array.isArray(parsed.blog)) parsed.blog = [];
    } catch {
      return res.status(500).json({ error: "Failed to parse existing YAML data." });
    }

    // ── Duplicate check ───────────────────────────────────────────────────
    const today = new Date().toISOString().split("T")[0];
    const isDuplicate = parsed.blog.some(
      (p: any) => p.title.toLowerCase() === blogData.title.trim().toLowerCase() && p.date === today,
    );
    if (isDuplicate) return res.status(409).json({ error: "Duplicate blog entry detected for today." });

    // ── Build post object ────────────────────────────────────────────────
    const words = blogData.content.trim().split(/\s+/).length;
    const slug  = blogData.title.trim().toLowerCase()
      .replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
    
    const readingTime = Math.max(1, Math.ceil(words / 200));
    const date = blogData.date || today;

    const postPayload = {
      title:       blogData.title.trim(),
      slug:        blogData.slug || slug,
      readingTime: blogData.readingTime || readingTime,
      content:     blogData.content.trim(),
      category:    blogData.category.trim(),
      type:        Array.isArray(blogData.type) ? blogData.type : [],
      link:        blogData.link?.trim() ?? "",
      date:        date,
      featured:    !!blogData.featured,
      draft:       !!blogData.draft,
      ...(Array.isArray(blogData.resources) && blogData.resources.length > 0
        ? { resources: blogData.resources } : {}),
    };

    let finalPost: any;
    const existingIndex = blogData.id ? parsed.blog.findIndex((p: any) => p.id === blogData.id) : -1;

    if (existingIndex > -1) {
      // Update existing
      finalPost = { ...parsed.blog[existingIndex], ...postPayload };
      parsed.blog[existingIndex] = finalPost;
    } else {
      // Build new post
      let highestId = 0;
      for (const p of parsed.blog) {
        if (p.id && typeof p.id === "number" && p.id > highestId) highestId = p.id;
      }
      finalPost = { id: highestId + 1, ...postPayload };
      parsed.blog.push(finalPost);
    }

    // ── Commit ────────────────────────────────────────────────────────────
    const action = existingIndex > -1 ? "update" : "add";
    const encoded = Buffer.from(yaml.dump(parsed, { indent: 2, lineWidth: -1 }), "utf-8").toString("base64");
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner: getOwner(), repo: getRepo(), path: FILE_PATH,
        message: `chore(blog): ${action} "${finalPost.title}" via CMS [skip ci]`,
        content: encoded, sha: fileSha, branch: getBranch(),
      });
    } catch (e: any) {
      return res.status(500).json({ error: "Failed to commit. SHA collision — try again." });
    }

    return res.status(200).json({
      message: `Blog post ${action}ed successfully!`,
      post: { id: finalPost.id, slug: finalPost.slug, title: finalPost.title },
    });

  } catch (err) {
    console.error("Unhandled error in save-blog:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
