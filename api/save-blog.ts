/**
 * api/save-blog.ts — Vercel Serverless Function
 * Delegates all logic to api/_lib/blog-core.ts
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { coreSaveBlog } = await import("./_lib/blog-core.js");

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method Not Allowed" });
    }

    const body     = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const password = body.password;
    const blogData = body.blogData;

    const result = await coreSaveBlog(password, blogData);

    if (result.headers) {
      Object.entries(result.headers).forEach(([k, v]) => res.setHeader(k, v as string));
    }
    return res.status(result.status).json(result.body);
  } catch (err: any) {
    console.error("Unhandled error in Vercel save-blog:", err);
    return res.status(500).json({
      error: "Internal Server Error inside save-blog",
      details: err.message,
      stack: err.stack
    });
  }
}
