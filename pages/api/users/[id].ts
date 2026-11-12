import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import db, { adminCount } from "../../../lib/db";
import { getApiSession } from "../../../lib/auth";
import { checkCsrf } from "../../../lib/csrf";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!checkCsrf(req)) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }
  const session = await getApiSession(req, res);
  if (!session.user?.isAdmin) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const id = Number(req.query.id);
  if (!Number.isFinite(id)) {
    res.status(400).json({ message: "Invalid id" });
    return;
  }

  if (req.method === "DELETE") {
    const target = db.prepare("SELECT is_admin FROM users WHERE id = ?").get(id) as { is_admin: number } | undefined;
    if (!target) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (target.is_admin === 1 && adminCount() <= 1) {
      res.status(400).json({ message: "Cannot delete the last remaining admin" });
      return;
    }
    db.prepare("DELETE FROM users WHERE id = ?").run(id);
    res.json({ ok: true });
    return;
  }

  // Edit an account: rename it, set a new password (which signs it out everywhere), or change admin.
  if (req.method === "PATCH") {
    const { username, password, isAdmin } = req.body ?? {};
    let cleanUsername: string | undefined;
    let hash: string | undefined;
    if (username !== undefined) {
      if (typeof username !== "string" || username.trim().length < 2 || username.trim().length > 50 || /\s/.test(username.trim())) {
        res.status(400).json({ message: "Username must be 2–50 characters, with no spaces" });
        return;
      }
      cleanUsername = username.trim().toLowerCase();
    }
    if (password !== undefined && password !== "") {
      if (typeof password !== "string" || password.length < 8 || password.length > 72) {
        res.status(400).json({ message: "Password must be 8–72 characters" });
        return;
      }
      hash = bcrypt.hashSync(password, 10);
    }
    if (cleanUsername === undefined && hash === undefined && typeof isAdmin !== "boolean") {
      res.status(400).json({ message: "Nothing to change" });
      return;
    }
    const result = db.transaction(() => {
      const target = db.prepare("SELECT id, is_admin FROM users WHERE id = ?").get(id) as { id: number; is_admin: number } | undefined;
      if (!target) return "not_found";
      if (isAdmin === false && target.is_admin === 1 && adminCount() <= 1) return "last_admin";
      if (cleanUsername !== undefined) {
        const taken = db.prepare("SELECT id FROM users WHERE username = ?").get(cleanUsername) as { id: number } | undefined;
        if (taken && taken.id !== id) return "taken";
        db.prepare("UPDATE users SET username = ? WHERE id = ?").run(cleanUsername, id);
      }
      if (hash !== undefined) db.prepare("UPDATE users SET password = ?, token_version = token_version + 1 WHERE id = ?").run(hash, id);
      if (typeof isAdmin === "boolean") db.prepare("UPDATE users SET is_admin = ? WHERE id = ?").run(isAdmin ? 1 : 0, id);
      return "ok";
    })();
    if (result === "not_found") { res.status(404).json({ message: "User not found" }); return; }
    if (result === "last_admin") { res.status(400).json({ message: "There must always be at least one admin" }); return; }
    if (result === "taken") { res.status(400).json({ message: "That username is taken" }); return; }
    // An admin resetting their own password stays signed in on this device.
    if (hash !== undefined && id === session.user.id) {
      session.user.v = (session.user.v ?? 0) + 1;
      await session.save();
    }
    res.json({ ok: true });
    return;
  }

  res.status(405).end();
}
