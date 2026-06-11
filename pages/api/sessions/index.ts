import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions, User } from "../../../lib/session";
import { normalizeUrl } from "../../../lib/url";
import { checkCsrf } from "../../../lib/csrf";

export type ServiceLink = {
  id: number;
  name: string;
  url: string;
  description: string;
  category: string;
  icon_url: string;
  sort_order: number;
  created_at: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession<{ user?: User }>(req, res, sessionOptions);

  // GET is available to any logged-in user; write operations require admin
  if (!session.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    const links = db
      .prepare("SELECT * FROM service_links ORDER BY sort_order ASC, created_at ASC")
      .all() as ServiceLink[];
    return res.json(links);
  }

  if (req.method === "POST") {
    if (!checkCsrf(req)) return res.status(403).json({ message: "Forbidden" });
    if (!session.user.isAdmin) return res.status(403).json({ message: "Forbidden" });
    const { name, url, description, category, icon_url, sort_order } = req.body;
    if (!name || !url) return res.status(400).json({ message: "Name and URL are required" });

    const normalized = normalizeUrl(url);
    try {
      new URL(normalized);
    } catch {
      return res.status(400).json({ message: "Invalid URL" });
    }

    const stmt = db.prepare(`
      INSERT INTO service_links (name, url, description, category, icon_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      name,
      normalized,
      description || "",
      category || "General",
      icon_url || "",
      sort_order ?? 0
    );
    const link = db.prepare("SELECT * FROM service_links WHERE id = ?").get(info.lastInsertRowid);
    return res.status(201).json(link);
  }

  res.status(405).end();
}
