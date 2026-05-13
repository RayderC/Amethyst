import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions, User } from "../../../lib/session";
import type { Project } from "./index";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as Project | undefined;
    if (!project) return res.status(404).json({ message: "Not found" });
    return res.json(project);
  }

  if (req.method === "PUT") {
    const session = await getIronSession<{ user?: User }>(req, res, sessionOptions);
    if (!session.user?.isAdmin) return res.status(403).json({ message: "Forbidden" });

    const { title, description, content, tech_stack, github_url, live_url, image_url, gallery, youtube_url, featured } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    db.prepare(`
      UPDATE projects
      SET title = ?, description = ?, content = ?, tech_stack = ?,
          github_url = ?, live_url = ?, image_url = ?, gallery = ?, youtube_url = ?, featured = ?,
          updated_at = datetime('now')
      WHERE id = ?
    `).run(
      title,
      description || "",
      content || "",
      JSON.stringify(tech_stack || []),
      github_url || "",
      live_url || "",
      image_url || "",
      JSON.stringify(gallery || []),
      youtube_url || "",
      featured ? 1 : 0,
      id
    );

    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(id) as Project;
    return res.json(project);
  }

  if (req.method === "DELETE") {
    const session = await getIronSession<{ user?: User }>(req, res, sessionOptions);
    if (!session.user?.isAdmin) return res.status(403).json({ message: "Forbidden" });

    db.prepare("DELETE FROM projects WHERE id = ?").run(id);
    return res.json({ ok: true });
  }

  res.status(405).end();
}
