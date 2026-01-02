import { NextRequest, NextResponse } from "next/server";
import db from "../../lib/db";
import bcrypt from "bcryptjs";
import { getSessionFromRequest } from "../../lib/session";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ message: "Missing field(s)" }, { status: 400 });
  }

  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 400 });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 400 });
  }

  const session = await getSessionFromRequest(req);
  session.id = user.id;
  session.email = user.email;
  await session.save();

  return NextResponse.json({ ok: true });
}