import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session";
import { sessionOptions } from "../../lib/session";
import { getSiteConfig, setSiteConfigKey } from "../../lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.json(getSiteConfig());
  }

  if (req.method === "PUT") {
    const session = await getIronSession(req, res, sessionOptions);
    if (!session.user?.isAdmin) return res.status(403).json({ message: "Forbidden" });

    const { name, badge_title, hero_line1, hero_line2, bio, skills, email, github } = req.body;

    const fields: Record<string, string> = {
      name: name ?? "",
      badge_title: badge_title ?? "",
      hero_line1: hero_line1 ?? "",
      hero_line2: hero_line2 ?? "",
      bio: bio ?? "",
      skills: JSON.stringify(Array.isArray(skills) ? skills : []),
      email: email ?? "",
      github: github ?? "",
    };

    for (const [key, value] of Object.entries(fields)) {
      setSiteConfigKey(key, value);
    }

    return res.json(getSiteConfig());
  }

  res.status(405).end();
}
