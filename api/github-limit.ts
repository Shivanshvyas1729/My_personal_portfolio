import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Octokit } from "@octokit/rest";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: token });
    const response = await octokit.rateLimit.get();
    
    // Add cache-control to prevent browser edge caching on this specific endpoint
    res.setHeader("Cache-Control", "no-store, max-age=0");
    
    return res.status(200).json({ success: true, data: response.data });
  } catch (err: any) {
    console.error("Error in github-limit endpoint:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
