import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/rbac";

// POST — criar bloqueio de horário (owner, admin, professional)
export async function POST(request: Request) {
  const auth = await requireAuth(["owner", "admin", "professional"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;

  try {
    const body = await request.json();
    const { professionalId, date, startTime, endTime, reason, allDay } = body as {
      professionalId: string;
      date: string;
      startTime?: string;
      endTime?: string;
      reason?: string;
      allDay?: boolean;
    };

    if (!professionalId || !date) {
      return NextResponse.json(
        { error: "Campos obrigatórios: professionalId, date." },
        { status: 422 }
      );
    }

    // Definir horários para bloqueio de dia inteiro
    const blockStart = allDay ? "00:00" : startTime;
    const blockEnd = allDay ? "23:59" : endTime;

    if (!blockStart || !blockEnd) {
      return NextResponse.json(
        { error: "Campos obrigatórios: startTime e endTime (ou allDay=true)." },
        { status: 422 }
      );
    }

    // Validar horários
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(blockStart) || !timeRegex.test(blockEnd)) {
      return NextResponse.json(
        { error: "Formato de horário inválido. Use HH:MM." },
        { status: 422 }
      );
    }

    if (blockStart >= blockEnd) {
      return NextResponse.json(
        { error: "Horário de início deve ser anterior ao de término." },
        { status: 422 }
      );
    }

    // Validar profissional pertence ao tenant
    const professional = await prisma.professional.findFirst({
      where: { id: professionalId, tenantId, isActive: true, deletedAt: null },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profissional não encontrado." },
        { status: 404 }
      );
    }

    // Verificar conflitos com agendamentos existentes
    const dateObj = new Date(date + "T00:00:00");
    const conflictingAppointments = await prisma.appointment.findMany({
      where: {
        professionalId,
        date: dateObj,
        status: { notIn: ["cancelled", "no_show"] },
        OR: [
          { startTime: { lt: blockEnd }, endTime: { gt: blockStart } },
        ],
      },
      include: {
        client: { select: { name: true } },
        service: { select: { name: true } },
      },
      orderBy: { startTime: "asc" },
    });

    // Criar o bloqueio
    const block = await prisma.scheduleBlock.create({
      data: {
        professionalId,
        date: dateObj,
        startTime: blockStart,
        endTime: blockEnd,
        reason: reason?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        id: block.id,
        professionalId: block.professionalId,
        date,
        startTime: block.startTime,
        endTime: block.endTime,
        reason: block.reason,
        conflicts: conflictingAppointments.map((a) => ({
          id: a.id,
          startTime: a.startTime,
          endTime: a.endTime,
          clientName: a.client.name,
          serviceName: a.service.name,
          status: a.status,
        })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create schedule block error:", error);
    return NextResponse.json(
      { error: "Erro ao criar bloqueio." },
      { status: 500 }
    );
  }
}
