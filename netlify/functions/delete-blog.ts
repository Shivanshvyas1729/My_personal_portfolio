/**
 * netlify/functions/delete-blog.ts — Netlify Functions adapter
 * Delegates all logic to src/lib/blog-core.ts
 * Exposes identical API response contract as the Vercel version.
 */
import type { Handler, HandlerEvent } from "@netlify/functions";
import { coreDeleteBlog } from "../../src/lib/blog-core";

export const handler: Handler = async (event: HandlerEvent) => {
  // ── Method guard ──────────────────────────────────────────────────────────
  if (event.httpMethod !== "POST" && event.httpMethod !== "DELETE") {
    return {
      statusCode: 405,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body   = JSON.parse(event.body || "{}");
    const result = await coreDeleteBlog(body.password, body.postId, body.postSlug);

    return {
      statusCode: result.status,
      headers: {
        "Content-Type": "application/json",
        ...(result.headers ?? {}),
      },
      body: JSON.stringify(result.body),
    };
  } catch (err) {
    console.error("Unhandled error in Netlify delete-blog:", err);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
