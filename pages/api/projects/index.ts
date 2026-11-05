import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../../lib/db";
import { getApiSession } from "../../../lib/auth";
import { linkOrEmpty } from "../../../lib/url";
import { checkCsrf } from "../../../lib/csrf";

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

/** Everything a project form can send, checked. Returns an error message or the clean values. */
export function cleanProject(b: Record<string, unknown>) {
  if (typeof b.title !== "string" || !b.title.trim()) return "Title is required";
  if (b.title.length > 200) return "Title must be 200 characters or fewer";
  for (const key of ["github_url", "live_url", "image_url", "youtube_url"]) {
    if (linkOrEmpty(b[key]) === null) return `${key.replace("_url", "")} link must be an http or https address`;
  }
  const gallery = Array.isArray(b.gallery) ? b.gallery : [];
  if (gallery.length > 100 || gallery.some((g) => !linkOrEmpty(g))) return "Gallery images must be http or https addresses";
  const tech = Array.isArray(b.tech_stack) ? b.tech_stack : [];
  if (tech.length > 100 || tech.some((t) => typeof t !== "string" || t.length > 100)) return "Invalid tech stack";
  const text = (v: unknown) => (typeof v === "string" ? v : "");
  return {
    title: b.title,
    description: text(b.description).slice(0, 5000),
    content: text(b.content).slice(0, 500_000),
    tech_stack: JSON.stringify(tech),
    github_url: linkOrEmpty(b.github_url) as string,
    live_url: linkOrEmpty(b.live_url) as string,
    image_url: linkOrEmpty(b.image_url) as string,
    gallery: JSON.stringify(gallery),
    youtube_url: linkOrEmpty(b.youtube_url) as string,
    featured: b.featured ? 1 : 0,
  };
}

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
    if (!checkCsrf(req)) return res.status(403).json({ message: "Forbidden" });
    const session = await getApiSession(req, res);
    if (!session.user?.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const p = cleanProject(req.body ?? {});
    if (typeof p === "string") return res.status(400).json({ message: p });

    const slug = uniqueSlug(p.title);
    const info = db.prepare(`
      INSERT INTO projects (title, slug, description, content, tech_stack, github_url, live_url, image_url, gallery, youtube_url, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(p.title, slug, p.description, p.content, p.tech_stack, p.github_url, p.live_url, p.image_url, p.gallery, p.youtube_url, p.featured);

    const project = db.prepare("SELECT * FROM projects WHERE id = ?").get(info.lastInsertRowid) as Project;
    return res.status(201).json(project);
  }

  res.status(405).end();
}
