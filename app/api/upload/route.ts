import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { sessionOptions } from "@/lib/session";
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getIronSession(await cookies(), sessionOptions);
  if (!session.user?.isAdmin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ message: "No file provided" }, { status: 400 });

  const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg", "image/heic", "image/heif"];
  if (!allowed.includes(file.type)) {
    return NextResponse.json({ message: "Only image files are allowed" }, { status: 400 });
  }

  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const filename = `${randomBytes(14).toString("hex")}${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  fs.mkdirSync(uploadDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(uploadDir, filename), buffer);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
