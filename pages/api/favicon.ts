import type { NextApiRequest, NextApiResponse } from "next";

const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url" });
  }

  let origin: string;
  try {
    const normalized = url.startsWith("http") ? url : `https://${url}`;
    origin = new URL(normalized).origin;
  } catch {
    res.setHeader("Content-Type", "image/gif");
    return res.send(TRANSPARENT_GIF);
  }

  // 1. Try fetching the favicon directly from the service (works for local/private hosts)
  try {
    const directRes = await fetch(`${origin}/favicon.ico`, {
      signal: AbortSignal.timeout(3000),
    });
    if (directRes.ok) {
      const contentType = directRes.headers.get("content-type") || "";
      if (contentType.includes("image") || contentType.includes("icon") || contentType.includes("octet-stream")) {
        const buffer = await directRes.arrayBuffer();
        if (buffer.byteLength > 50) {
          res.setHeader("Content-Type", contentType.includes("image") ? contentType : "image/x-icon");
          res.setHeader("Cache-Control", "public, max-age=86400");
          return res.send(Buffer.from(buffer));
        }
      }
    }
  } catch { /* network error or timeout — fall through */ }

  // 2. Fall back to Google's favicon service (works for public internet sites)
  try {
    const googleUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(origin)}&sz=64`;
    const response = await fetch(googleUrl, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) throw new Error("fetch failed");
    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/png";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(Buffer.from(buffer));
  } catch { /* fall through */ }

  // 3. Return transparent GIF as last resort
  res.setHeader("Content-Type", "image/gif");
  res.send(TRANSPARENT_GIF);
}
