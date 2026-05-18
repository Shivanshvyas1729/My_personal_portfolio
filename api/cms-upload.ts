import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

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

    let localWriteSuccess = false;

    // 1. Local Write (Always perform locally during development for immediate previews & safety)
    if (isLocalDev) {
      try {
        const uploadsDir = path.resolve(process.cwd(), "public/assets/uploads");
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const absolutePath = path.join(uploadsDir, cleanFileName);
        const buffer = Buffer.from(fileContent, "base64");
        fs.writeFileSync(absolutePath, buffer);
        localWriteSuccess = true;
        console.log(`[CMS UPLOAD] Successfully wrote file locally to: ${absolutePath}`);
      } catch (localErr: any) {
        console.error("[CMS UPLOAD] Failed to write file locally:", localErr);
      }
    }

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

        return res.status(200).json({
          success: true,
          mode: "github",
          url: `/assets/uploads/${cleanFileName}`
        });
      } catch (ghErr: any) {
        console.error("[CMS UPLOAD] GitHub API commit failed:", ghErr);
        
        // If local write succeeded, gracefully fall back and return success!
        if (localWriteSuccess) {
          console.warn("[CMS UPLOAD] Falling back to local filesystem success.");
          return res.status(200).json({
            success: true,
            mode: "local",
            url: `/assets/uploads/${cleanFileName}`,
            warning: `GitHub commit failed (${ghErr.message || ghErr}), but file was saved locally.`
          });
        }
        
        throw ghErr;
      }
    } else {
      // Strict Local Mode
      if (localWriteSuccess) {
        return res.status(200).json({
          success: true,
          mode: "local",
          url: `/assets/uploads/${cleanFileName}`
        });
      } else {
        throw new Error("Local filesystem write failed.");
      }
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

