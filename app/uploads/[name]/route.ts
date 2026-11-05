import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { UPLOAD_TYPES, uploadDir } from "@/lib/uploads";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ name: string }> }) {
  const { name } = await ctx.params;
  const m = /^[a-f0-9]+\.([a-z0-9]+)$/.exec(name);
  const type = m && UPLOAD_TYPES[m[1]];
  if (!type) return new NextResponse("Not found", { status: 404 });
  try {
    const bytes = await fs.readFile(path.join(uploadDir(), name));
    return new NextResponse(new Uint8Array(bytes), {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
