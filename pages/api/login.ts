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

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    res.status(400).json({ message: "User not found" });
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  const session = await getIronSession(req, res, sessionOptions);
  session.user = { id: user.id, email: user.email } as User;
  await session.save();

  res.json({ ok: true });
}