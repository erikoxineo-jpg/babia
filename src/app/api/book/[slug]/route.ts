import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, getDayOfWeek, timeToMinutes, minutesToTime } from "@/lib/availability";
import { createConfirmationNotification } from "@/lib/notifications";
import { bookingLimiter, checkRateLimit } from "@/lib/rate-limit";
import { fireWebhook } from "@/lib/n8n";
import { sendWhatsappMessage } from "@/lib/whatsapp";

// POST — criar agendamento público
export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  // Rate limit: 20 agendamentos por hora por IP
  const rateLimitResponse = checkRateLimit(request, bookingLimiter);
  if (rateLimitResponse) return rateLimitResponse;

  const { slug } = await params;

  try {
    const body = await request.json();
    const { clientName, clientPhone, clientEmail, professionalId, serviceId, date, startTime } =
      body as {
        clientName: string;
        clientPhone: string;
        clientEmail?: string;
        professionalId: string;
        serviceId: string;
        date: string;
        startTime: string;
      };

    if (!clientName || !clientPhone || !professionalId || !serviceId || !date || !startTime) {
      return NextResponse.json(
        { error: "Todos os campos obrigatórios devem ser preenchidos." },
        { status: 422 }
      );
    }

    // Normalizar telefone
    const phone = clientPhone.replace(/\D/g, "");
    if (phone.length < 10) {
      return NextResponse.json(
        { error: "Telefone inválido." },
        { status: 422 }
      );
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, name: true, onboardingCompleted: true },
    });

    if (!tenant || !tenant.onboardingCompleted) {
      return NextResponse.json(
        { error: "Barbearia não encontrada." },
        { status: 404 }
      );
    }

    // Validar profissional e serviço
    const [professional, service] = await Promise.all([
      prisma.professional.findFirst({
        where: { id: professionalId, tenantId: tenant.id, isActive: true, deletedAt: null },
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
        where: { id: serviceId, tenantId: tenant.id, isActive: true },
      }),
    ]);

    if (!professional) {
      return NextResponse.json(
        { error: "Profissional não encontrado." },
        { status: 404 }
      );
    }
    if (!service) {
      return NextResponse.json(
        { error: "Serviço não encontrado." },
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
      serviceDurationMinutes: service.durationMinutes,
      serviceIntervalMinutes: service.intervalMinutes,
      date,
    });

    const slotAvailable = slots.some((s) => s.start === startTime);
    if (!slotAvailable) {
      return NextResponse.json(
        { error: "Horário não disponível. Tente outro horário." },
        { status: 409 }
      );
    }

    const endMinutes = timeToMinutes(startTime) + service.durationMinutes;
    const endTime = minutesToTime(endMinutes);

    // Criar agendamento em transação com deduplicação de cliente
    const result = await prisma.$transaction(async (tx) => {
      // Buscar ou criar cliente
      let client = await tx.client.findFirst({
        where: { tenantId: tenant.id, phone },
      });

      if (!client) {
        client = await tx.client.create({
          data: {
            tenantId: tenant.id,
            name: clientName.trim(),
            phone,
            email: clientEmail?.trim() || null,
          },
        });
      } else {
        // Atualizar nome/email se fornecido
        await tx.client.update({
          where: { id: client.id },
          data: {
            name: clientName.trim(),
            ...(clientEmail && { email: clientEmail.trim() }),
          },
        });
      }

      // Criar agendamento
      const appointment = await tx.appointment.create({
        data: {
          tenantId: tenant.id,
          clientId: client.id,
          professionalId,
          serviceId,
          date: new Date(date + "T00:00:00"),
          startTime,
          endTime,
          price: service.price,
          source: "public",
        },
        include: {
          professional: { select: { name: true, phone: true } },
          service: { select: { name: true } },
        },
      });

      // Audit trail
      await tx.appointmentHistory.create({
        data: {
          appointmentId: appointment.id,
          fromStatus: null,
          toStatus: "pending",
          reason: "Agendamento público",
        },
      });

      return appointment;
    });

    // Fire-and-forget confirmation notification
    const dateFormatted = new Date(date + "T12:00:00").toLocaleDateString("pt-BR");
    createConfirmationNotification({
      tenantId: tenant.id,
      clientId: result.clientId,
      appointmentId: result.id,
      type: "confirmation",
      clientName: clientName.trim(),
      clientPhone: phone,
      serviceName: result.service.name,
      professionalName: result.professional.name,
      date: dateFormatted,
      time: startTime,
    }).catch(() => {});

    // Fire-and-forget: notificar N8N sobre novo agendamento público
    fireWebhook("appointment.created", {
      tenantName: tenant.name,
      clientName: clientName.trim(),
      clientPhone: phone,
      professionalName: result.professional.name,
      serviceName: result.service.name,
      date: dateFormatted,
      time: startTime,
      price: Number(result.price),
      source: "public",
    }).catch(() => {});

    // Notificar profissional via WhatsApp
    if (result.professional.phone) {
      const proMsg = `📋 *Novo agendamento online!*\n\nCliente: ${clientName.trim()}\nTelefone: ${phone}\nServiço: ${result.service.name}\nData: ${dateFormatted}\nHorário: ${startTime}\n\n_Agendamento feito pelo link público._`;
      sendWhatsappMessage(result.professional.phone, proMsg).catch(() => {});
    }

    return NextResponse.json(
      {
        id: result.id,
        date,
        startTime: result.startTime,
        endTime: result.endTime,
        status: result.status,
        service: result.service.name,
        professional: result.professional.name,
        barbershop: tenant.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Public booking error:", error);
    return NextResponse.json(
      { error: "Erro ao criar agendamento. Tente novamente." },
      { status: 500 }
    );
  }
}
