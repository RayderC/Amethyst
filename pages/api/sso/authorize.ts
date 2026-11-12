import type { NextApiRequest, NextApiResponse } from "next";
import { getApiSession } from "../../../lib/auth";
import { checkCsrf } from "../../../lib/csrf";
import { getSiteConfig } from "../../../lib/db";
import { appName, getLinkedApps } from "../../../lib/linkedApps";
import { isGoodSecret, signPass } from "../../../lib/ssoCore";

/**
 * GET ?app&return: what the confirm page shows. POST { app, return, state }: a signed pass and where to send it.
 * `return` must be the other app's /api/sso/callback; the pass only works at that address, for that attempt.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getApiSession(req, res);
  if (!session.user) return res.status(401).json({ message: "Sign in first" });
  const secret = getSiteConfig().sso_secret;
  if (!isGoodSecret(secret)) return res.status(400).json({ message: "Shared login isn't set up here yet. An admin can turn it on in the dashboard under System." });
  const src = req.method === "POST" ? (req.body ?? {}) : req.query;
  const app = typeof src.app === "string" ? src.app : "";
  const ret = typeof src.return === "string" ? src.return : "";
  let target: URL;
  try { target = new URL(ret); } catch { return res.status(400).json({ message: "That sign-in link is broken." }); }
  if (!/^https?:$/.test(target.protocol) || target.pathname !== "/api/sso/callback" || target.username || target.password) {
    return res.status(400).json({ message: "That sign-in link is broken." });
  }
  const known = getLinkedApps().some(a => { try { return new URL(a.url).origin === target.origin; } catch { return false; } });
  const info = { app: appName(app), origin: target.origin, username: session.user.username, known };
  if (req.method === "GET") return res.json(info);
  if (req.method !== "POST") return res.status(405).end();
  if (!checkCsrf(req)) return res.status(403).json({ message: "Forbidden" });
  const state = typeof src.state === "string" && /^[\w-]{16,100}$/.test(src.state) ? src.state : "";
  if (!state || !app) return res.status(400).json({ message: "That sign-in link is broken." });
  const token = signPass(secret, { sub: session.user.username.toLowerCase(), app, aud: target.origin, nonce: state });
  target.search = new URLSearchParams({ token, state }).toString();
  res.json({ redirect: target.toString() });
}
