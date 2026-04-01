import { prisma } from "@/lib/prisma";

interface CreateNotificationInput {
  tenantId: string;
  clientId: string;
  appointmentId?: string;
  type: "confirmation" | "reminder" | "reactivation" | "waitlist";
  scheduledFor?: Date;
}

interface NotificationResult {
  id: string;
  whatsappLink: string | null;
}

function formatPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

function buildConfirmationMessage(data: {
  clientName: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
}): string {
  return `Olá ${data.clientName}! Seu agendamento foi confirmado: ${data.serviceName} com ${data.professionalName} em ${data.date} às ${data.time}. Até lá!`;
}

function buildReminderMessage(data: {
  clientName: string;
  serviceName: string;
  time: string;
}): string {
  return `Olá ${data.clientName}! Lembrete: você tem ${data.serviceName} hoje às ${data.time}. Te esperamos!`;
}

export async function createConfirmationNotification(
  input: CreateNotificationInput & {
    clientName: string;
    clientPhone: string;
    serviceName: string;
    professionalName: string;
    date: string;
    time: string;
  }
): Promise<NotificationResult> {
  const message = buildConfirmationMessage({
    clientName: input.clientName,
    serviceName: input.serviceName,
    professionalName: input.professionalName,
    date: input.date,
    time: input.time,
  });

  const notification = await prisma.notification.create({
    data: {
      tenantId: input.tenantId,
      clientId: input.clientId,
      appointmentId: input.appointmentId,
      type: "confirmation",
      channel: "whatsapp",
      status: "sent",
      scheduledFor: input.scheduledFor ?? new Date(),
      sentAt: new Date(),
    },
  });

  const phone = formatPhone(input.clientPhone);
  const encoded = encodeURIComponent(message);
  const whatsappLink = phone ? `https://wa.me/${phone}?text=${encoded}` : null;

  return { id: notification.id, whatsappLink };
}

export async function createReminderNotification(
  input: CreateNotificationInput & {
    clientName: string;
    clientPhone: string;
    serviceName: string;
    time: string;
  }
): Promise<NotificationResult> {
  const message = buildReminderMessage({
    clientName: input.clientName,
    serviceName: input.serviceName,
    time: input.time,
  });

  const notification = await prisma.notification.create({
    data: {
      tenantId: input.tenantId,
      clientId: input.clientId,
      appointmentId: input.appointmentId,
      type: "reminder",
      channel: "whatsapp",
      status: "sent",
      scheduledFor: input.scheduledFor ?? new Date(),
      sentAt: new Date(),
    },
  });

  const phone = formatPhone(input.clientPhone);
  const encoded = encodeURIComponent(message);
  const whatsappLink = phone ? `https://wa.me/${phone}?text=${encoded}` : null;

  return { id: notification.id, whatsappLink };
}

export function buildWhatsappLink(phone: string, message: string): string | null {
  const cleaned = formatPhone(phone);
  if (!cleaned) return null;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
