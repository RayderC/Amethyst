import type { NextApiRequest, NextApiResponse } from "next";
import { getApiSession } from "../../../lib/auth";
import { checkCsrf } from "../../../lib/csrf";
import { getLinkedApps, isAppKey, saveLinkedApp } from "../../../lib/linkedApps";
import { httpUrl } from "../../../lib/url";

/** GET: the linked apps (anyone signed in). PUT { key, url?, hidden? }: change one (admins). */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getApiSession(req, res);
  if (!session.user) return res.status(401).json({ message: "Unauthorized" });
  if (req.method === "GET") return res.json(getLinkedApps());
  if (req.method !== "PUT") return res.status(405).end();
  if (!checkCsrf(req)) return res.status(403).json({ message: "Forbidden" });
  if (!session.user.isAdmin) return res.status(403).json({ message: "Forbidden" });
  const { key, url, hidden } = req.body ?? {};
  if (!isAppKey(key)) return res.status(400).json({ message: "Unknown app" });
  let clean: string | undefined;
  if (url !== undefined) {
    if (url === "" || url === null) clean = "";
    else {
      const u = httpUrl(url);
      if (!u) return res.status(400).json({ message: "The address needs to start with http:// or https://" });
      clean = u.replace(/\/+$/, "");
    }
  }
  saveLinkedApp(key, { url: clean, hidden: typeof hidden === "boolean" ? hidden : undefined });
  res.json(getLinkedApps());
}
