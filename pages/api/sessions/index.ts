import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/db";
import { getApiSession } from "../../../lib/auth";
import { checkCsrf } from "../../../lib/csrf";
import { httpUrl, linkOrEmpty } from "../../../lib/url";

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
  const session = await getApiSession(req, res);

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
    const { name, url, description, category, icon_url, sort_order } = req.body ?? {};
    if (typeof name !== "string" || !name.trim() || !url) return res.status(400).json({ message: "Name and URL are required" });

    const normalized = httpUrl(url);
    if (!normalized) return res.status(400).json({ message: "Invalid URL" });
    if (linkOrEmpty(icon_url) === null) return res.status(400).json({ message: "Invalid icon URL" });
    const sortOrder = Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0;

    const stmt = db.prepare(`
      INSERT INTO service_links (name, url, description, category, icon_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      name.slice(0, 200),
      normalized,
      typeof description === "string" ? description.slice(0, 2000) : "",
      typeof category === "string" && category ? category.slice(0, 100) : "General",
      linkOrEmpty(icon_url),
      sortOrder
    );
    const link = db.prepare("SELECT * FROM service_links WHERE id = ?").get(info.lastInsertRowid);
    return res.status(201).json(link);
  }

  res.status(405).end();
}
