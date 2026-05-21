import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const { fileName, fileContent, role } = req.body;

    if (!fileName || !fileContent) {
      return res.status(400).json({ 
        success: false, 
        error: "Missing required fields: fileName, fileContent" 
      });
    }

    const { useLocalMode, OWNER, REPO, getOctokit } = await import("./_lib/cms-core.js");

    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const targetRelativePath = `public/assets/uploads/${cleanFileName}`;

    const isDeployed = process.env.NODE_ENV === "production" || !!process.env.VERCEL || !!process.env.NETLIFY;
    const isLocalDev = !isDeployed;

    // 2. Persist to GitHub if not in local-only mode
    if (!useLocalMode) {
      try {
        console.log(`[CMS UPLOAD] Initiating GitHub commit for: ${targetRelativePath}`);
        const octokit = getOctokit();
        await octokit.repos.createOrUpdateFileContents({
          owner: OWNER,
          repo: REPO,
          path: targetRelativePath,
          message: `media: upload ${cleanFileName} [skip ci]`,
          content: fileContent, // base64 encoded content
          branch: "main"
        });

        const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/refs/heads/main/${targetRelativePath}`;
        return res.status(200).json({
          success: true,
          mode: "github",
          url: rawUrl
        });
      } catch (ghErr: any) {
        console.error("[CMS UPLOAD] GitHub API commit failed:", ghErr);
        throw ghErr;
      }
    } else {
      // Local mode is disabled for uploads now per user request.
      throw new Error("Local upload mode is disabled.");
    }

  } catch (err: any) {
    console.error("CRITICAL ERROR in cms-upload:", err);
    return res.status(500).json({ 
      success: false, 
      error: "Critical server error inside cms-upload", 
      details: err.message 
    });
  }
}

