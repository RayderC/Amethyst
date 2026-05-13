import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/db";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { sessionOptions, User } from "../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const session = await getIronSession<{ user?: User }>(req, res, sessionOptions);
  if (!session.user?.isAdmin) {
    res.status(403).json({ message: "Only an administrator may create accounts" });
    return;
  }

  const { email, password, isAdmin } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Missing field(s)" });
    return;
  }
  if (typeof password !== "string" || password.length < 8) {
    res.status(400).json({ message: "Password must be at least 8 characters" });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare("INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)");
    const info = stmt.run(email, hash, isAdmin ? 1 : 0);
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch {
    res.status(400).json({ message: "Email already exists" });
  }
}
