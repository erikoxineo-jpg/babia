import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — N8N chama diariamente às 20:00 para buscar agendamentos de amanhã
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  // Amanhã: data atual + 1 dia
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
  const tomorrowDate = new Date(tomorrowStr + "T00:00:00Z");

  try {
    // Buscar agendamentos de amanhã que ainda não têm lembrete 24h
    const appointments = await prisma.appointment.findMany({
      where: {
        date: tomorrowDate,
        status: { in: ["pending", "confirmed"] },
        notifications: { none: { type: "reminder_24h" } },
      },
      select: {
        id: true,
        startTime: true,
        tenantId: true,
        clientId: true,
        client: { select: { name: true, phone: true } },
        professional: { select: { name: true } },
        service: { select: { name: true } },
        tenant: { select: { name: true } },
      },
    });

    // Criar registros de notificação para prevenir duplicatas
    const reminders = [];
    for (const apt of appointments) {
      await prisma.notification.create({
        data: {
          tenantId: apt.tenantId,
          clientId: apt.clientId,
          appointmentId: apt.id,
          type: "reminder_24h",
          channel: "whatsapp",
          status: "pending",
          scheduledFor: now,
        },
      });

      reminders.push({
        clientName: apt.client.name,
        clientPhone: apt.client.phone,
        serviceName: apt.service.name,
        professionalName: apt.professional.name,
        date: tomorrowStr,
        time: apt.startTime,
        tenantName: apt.tenant.name,
      });
    }

    return NextResponse.json({ success: true, reminders });
  } catch (error) {
    console.error("Reminders 24h error:", error);
    return NextResponse.json({ error: "Erro ao buscar lembretes." }, { status: 500 });
  }
}
