import type { VercelRequest, VercelResponse } from "@vercel/node";
import fs from "fs";
import path from "path";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { getUseLocalMode, getOctokit, validateCmsFilePath } = await import("./_lib/cms-core.js");
    const { getOwner, getRepo, getBranch } = await import("./_lib/config.js");

    if (req.method !== "GET") {
      return res.status(405).json({ message: "Method Not Allowed" });
    }

    const filePath = req.query.filePath as string;

    if (!filePath) {
      return res.status(400).json({ error: "Missing filePath" });
    }

    if (!validateCmsFilePath(filePath)) {
      return res.status(403).json({ error: "Unauthorized file path" });
    }

    const queryMode = req.query.mode as string;
    const useLocalMode = queryMode === "local" || getUseLocalMode();

    if (useLocalMode) {
      const absolutePath = path.resolve(process.cwd(), path.normalize(filePath));
      if (!fs.existsSync(absolutePath)) {
        return res.status(404).json({ error: "File not found" });
      }
      const rawContent = fs.readFileSync(absolutePath, "utf-8");
      return res.status(200).json(JSON.parse(rawContent));
    } else {
      const octokit = getOctokit();
      try {
        const response = await octokit.repos.getContent({
          owner: getOwner(),
          repo: getRepo(),
          path: filePath,
          ref: getBranch(),
        });
        const fileData = response.data as any;
        if (fileData.type !== "file") throw new Error("Target is not a file");
        const rawContent = Buffer.from(fileData.content, "base64").toString("utf-8");
        return res.status(200).json(JSON.parse(rawContent));
      } catch (err: any) {
        if (err.status === 404 || err.message === "Not Found" || err.message?.includes("404")) {
          return res.status(200).json([]);
        }
        throw err;
      }
    }
  } catch (err: any) {
    console.error("ERROR in cms-knowledge:", err);
    return res.status(500).json({ 
      error: "Failed to read knowledge file", 
      details: err.message
    });
  }
}
