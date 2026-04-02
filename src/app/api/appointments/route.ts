import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, getDayOfWeek, timeToMinutes, minutesToTime } from "@/lib/availability";
import { createConfirmationNotification } from "@/lib/notifications";
import { fireWebhook } from "@/lib/n8n";
import { sendWhatsappMessage } from "@/lib/whatsapp";

// GET — lista agendamentos + profissionais para uma data
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  if (!date) {
    return NextResponse.json({ error: "Parâmetro date é obrigatório." }, { status: 422 });
  }

  const dayOfWeek = getDayOfWeek(date);
  const dateObj = new Date(date + "T00:00:00");

  const [appointments, professionals] = await Promise.all([
    prisma.appointment.findMany({
      where: { tenantId, date: dateObj },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        professional: { select: { id: true, name: true } },
        service: { select: { id: true, name: true, durationMinutes: true } },
      },
      orderBy: { startTime: "asc" },
    }),
    prisma.professional.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      include: {
        schedules: { where: { dayOfWeek } },
        breaks: { where: { dayOfWeek } },
        blocks: { where: { date: dateObj } },
      },
      orderBy: { displayOrder: "asc" },
    }),
  ]);

  return NextResponse.json({
    appointments: appointments.map((a) => ({
      id: a.id,
      date: date,
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
      price: Number(a.price),
      notes: a.notes,
      source: a.source,
      createdAt: a.createdAt.toISOString(),
      client: a.client,
      professional: a.professional,
      service: a.service,
    })),
    professionals: professionals.map((p) => {
      const sched = p.schedules[0];
      return {
        id: p.id,
        name: p.name,
        schedule: sched
          ? { startTime: sched.startTime, endTime: sched.endTime, isActive: sched.isActive }
          : null,
        breaks: p.breaks.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
        blocks: p.blocks.map((b) => ({
          id: b.id,
          startTime: b.startTime,
          endTime: b.endTime,
          reason: b.reason,
        })),
      };
    }),
  });
}

// POST — criar agendamento
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
  const userId = user.id as string;

  try {
    const body = await request.json();
    const { clientId, professionalId, serviceId, date, startTime, notes } = body as {
      clientId: string;
      professionalId: string;
      serviceId: string;
      date: string;
      startTime: string;
      notes?: string;
    };

    if (!clientId || !professionalId || !serviceId || !date || !startTime) {
      return NextResponse.json(
        { error: "Campos obrigatórios: clientId, professionalId, serviceId, date, startTime." },
        { status: 422 }
      );
    }

    // Validar entidades
    const [professional, service, client] = await Promise.all([
      prisma.professional.findFirst({
        where: { id: professionalId, tenantId, isActive: true },
        include: {
          schedules: { where: { dayOfWeek: getDayOfWeek(date) } },
          breaks: { where: { dayOfWeek: getDayOfWeek(date) } },
          blocks: { where: { date: new Date(date + "T00:00:00") } },
          appointments: {
            where: {
              date: new Date(date + "T00:00:00"),
              status: { notIn: ["cancelled", "no_show"] },
            },
            select: { startTime: true, endTime: true, status: true },
          },
          services: { where: { serviceId } },
        },
      }),
      prisma.service.findFirst({
        where: { id: serviceId, tenantId, isActive: true },
      }),
      prisma.client.findFirst({
        where: { id: clientId, tenantId, deletedAt: null },
      }),
    ]);

    if (!professional) {
      return NextResponse.json({ error: "Profissional não encontrado ou inativo." }, { status: 422 });
    }
    if (!service) {
      return NextResponse.json({ error: "Serviço não encontrado ou inativo." }, { status: 422 });
    }
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 422 });
    }
    if (professional.services.length === 0) {
      return NextResponse.json({ error: "Profissional não realiza este serviço." }, { status: 422 });
    }

    // Verificar disponibilidade
    const schedule = professional.schedules[0] ?? null;
    const slots = getAvailableSlots({
      schedule: schedule
        ? { startTime: schedule.startTime, endTime: schedule.endTime, isActive: schedule.isActive }
        : null,
      breaks: professional.breaks.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
      blocks: professional.blocks.map((b) => ({ startTime: b.startTime, endTime: b.endTime, reason: b.reason })),
      appointments: professional.appointments.map((a) => ({ startTime: a.startTime, endTime: a.endTime, status: a.status })),
      serviceDurationMinutes: service.durationMinutes,
      serviceIntervalMinutes: service.intervalMinutes,
      date,
    });

    const slotAvailable = slots.some((s) => s.start === startTime);
    if (!slotAvailable) {
      return NextResponse.json({ error: "Horário não disponível." }, { status: 409 });
    }

    const endMinutes = timeToMinutes(startTime) + service.durationMinutes;
    const endTime = minutesToTime(endMinutes);

    const appointment = await prisma.$transaction(async (tx) => {
      const apt = await tx.appointment.create({
        data: {
          tenantId,
          clientId,
          professionalId,
          serviceId,
          date: new Date(date + "T00:00:00"),
          startTime,
          endTime,
          price: service.price,
          notes: notes?.trim() || null,
          source: "internal",
        },
        include: {
          client: { select: { id: true, name: true, phone: true } },
          professional: { select: { id: true, name: true, phone: true } },
          service: { select: { id: true, name: true, durationMinutes: true } },
        },
      });

      await tx.appointmentHistory.create({
        data: {
          appointmentId: apt.id,
          fromStatus: null,
          toStatus: "pending",
          changedBy: userId,
        },
      });

      return apt;
    });

    // Fire-and-forget confirmation notification
    const dateFormatted = new Date(date + "T12:00:00").toLocaleDateString("pt-BR");
    createConfirmationNotification({
      tenantId,
      clientId,
      appointmentId: appointment.id,
      type: "confirmation",
      clientName: appointment.client.name,
      clientPhone: appointment.client.phone,
      serviceName: appointment.service.name,
      professionalName: appointment.professional.name,
      date: dateFormatted,
      time: startTime,
    }).catch(() => {});

    // Fire-and-forget: notificar N8N sobre novo agendamento
    prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } })
      .then((t) => {
        if (t) {
          fireWebhook("appointment.created", {
            tenantName: t.name,
            clientName: appointment.client.name,
            clientPhone: appointment.client.phone,
            professionalName: appointment.professional.name,
            serviceName: appointment.service.name,
            date: dateFormatted,
            time: startTime,
            price: Number(appointment.price),
            source: "internal",
          });
        }
      })
      .catch(() => {});

    // Notificar profissional via WhatsApp
    if (appointment.professional.phone) {
      const proMsg = `📋 *Novo agendamento!*\n\nCliente: ${appointment.client.name}\nServiço: ${appointment.service.name}\nData: ${dateFormatted}\nHorário: ${startTime}\n\n_Agendamento feito pelo painel._`;
      sendWhatsappMessage(appointment.professional.phone, proMsg).catch(() => {});
    }

    return NextResponse.json(
      {
        id: appointment.id,
        date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        price: Number(appointment.price),
        notes: appointment.notes,
        source: appointment.source,
        createdAt: appointment.createdAt.toISOString(),
        client: appointment.client,
        professional: appointment.professional,
        service: appointment.service,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create appointment error:", error);
    return NextResponse.json({ error: "Erro ao criar agendamento." }, { status: 500 });
  }
}
