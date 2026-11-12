import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/db";
import { getApiSession } from "../../../lib/auth";
import { getLinkedApps } from "../../../lib/linkedApps";

type Status = "up" | "down";
const cache = new Map<string, { status: Status; at: number }>();
const FRESH = 60_000;

/**
 * Whether each address answers, as seen from this server. Any reply counts, even a login page or an error page;
 * only no reply at all is "down". Addresses are ones an admin saved, and only up or down comes back.
 * The Hub also checks from your browser, because "localhost" here means this container, not your server.
 */
async function check(url: string): Promise<Status> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < FRESH) return hit.status;
  let status: Status = "down";
  try {
    const r = await fetch(url, { method: "GET", redirect: "manual", signal: AbortSignal.timeout(4000), headers: { "User-Agent": "Amethyst hub status" } });
    status = r.status < 500 ? "up" : "down";
    await r.body?.cancel().catch(() => {});
  } catch { /* no answer */ }
  cache.set(url, { status, at: Date.now() });
  if (cache.size > 500) cache.delete(cache.keys().next().value!);
  return status;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();
  const session = await getApiSession(req, res);
  if (!session.user) return res.status(401).json({ message: "Unauthorized" });
  const apps = getLinkedApps().filter(a => !a.hidden);
  const links = db.prepare("SELECT id, url FROM service_links").all() as { id: number; url: string }[];
  const [appStatus, linkStatus] = await Promise.all([
    Promise.all(apps.map(async a => [a.key, await check(a.url)] as const)),
    Promise.all(links.map(async l => [String(l.id), await check(l.url)] as const)),
  ]);
  res.setHeader("Cache-Control", "no-store");
  res.json({ apps: Object.fromEntries(appStatus), links: Object.fromEntries(linkStatus) });
}
