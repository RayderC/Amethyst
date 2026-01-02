import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session/next";
import { sessionOptions } from "../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getIronSession(req, res, sessionOptions);
  if (session.user) {
    res.json(session.user);
  } else {
    res.status(401).json({ user: null });
  }
}