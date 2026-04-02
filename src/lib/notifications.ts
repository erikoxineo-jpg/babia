import { prisma } from "@/lib/prisma";
import { sendWhatsappMessage } from "@/lib/whatsapp";

interface CreateNotificationInput {
  tenantId: string;
  clientId: string;
  appointmentId?: string;
  type: "confirmation" | "reminder" | "reactivation" | "waitlist";
  scheduledFor?: Date;
}

interface NotificationResult {
  id: string;
  sent: boolean;
}

function buildConfirmationMessage(data: {
  clientName: string;
  serviceName: string;
  professionalName: string;
  date: string;
  time: string;
}): string {
  return `✅ *Agendamento confirmado!*\n\nOlá ${data.clientName}!\n\nServiço: ${data.serviceName}\nProfissional: ${data.professionalName}\nData: ${data.date}\nHorário: ${data.time}\n\n_Até lá! 💈_`;
}

function buildReminderMessage(data: {
  clientName: string;
  serviceName: string;
  time: string;
}): string {
  return `⏰ *Lembrete de agendamento!*\n\nOlá ${data.clientName}!\n\nVocê tem *${data.serviceName}* hoje às *${data.time}*.\n\n_Te esperamos! 💈_`;
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

  // Enviar WhatsApp via Evolution API
  const result = await sendWhatsappMessage(input.clientPhone, message);

  const notification = await prisma.notification.create({
    data: {
      tenantId: input.tenantId,
      clientId: input.clientId,
      appointmentId: input.appointmentId,
      type: "confirmation",
      channel: "whatsapp",
      status: result.success ? "sent" : "failed",
      scheduledFor: input.scheduledFor ?? new Date(),
      sentAt: result.success ? new Date() : null,
    },
  });

  if (!result.success) {
    console.error(`[Notification] WhatsApp failed for ${input.clientPhone}:`, result.error);
  }

  return { id: notification.id, sent: result.success };
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

  // Enviar WhatsApp via Evolution API
  const result = await sendWhatsappMessage(input.clientPhone, message);

  const notification = await prisma.notification.create({
    data: {
      tenantId: input.tenantId,
      clientId: input.clientId,
      appointmentId: input.appointmentId,
      type: "reminder",
      channel: "whatsapp",
      status: result.success ? "sent" : "failed",
      scheduledFor: input.scheduledFor ?? new Date(),
      sentAt: result.success ? new Date() : null,
    },
  });

  if (!result.success) {
    console.error(`[Notification] WhatsApp reminder failed for ${input.clientPhone}:`, result.error);
  }

  return { id: notification.id, sent: result.success };
}

export function buildWhatsappLink(phone: string, message: string): string | null {
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return null;
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}
