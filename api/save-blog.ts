/**
 * api/save-blog.ts — Vercel Serverless Function (self-contained)
 * Does NOT import from src/lib/ to guarantee correct bundling on Vercel.
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Octokit } from "@octokit/rest";
import yaml from "js-yaml";

const RATE_LIMIT_SECONDS = 30;
const OWNER     = "Shivanshvyas1729";
const REPO      = "My_personal_portfolio";
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
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid Password" });
    }

    // Ping-only (auth check without real data)
    if (!blogData?.title || !blogData?.content || !blogData?.category) {
      return res.status(400).json({ error: "Bad Request: Missing required blog fields" });
    }

    const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

    // ── Rate limit ────────────────────────────────────────────────────────
    try {
      const commits = await octokit.repos.listCommits({
        owner: OWNER, repo: REPO, path: FILE_PATH, per_page: 1,
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
        owner: OWNER, repo: REPO, path: FILE_PATH, ref: "main",
      });
      const fileData = response.data as any;
      if (fileData.type !== "file") throw new Error("Target path is not a file");
      fileSha = fileData.sha;
      decodedContent = Buffer.from(fileData.content, "base64").toString("utf-8");
    } catch (e: any) {
      return res.status(500).json({
        error: `Failed to access GitHub repo. Status: ${e.status}. ${e.message}. Token exists: ${!!process.env.GITHUB_TOKEN}`,
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

    // ── Build new post ────────────────────────────────────────────────────
    let highestId = 0;
    for (const p of parsed.blog) {
      if (p.id && typeof p.id === "number" && p.id > highestId) highestId = p.id;
    }
    const words = blogData.content.trim().split(/\s+/).length;
    const slug  = blogData.title.trim().toLowerCase()
      .replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");

    const newPost = {
      id:          highestId + 1,
      title:       blogData.title.trim(),
      slug,
      readingTime: Math.max(1, Math.ceil(words / 200)),
      content:     blogData.content.trim(),
      category:    blogData.category.trim(),
      type:        Array.isArray(blogData.type) ? blogData.type : [],
      link:        blogData.link?.trim() ?? "",
      date:        today,
      featured:    !!blogData.featured,
      draft:       !!blogData.draft,
      ...(Array.isArray(blogData.resources) && blogData.resources.length > 0
        ? { resources: blogData.resources } : {}),
    };
    parsed.blog.push(newPost);

    // ── Commit ────────────────────────────────────────────────────────────
    const encoded = Buffer.from(yaml.dump(parsed, { indent: 2, lineWidth: -1 }), "utf-8").toString("base64");
    try {
      await octokit.repos.createOrUpdateFileContents({
        owner: OWNER, repo: REPO, path: FILE_PATH,
        message: `chore(blog): add "${newPost.title}" via CMS [skip ci]`,
        content: encoded, sha: fileSha, branch: "main",
      });
    } catch (e: any) {
      return res.status(500).json({ error: "Failed to commit. SHA collision — try again." });
    }

    return res.status(200).json({
      message: "Blog post committed successfully! Deployment skipped (batched).",
      post: { id: newPost.id, slug: newPost.slug, title: newPost.title },
    });

  } catch (err) {
    console.error("Unhandled error in save-blog:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
