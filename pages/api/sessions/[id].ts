import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/db";
import { getApiSession } from "../../../lib/auth";
import { checkCsrf } from "../../../lib/csrf";
import { httpUrl, linkOrEmpty } from "../../../lib/url";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getApiSession(req, res);
  if (!session.user?.isAdmin) return res.status(401).json({ message: "Unauthorized" });

  if (!checkCsrf(req)) return res.status(403).json({ message: "Forbidden" });

  const id = parseInt(req.query.id as string);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid id" });

  if (req.method === "PUT") {
    const { name, url, description, category, icon_url, sort_order } = req.body ?? {};
    if (typeof name !== "string" || !name.trim() || !url) return res.status(400).json({ message: "Name and URL are required" });

    const normalized = httpUrl(url);
    if (!normalized) return res.status(400).json({ message: "Invalid URL" });
    if (linkOrEmpty(icon_url) === null) return res.status(400).json({ message: "Invalid icon URL" });
    const sortOrder = Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0;

    db.prepare(`
      UPDATE service_links
      SET name = ?, url = ?, description = ?, category = ?, icon_url = ?, sort_order = ?
      WHERE id = ?
    `).run(name.slice(0, 200), normalized, typeof description === "string" ? description.slice(0, 2000) : "", typeof category === "string" && category ? category.slice(0, 100) : "General", linkOrEmpty(icon_url), sortOrder, id);

    const link = db.prepare("SELECT * FROM service_links WHERE id = ?").get(id);
    return res.json(link);
  }

  if (req.method === "DELETE") {
    db.prepare("DELETE FROM service_links WHERE id = ?").run(id);
    return res.json({ ok: true });
  }

  res.status(405).end();
}
