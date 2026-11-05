import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/db";
import { getApiSession } from "../../../lib/auth";
import { checkCsrf } from "../../../lib/csrf";
import { cleanProject, type Project } from "./index";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = Number(req.query.id);
  if (!Number.isInteger(id)) return res.status(400).json({ message: "Invalid id" });

  if (req.method === "GET") {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as Project | undefined;
    if (!project) return res.status(404).json({ message: "Not found" });
    return res.json(project);
  }

  if (req.method === "PUT") {
    if (!checkCsrf(req)) return res.status(403).json({ message: "Forbidden" });
    const session = await getApiSession(req, res);
    if (!session.user?.isAdmin) return res.status(403).json({ message: "Forbidden" });

    const p = cleanProject(req.body ?? {});
    if (typeof p === "string") return res.status(400).json({ message: p });

    db.prepare(`
      UPDATE projects
      SET title = ?, description = ?, content = ?, tech_stack = ?,
          github_url = ?, live_url = ?, image_url = ?, gallery = ?, youtube_url = ?, featured = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(p.title, p.description, p.content, p.tech_stack, p.github_url, p.live_url, p.image_url, p.gallery, p.youtube_url, p.featured, id);

    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as Project;
    return res.json(project);
  }

  if (req.method === "DELETE") {
    if (!checkCsrf(req)) return res.status(403).json({ message: "Forbidden" });
    const session = await getApiSession(req, res);
    if (!session.user?.isAdmin) return res.status(403).json({ message: "Forbidden" });

    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    return res.json({ ok: true });
  }

  res.status(405).end();
}
