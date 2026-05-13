import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/db";
import { getIronSession } from "iron-session";
import { sessionOptions, User } from "../../../lib/session";

export type Project = {
  id: number;
  title: string;
  slug: string;
  description: string;
  content: string;
  tech_stack: string;
  github_url: string;
  live_url: string;
  image_url: string;
  gallery: string;
  youtube_url: string;
  featured: number;
  created_at: string;
  updated_at: string;
};

function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function uniqueSlug(title: string): string {
  let slug = createSlug(title);
  let counter = 0;
  while (db.prepare("SELECT id FROM projects WHERE slug = ?").get(slug)) {
    counter++;
    slug = `${createSlug(title)}-${counter}`;
  }
  return slug;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const projects = db
      .prepare("SELECT * FROM projects ORDER BY created_at DESC")
      .all() as Project[];
    return res.json(projects);
  }

  if (req.method === "POST") {
    const session = await getIronSession<{ user?: User }>(req, res, sessionOptions);
    if (!session.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { title, description, content, tech_stack, github_url, live_url, image_url, gallery, youtube_url, featured } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    const slug = uniqueSlug(title);
    const stmt = db.prepare(`
      INSERT INTO projects (title, slug, description, content, tech_stack, github_url, live_url, image_url, gallery, youtube_url, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      title,
      slug,
      description || "",
      content || "",
      JSON.stringify(tech_stack || []),
      github_url || "",
      live_url || "",
      image_url || "",
      JSON.stringify(gallery || []),
      youtube_url || "",
      featured ? 1 : 0
    );

    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(info.lastInsertRowid) as Project;
    return res.status(201).json(project);
  }

  res.status(405).end();
}
