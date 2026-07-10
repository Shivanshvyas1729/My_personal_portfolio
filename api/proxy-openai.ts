import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for local/cross-origin calls
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { endpoint, payload, customBaseUrl } = req.body;

    if (!endpoint) {
      return res.status(400).json({ error: "Missing endpoint" });
    }

    const apiKey = process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "VITE_OPENAI_API_KEY is not configured on the server environment." });
    }

    const baseUrl = customBaseUrl || process.env.VITE_OPENAI_BASE_URL || "https://api.openai.com/v1";
    
    // Construct target URL safely
    const cleanBaseUrl = baseUrl.replace(/\/$/, "");
    const cleanEndpoint = endpoint.replace(/^\//, "");
    const finalUrl = `${cleanBaseUrl}/${cleanEndpoint}`;

    console.log(`[Proxy] Forwarding request to: ${finalUrl}`);

    const response = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      // If it's plain text or error, try to return it
      try {
        return res.status(response.status).json(JSON.parse(text));
      } catch {
        return res.status(response.status).json({ response: text });
      }
    }
  } catch (err: any) {
    console.error("[Proxy Error]:", err);
    return res.status(500).json({ error: "Proxy call failed", details: err.message });
  }
}
