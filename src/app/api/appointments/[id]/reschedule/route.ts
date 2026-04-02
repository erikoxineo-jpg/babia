import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, getDayOfWeek, timeToMinutes, minutesToTime } from "@/lib/availability";

// POST — reagendar agendamento
export async function POST(
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
    const { date, startTime, professionalId } = body as {
      date: string;
      startTime: string;
      professionalId?: string;
    };

    if (!date || !startTime) {
      return NextResponse.json(
        { error: "Campos obrigatórios: date, startTime." },
        { status: 422 }
      );
    }

    // Buscar agendamento atual
    const appointment = await prisma.appointment.findFirst({
      where: { id, tenantId },
      include: {
        service: true,
        history: { orderBy: { createdAt: "asc" } },
      },
    });

    if (!appointment) {
      return NextResponse.json(
        { error: "Agendamento não encontrado." },
        { status: 404 }
      );
    }

    // Só pode reagendar pendente ou confirmado
    if (!["pending", "confirmed"].includes(appointment.status)) {
      return NextResponse.json(
        { error: "Só é possível reagendar agendamentos pendentes ou confirmados." },
        { status: 422 }
      );
    }

    // Contar reagendamentos anteriores (entradas no histórico com reason contendo "Reagendado")
    const rescheduleCount = appointment.history.filter(
      (h) => h.reason?.startsWith("Reagendado")
    ).length;

    if (rescheduleCount >= 3) {
      return NextResponse.json(
        { error: "Máximo de 3 reagendamentos atingido." },
        { status: 422 }
      );
    }

    // Profissional: usa novo ou mantém o atual
    const targetProfessionalId = professionalId || appointment.professionalId;

    // Validar profissional
    const professional = await prisma.professional.findFirst({
      where: { id: targetProfessionalId, tenantId, isActive: true, deletedAt: null },
      include: {
        schedules: { where: { dayOfWeek: getDayOfWeek(date) } },
        breaks: { where: { dayOfWeek: getDayOfWeek(date) } },
        blocks: { where: { date: new Date(date + "T00:00:00") } },
        appointments: {
          where: {
            date: new Date(date + "T00:00:00"),
            status: { notIn: ["cancelled", "no_show"] },
            id: { not: appointment.id }, // Excluir o próprio agendamento
          },
          select: { startTime: true, endTime: true, status: true },
        },
        services: { where: { serviceId: appointment.serviceId } },
      },
    });

    if (!professional) {
      return NextResponse.json(
        { error: "Profissional não encontrado ou inativo." },
        { status: 404 }
      );
    }

    if (professional.services.length === 0) {
      return NextResponse.json(
        { error: "Profissional não realiza este serviço." },
        { status: 422 }
      );
    }

    // Verificar disponibilidade
    const schedule = professional.schedules[0] ?? null;
    const slots = getAvailableSlots({
      schedule: schedule
        ? { startTime: schedule.startTime, endTime: schedule.endTime, isActive: schedule.isActive }
        : null,
      breaks: professional.breaks.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
      blocks: professional.blocks.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
      appointments: professional.appointments.map((a) => ({
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
      })),
      serviceDurationMinutes: appointment.service.durationMinutes,
      serviceIntervalMinutes: appointment.service.intervalMinutes,
      date,
    });

    const slotAvailable = slots.some((s) => s.start === startTime);
    if (!slotAvailable) {
      return NextResponse.json(
        { error: "Horário não disponível." },
        { status: 409 }
      );
    }

    const endMinutes = timeToMinutes(startTime) + appointment.service.durationMinutes;
    const endTime = minutesToTime(endMinutes);

    // Guardar dados antigos para audit trail
    const oldDate = appointment.date.toISOString().split("T")[0];
    const oldStartTime = appointment.startTime;
    const oldProfessionalId = appointment.professionalId;

    // Atualizar agendamento em transação
    const updated = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.update({
        where: { id },
        data: {
          date: new Date(date + "T00:00:00"),
          startTime,
          endTime,
          professionalId: targetProfessionalId,
          status: "pending",
          confirmedAt: null,
          cancelledAt: null,
          completedAt: null,
        },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          professional: { select: { id: true, name: true } },
          service: { select: { id: true, name: true, durationMinutes: true } },
        },
      });

      // Audit trail
      const reasonParts = [`Reagendado de ${oldDate} ${oldStartTime} para ${date} ${startTime}`];
      if (targetProfessionalId !== oldProfessionalId) {
        reasonParts.push(`(profissional alterado)`);
      }

      await tx.appointmentHistory.create({
        data: {
          appointmentId: id,
          fromStatus: appointment.status,
          toStatus: "pending",
          changedBy: userId,
          reason: reasonParts.join(" "),
        },
      });

      return apt;
    });

    return NextResponse.json({
      id: updated.id,
      date,
      startTime: updated.startTime,
      endTime: updated.endTime,
      status: updated.status,
      price: Number(updated.price),
      notes: updated.notes,
      source: updated.source,
      client: updated.client,
      professional: updated.professional,
      service: updated.service,
      rescheduledFrom: { date: oldDate, startTime: oldStartTime },
      rescheduleCount: rescheduleCount + 1,
    });
  } catch (error) {
    console.error("Reschedule appointment error:", error);
    return NextResponse.json(
      { error: "Erro ao reagendar." },
      { status: 500 }
    );
  }
}
