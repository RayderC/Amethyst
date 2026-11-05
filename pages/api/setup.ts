import type { NextApiRequest, NextApiResponse } from "next";
import db, { userCount } from "../../lib/db";
import bcrypt from "bcryptjs";
import { getApiSession } from "../../lib/auth";
import { checkCsrf } from "../../lib/csrf";
import { clientIp } from "../../lib/clientIp";
import { checkRateLimit } from "../../lib/rateLimit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    res.json({ needsSetup: userCount() === 0 });
    return;
  }

  if (req.method !== "POST") {
    res.status(405).end();
    return;
  }
  if (!checkCsrf(req)) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  if (!checkRateLimit(`setup:${clientIp(req)}`, 10, 60_000)) {
    res.status(429).json({ message: "Slow down" });
    return;
  }

  const { username, password } = req.body ?? {};
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    res.status(400).json({ message: "Missing field(s)" });
    return;
  }
  const name = username.trim().toLowerCase();
  if (name.length < 2 || name.length > 50) {
    res.status(400).json({ message: "Username must be 2–50 characters" });
    return;
  }
  if (password.length < 8 || password.length > 72) {
    res.status(400).json({ message: "Password must be 8–72 characters" });
    return;
  }

  const hash = bcrypt.hashSync(password, 10);
  // Checking and creating in one transaction means two simultaneous requests can't both become admin.
  const info = db.transaction(() => {
    if (userCount() > 0) return null;
    return db.prepare("INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)").run(name, hash);
  }).immediate();
  if (!info) {
    res.status(403).json({ message: "Setup has already been completed" });
    return;
  }

  const session = await getApiSession(req, res);
  session.user = { id: info.lastInsertRowid as number, username: name, isAdmin: true };
  await session.save();

  res.json({ ok: true });
}
