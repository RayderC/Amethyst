import type { NextApiRequest, NextApiResponse } from "next";
import { getSiteConfig, setSiteConfigKey } from "../../../lib/db";
import { requireAdmin } from "../../../lib/opsApi";
import { isGoodSecret, newSecret } from "../../../lib/ssoCore";

/** GET: the shared secret (admins only, to paste into the other apps). POST: make a new one. DELETE: turn shared login off. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(await requireAdmin(req, res))) return;
  if (req.method === "POST") setSiteConfigKey("sso_secret", newSecret());
  else if (req.method === "DELETE") setSiteConfigKey("sso_secret", "");
  else if (req.method !== "GET") return res.status(405).end();
  const s = getSiteConfig().sso_secret;
  res.setHeader("Cache-Control", "no-store");
  res.json({ enabled: isGoodSecret(s), secret: isGoodSecret(s) ? s : null });
}
