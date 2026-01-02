import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/db";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session/next";
import { sessionOptions, User } from "../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing field(s)" });

  const hash = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
    const info = stmt.run(email, hash);

    const session = await getIronSession(req, res, sessionOptions);
    session.user = { id: info.lastInsertRowid as number, email } as User;
    await session.save();

    return res.json({ ok: true });
  } catch {
    return res.status(400).json({ message: "Email already exists" });
  }
}