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
  const row = db.prepare("SELECT id, username, is_admin, token_version FROM users WHERE id = ?").get(session.user.id) as
    | { id: number; username: string; is_admin: number; token_version: number }
    | undefined;
  // Sessions from before token versions existed count as version 0.
  if (row && (session.user.v ?? 0) === row.token_version) {
    session.user = { id: row.id, username: row.username, isAdmin: row.is_admin === 1, v: row.token_version };
  } else session.destroy();
  return session;
}

/** For pages/api routes. */
export async function getApiSession(req: NextApiRequest, res: NextApiResponse) {
  return verify(await getIronSession<SessionData>(req, res, sessionOptions));
}
