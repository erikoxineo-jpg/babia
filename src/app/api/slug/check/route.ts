import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug || slug.length < 3) {
    return NextResponse.json({ available: false, reason: "Mínimo 3 caracteres." });
  }

  const existing = await prisma.tenant.findUnique({ where: { slug } });

  return NextResponse.json({ available: !existing });
}
