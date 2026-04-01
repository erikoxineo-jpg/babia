import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VALID_TRANSITIONS } from "@/types/agenda";
import type { AppointmentStatus } from "@prisma/client";

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
  const userId = user.id as string;
  const { id } = await params;

  try {
    const body = await request.json();
    const { status, reason } = body as { status: AppointmentStatus; reason?: string };

    if (!status) {
      return NextResponse.json({ error: "Campo status é obrigatório." }, { status: 422 });
    }

    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { id: true, totalVisits: true, totalSpent: true } },
      },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Agendamento não encontrado." }, { status: 404 });
    }

    const allowed = VALID_TRANSITIONS[appointment.status] ?? [];
    if (!allowed.includes(status)) {
      return NextResponse.json(
        { error: `Transição de "${appointment.status}" para "${status}" não é permitida.` },
        { status: 422 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const timestampField =
        status === "confirmed" ? { confirmedAt: new Date() } :
        status === "cancelled" ? { cancelledAt: new Date() } :
        status === "completed" ? { completedAt: new Date() } : {};

      const updated = await tx.appointment.update({
        where: { id },
        data: { status, ...timestampField },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          professional: { select: { id: true, name: true } },
          service: { select: { id: true, name: true, durationMinutes: true } },
        },
      });

      await tx.appointmentHistory.create({
        data: {
          appointmentId: id,
          fromStatus: appointment.status,
          toStatus: status,
          changedBy: userId,
          reason: reason?.trim() || null,
        },
      });

      // Se completado, atualizar métricas do cliente e criar transação
      if (status === "completed") {
        const newTotal = appointment.client.totalVisits + 1;
        const newSpent = Number(appointment.client.totalSpent) + Number(appointment.price);
        await tx.client.update({
          where: { id: appointment.clientId },
          data: {
            totalVisits: newTotal,
            totalSpent: newSpent,
            averageTicket: newSpent / newTotal,
            lastVisit: appointment.date,
            firstVisit: appointment.client.totalVisits === 0 ? appointment.date : undefined,
          },
        });

        // Criar transação financeira automática
        await tx.transaction.create({
          data: {
            tenantId,
            appointmentId: id,
            clientId: appointment.clientId,
            type: "service",
            amount: Number(appointment.price),
            paymentMethod: "pix", // Padrão — dono pode editar depois
            date: appointment.date,
          },
        });
      }

      return updated;
    });

    return NextResponse.json({
      id: result.id,
      status: result.status,
      date: result.date.toISOString().split("T")[0],
      startTime: result.startTime,
      endTime: result.endTime,
      price: Number(result.price),
      notes: result.notes,
      source: result.source,
      createdAt: result.createdAt.toISOString(),
      client: result.client,
      professional: result.professional,
      service: result.service,
    });
  } catch (error) {
    console.error("Update appointment status error:", error);
    return NextResponse.json({ error: "Erro ao atualizar status." }, { status: 500 });
  }
}
