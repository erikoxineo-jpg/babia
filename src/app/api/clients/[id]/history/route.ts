import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — histórico de atendimentos do cliente
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
  const { id } = await params;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("per_page") ?? "20")));

  // Verificar cliente existe
  const client = await prisma.client.findFirst({
    where: { id, tenantId, deletedAt: null },
    select: { id: true },
  });

  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  const [appointments, total] = await Promise.all([
    prisma.appointment.findMany({
      where: { clientId: id, tenantId },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        status: true,
        price: true,
        notes: true,
        source: true,
        service: { select: { id: true, name: true } },
        professional: { select: { id: true, name: true } },
      },
      orderBy: [{ date: "desc" }, { startTime: "desc" }],
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.appointment.count({ where: { clientId: id, tenantId } }),
  ]);

  return NextResponse.json({
    data: appointments.map((a) => ({
      id: a.id,
      date: a.date.toISOString().split("T")[0],
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
      price: Number(a.price),
      notes: a.notes,
      source: a.source,
      service: a.service,
      professional: a.professional,
    })),
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}
