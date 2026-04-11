/**
 * api/delete-blog.ts — Vercel serverless adapter
 * Delegates all logic to src/lib/blog-core.ts
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { coreDeleteBlog } from "../src/lib/blog-core";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  try {
    const body   = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const result = await coreDeleteBlog(body.password, body.postId, body.postSlug);

    if (result.headers) {
      Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v));
    }
    return res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Unhandled error in Vercel delete-blog:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
