import { getIronSession, type IronSession } from "iron-session";
import type { NextApiRequest, NextApiResponse } from "next";
import db from "./db";
import { sessionOptions, type User } from "./session";

export type SessionData = { user?: User };

/**
 * Checks the session cookie against the current account. The cookie alone would keep a deleted
 * admin working until it expired.
 */
export function verify(session: IronSession<SessionData>) {
  if (!session.user) return session;
  const row = db.prepare("SELECT id, username, is_admin FROM users WHERE id = ?").get(session.user.id) as
    | { id: number; username: string; is_admin: number }
    | undefined;
  if (row) session.user = { id: row.id, username: row.username, isAdmin: row.is_admin === 1 };
  else session.destroy();
  return session;
}

/** For pages/api routes. */
export async function getApiSession(req: NextApiRequest, res: NextApiResponse) {
  return verify(await getIronSession<SessionData>(req, res, sessionOptions));
}
