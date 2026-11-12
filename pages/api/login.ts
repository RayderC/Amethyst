import type { NextApiRequest, NextApiResponse } from "next";
import db from "../../lib/db";
import bcrypt from "bcryptjs";
import { getApiSession } from "../../lib/auth";
import { checkCsrf } from "../../lib/csrf";
import { clientIp } from "../../lib/clientIp";
import { checkRateLimit } from "../../lib/rateLimit";
import { recordSignIn } from "../../lib/signIns";

// Compared against when the username doesn't exist, so a miss takes as long as a wrong password.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);
const TOO_MANY = "Too many login attempts — try again in a minute";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  if (!checkCsrf(req)) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  if (!checkRateLimit(`login:${clientIp(req)}`, 10, 60_000)) {
    res.status(429).json({ message: TOO_MANY });
    return;
  }

  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    res.status(400).json({ message: "Missing field(s)" });
    return;
  }

  // Accounts are always stored lowercase, so "Admin" and "admin" should sign in the same.
  const name = username.trim().toLowerCase();
  // A per-account limit too, so guessing one password from many addresses still gets slowed down.
  if (!checkRateLimit(`login-user:${name}`, 30, 10 * 60_000)) {
    res.status(429).json({ message: TOO_MANY });
    return;
  }

  const user = db
    .prepare("SELECT id, username, password, is_admin, token_version FROM users WHERE username = ?")
    .get(name) as { id: number; username: string; password: string; is_admin: number; token_version: number } | undefined;

  const matches = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
  if (!user || !matches) {
    if (user) recordSignIn(user.id, req, false);
    res.status(400).json({ message: "Invalid credentials" });
    return;
  }

  const session = await getApiSession(req, res);
  session.user = { id: user.id, username: user.username, isAdmin: user.is_admin === 1, v: user.token_version };
  await session.save();
  recordSignIn(user.id, req);

  res.json({ ok: true });
}
