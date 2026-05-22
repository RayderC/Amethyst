import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/db";
import bcrypt from "bcryptjs";
import { getIronSession } from "iron-session";
import { sessionOptions, User } from "../../lib/session";
import { checkRateLimit } from "../../lib/rateLimit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ?? req.socket.remoteAddress ?? "unknown";
  if (!checkRateLimit(`login:${ip}`, 10, 60_000)) {
    res.status(429).json({ message: "Too many login attempts — try again in a minute" });
    return;
  }

  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: "Missing field(s)" });
    return;
  }

  const user = db
    .prepare("SELECT id, username, password, is_admin FROM users WHERE username = ?")
    .get(username) as { id: number; username: string; password: string; is_admin: number } | undefined;

  if (!user) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  if (!bcrypt.compareSync(password, user.password)) {
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  const session = await getIronSession<{ user?: User }>(req, res, sessionOptions);
  session.user = { id: user.id, username: user.username, isAdmin: user.is_admin === 1 } as User;
  await session.save();

  res.json({ ok: true });
}
