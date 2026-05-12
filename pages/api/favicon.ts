import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url" });
  }

  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    const origin = new URL(normalized).origin;
    // Try Google's favicon service as the most reliable source
    const googleUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`;
    const response = await fetch(googleUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("fetch failed");
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.send(Buffer.from(buffer));
  } catch {
    // Return a 1x1 transparent gif as fallback
    res.setHeader("Content-Type", "image/gif");
    res.send(Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64"));
  }
}
