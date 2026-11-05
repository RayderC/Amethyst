import type { NextApiRequest, NextApiResponse } from "next";
import { getApiSession } from "../../lib/auth";
import { checkCsrf } from "../../lib/csrf";
import { getSiteConfig, setSiteConfigKey } from "../../lib/db";
import { linkOrEmpty } from "../../lib/url";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.json(getSiteConfig());
  }

  if (req.method === "PUT") {
    if (!checkCsrf(req)) return res.status(403).json({ message: "Forbidden" });
    const session = await getApiSession(req, res);
    if (!session.user?.isAdmin) return res.status(403).json({ message: "Forbidden" });

    const { name, badge_title, hero_line1, hero_line2, bio, skills, email, github } = req.body ?? {};
    const text = (v: unknown, max = 200) => (typeof v === "string" ? v.slice(0, max) : "");

    // These two become links on the public home page.
    const githubUrl = linkOrEmpty(github);
    if (githubUrl === null) return res.status(400).json({ message: "GitHub must be an http or https address" });
    if (email && (typeof email !== "string" || !/^[^\s@<>"']+@[^\s@<>"']+\.[^\s@<>"']+$/.test(email))) {
      return res.status(400).json({ message: "That email address doesn't look right" });
    }

    const fields: Record<string, string> = {
      name: text(name),
      badge_title: text(badge_title),
      hero_line1: text(hero_line1),
      hero_line2: text(hero_line2),
      bio: text(bio, 5000),
      skills: JSON.stringify(Array.isArray(skills) ? skills.filter((s) => typeof s === "string").slice(0, 100) : []),
      email: text(email, 254),
      github: githubUrl,
    };

    for (const [key, value] of Object.entries(fields)) {
      setSiteConfigKey(key, value);
    }

    return res.json(getSiteConfig());
  }

  res.status(405).end();
}
