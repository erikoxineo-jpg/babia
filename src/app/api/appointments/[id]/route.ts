import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — detalhes do agendamento com histórico
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

  const appointment = await prisma.appointment.findFirst({
    where: { id, tenantId },
    include: {
      client: { select: { id: true, name: true, phone: true, email: true } },
      professional: { select: { id: true, name: true } },
      service: { select: { id: true, name: true, durationMinutes: true } },
      history: {
        orderBy: { createdAt: "asc" },
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!appointment) {
    return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
  }

  return NextResponse.json({
    id: appointment.id,
    date: appointment.date.toISOString().split("T")[0],
    startTime: appointment.startTime,
    endTime: appointment.endTime,
    status: appointment.status,
    price: Number(appointment.price),
    notes: appointment.notes,
    source: appointment.source,
    createdAt: appointment.createdAt.toISOString(),
    confirmedAt: appointment.confirmedAt?.toISOString() ?? null,
    cancelledAt: appointment.cancelledAt?.toISOString() ?? null,
    completedAt: appointment.completedAt?.toISOString() ?? null,
    client: appointment.client,
    professional: appointment.professional,
    service: appointment.service,
    history: appointment.history.map((h) => ({
      id: h.id,
      fromStatus: h.fromStatus,
      toStatus: h.toStatus,
      reason: h.reason,
      changedBy: h.user?.name ?? null,
      createdAt: h.createdAt.toISOString(),
    })),
  });
}

// PUT — editar notas/preço
export async function PUT(
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

  try {
    const body = await request.json();
    const { notes, price } = body as { notes?: string; price?: number };

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        ...(notes !== undefined && { notes: notes?.trim() || null }),
        ...(price !== undefined && { price }),
      },
    });

    return NextResponse.json({
      id: updated.id,
      notes: updated.notes,
      price: Number(updated.price),
    });
  } catch (error) {
    console.error("Update appointment error:", error);
    return NextResponse.json({ error: "Erro ao atualizar agendamento." }, { status: 500 });
  }
}
