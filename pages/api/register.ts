import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/db";
import bcrypt from "bcryptjs";
import { getApiSession } from "../../lib/auth";
import { checkCsrf } from "../../lib/csrf";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  if (!checkCsrf(req)) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  const session = await getApiSession(req, res);
  if (!session.user?.isAdmin) {
    res.status(403).json({ message: "Only an administrator may create accounts" });
    return;
  }

  const { username, password, isAdmin } = req.body ?? {};
  if (typeof username !== "string" || !username.trim() || !password) {
    res.status(400).json({ message: "Missing field(s)" });
    return;
  }
  if (username.trim().length > 50) {
    res.status(400).json({ message: "Username must be 50 characters or fewer" });
    return;
  }
  if (typeof password !== "string" || password.length < 8 || password.length > 72) {
    res.status(400).json({ message: "Password must be 8–72 characters" });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  try {
    const stmt = db.prepare("INSERT INTO users (username, password, is_admin) VALUES (?, ?, ?)");
    const info = stmt.run(username.trim().toLowerCase(), hash, isAdmin ? 1 : 0);
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch {
    res.status(400).json({ message: "Username already exists" });
  }
}
