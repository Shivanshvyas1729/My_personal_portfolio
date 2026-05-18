import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { coreGetCommitData } = await import("./_lib/cms-core.js");

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { filePath, sha } = req.query || {};

    if (!filePath || typeof filePath !== "string") {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required query param: filePath"
      });
    }

    if (!sha || typeof sha !== "string") {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required query param: sha"
      });
    }

    const result = await coreGetCommitData(filePath, sha);

    return res.status(result.success ? 200 : (result.code || 500)).json(result);
  } catch (err: any) {
    console.error("CRITICAL ERROR in cms-commit-content:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Critical server error inside cms-commit-content", 
      details: err.message,
      stack: err.stack 
    });
  }
}
