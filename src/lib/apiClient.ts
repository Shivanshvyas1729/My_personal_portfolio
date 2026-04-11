/**
 * src/lib/apiClient.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Platform-aware API client.
 *
 * On Vercel  → calls /api/save-blog  and /api/delete-blog
 * On Netlify → Netlify redirect rules map /api/* → /.netlify/functions/*
 *              so the frontend URL is IDENTICAL — no change needed!
 *
 * The VITE_PLATFORM env var is optional. If absent we default to the /api/
 * path which works on both platforms thanks to netlify.toml redirects.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE = "/api"; // works on Vercel natively; Netlify redirect handles it

export const API_ROUTES = {
  saveBlog:   `${BASE}/save-blog`,
  deleteBlog: `${BASE}/delete-blog`,
} as const;

/** Shared fetch wrapper — returns parsed JSON or throws with a clean message */
export async function apiFetch<T = Record<string, unknown>>(
  url: string,
  body: Record<string, unknown>,
): Promise<{ ok: boolean; status: number; data: T }> {
  const response = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    throw new Error(
      `API at ${url} returned HTML instead of JSON. ` +
      `Ensure the dev server is running with localApiProxy (npm run dev).`,
    );
  }

  const data = (await response.json()) as T;
  return { ok: response.ok, status: response.status, data };
}
