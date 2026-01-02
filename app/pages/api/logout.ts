import type { NextApiRequest, NextApiResponse } from "next";
import { getIronSession } from "iron-session/next";
import { sessionOptions } from "../../lib/session";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getIronSession(req, res, sessionOptions);
  session.destroy();
  res.json({ ok: true });
}