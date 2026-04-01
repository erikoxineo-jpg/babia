import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const services = await prisma.service.findMany({
    where: { tenantId, isActive: true },
    select: {
      id: true,
      name: true,
      durationMinutes: true,
      price: true,
    },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json(
    services.map((s) => ({
      id: s.id,
      name: s.name,
      durationMinutes: s.durationMinutes,
      price: Number(s.price),
    }))
  );
}
