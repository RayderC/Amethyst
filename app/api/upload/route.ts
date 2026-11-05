import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { verify, type SessionData } from "@/lib/auth";
import { sessionOptions } from "@/lib/session";
import { sniffImage, uploadDir } from "@/lib/uploads";
import fs from "fs";
import path from "path";
import { randomBytes } from "crypto";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function sameOrigin(req: NextRequest) {
  if (req.headers.get("sec-fetch-site") === "same-origin") return true;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  const host = req.headers.get("x-forwarded-host")?.split(",")[0].trim() || req.headers.get("host");
  try { return new URL(origin).host === host; } catch { return false; }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ message: "Forbidden" }, { status: 403 });

  const session = verify(await getIronSession<SessionData>(await cookies(), sessionOptions));
  if (!session.user?.isAdmin) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Refuse before reading the body, so an oversized upload can't fill the server's memory.
  if (Number(req.headers.get("content-length")) > MAX_UPLOAD_BYTES + 1024 * 1024) {
    return NextResponse.json({ message: "Images can be up to 25 MB" }, { status: 413 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ message: "No file provided" }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) return NextResponse.json({ message: "Images can be up to 25 MB" }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = sniffImage(buffer);
  if (!ext) {
    return NextResponse.json({ message: "Only JPEG, PNG, GIF, WebP and HEIC images are allowed" }, { status: 400 });
  }

  const filename = `${randomBytes(14).toString("hex")}.${ext}`;
  fs.mkdirSync(uploadDir(), { recursive: true });
  fs.writeFileSync(path.join(uploadDir(), filename), buffer, { flag: "wx" });

  return NextResponse.json({ url: `/uploads/${filename}` });
}
