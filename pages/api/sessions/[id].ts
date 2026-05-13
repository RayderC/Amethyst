import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions, User } from "../../../lib/session";
import { normalizeUrl } from "../../../lib/url";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<{ user?: User }>(req, res, sessionOptions);
  if (!session.user?.isAdmin) return res.status(401).json({ message: "Unauthorized" });

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });

  if (req.method === "PUT") {
    const { name, url, description, category, icon_url, sort_order } = req.body;
    if (!name || !url) return res.status(400).json({ message: "Name and URL are required" });

    const normalized = normalizeUrl(url);
    try {
      new URL(normalized);
    } catch {
      return res.status(400).json({ message: "Invalid URL" });
    }

    db.prepare(`
      UPDATE service_links
      SET name = ?, url = ?, description = ?, category = ?, icon_url = ?, sort_order = ?
      WHERE id = ?
    `).run(name, normalized, description || "", category || "General", icon_url || "", sort_order ?? 0, id);

    const link = db.prepare("SELECT * FROM service_links WHERE id = ?").get(id);
    return res.json(link);
  }

  if (req.method === "DELETE") {
    db.prepare("DELETE FROM service_links WHERE id = ?").run(id);
    return res.json({ ok: true });
  }

  res.status(405).end();
}
