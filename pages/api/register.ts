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

  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Missing field(s)" });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
    const info = stmt.run(email, hash);

    const session = await getIronSession(req, res, sessionOptions);
    session.user = { id: info.lastInsertRowid as number, email } as User;
    await session.save();

    res.json({ ok: true });
  } catch {
    res.status(400).json({ message: "Email already exists" });
  }
}