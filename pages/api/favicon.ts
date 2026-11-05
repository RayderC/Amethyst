import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/db";
import { getApiSession } from "../../lib/auth";

const TRANSPARENT_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);
const MAX_ICON_BYTES = 1024 * 1024;

// SVG is left out because it can contain script, and this response comes from the site's own address.
const ICON_TYPES = new Set(["image/png", "image/jpeg", "image/gif", "image/webp", "image/x-icon", "image/vnd.microsoft.icon"]);

const PRIVATE_HOST = /^(localhost|.*\.local|.*\.lan|.*\.internal|.*\.home\.arpa|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|\[)/i;

function sendBlank(res: NextApiResponse) {
  res.setHeader("Content-Type", "image/gif");
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.send(TRANSPARENT_GIF);
}

/** Only sites an admin already added to the hub, or this would let anyone probe the home network through the server. */
function isKnownService(origin: string): boolean {
  const rows = db.prepare("SELECT url FROM service_links").all() as { url: string }[];
  return rows.some((r) => {
    try { return new URL(r.url).origin === origin; } catch { return false; }
  });
}

async function fetchIcon(url: string, timeoutMs: number): Promise<{ type: string; body: Buffer } | null> {
  const r = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!r.ok) return null;
  const raw = (r.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  const type = raw === "application/octet-stream" ? "image/x-icon" : raw;
  if (!ICON_TYPES.has(type)) return null;
  if (Number(r.headers.get("content-length") ?? 0) > MAX_ICON_BYTES) return null;
  const body = Buffer.from(await r.arrayBuffer());
  return body.length > 50 && body.length <= MAX_ICON_BYTES ? { type, body } : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getApiSession(req, res);
  if (!session.user) return res.status(401).json({ error: "Login required" });

  const { url } = req.query;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "Missing url" });
  }

  let parsed: URL;
  try {
    parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("bad protocol");
  } catch {
    return sendBlank(res);
  }

  // Admins can preview an icon before saving a new link.
  if (!session.user.isAdmin && !isKnownService(parsed.origin)) return sendBlank(res);

  let icon: { type: string; body: Buffer } | null = null;
  // 1. Try the service itself (works for local/private hosts)
  try { icon = await fetchIcon(`${parsed.origin}/favicon.ico`, 3000); } catch { /* network error or timeout */ }

  // 2. Fall back to Google's favicon service. Private hostnames are never sent to Google.
  if (!icon && !PRIVATE_HOST.test(parsed.hostname)) {
    try {
      icon = await fetchIcon(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(parsed.origin)}&sz=64`, 5000);
    } catch { /* fall through */ }
  }

  if (!icon) return sendBlank(res);
  res.setHeader("Content-Type", icon.type);
  res.setHeader("Cache-Control", "private, max-age=86400");
  res.send(icon.body);
}
