import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — N8N chama a cada 30min para buscar agendamentos das próximas 4-5h
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayDate = new Date(todayStr + "T00:00:00Z");

  // Janela: próximas 4h a 5h a partir de agora
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const windowStart = nowMinutes + 4 * 60; // 4h à frente
  const windowEnd = nowMinutes + 5 * 60;   // 5h à frente

  // Converter minutos para HH:MM
  const toTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // Se a janela ultrapassar 23:59, não há agendamentos para buscar
  if (windowStart >= 24 * 60) {
    return NextResponse.json({ success: true, reminders: [] });
  }

  const startTimeFilter = toTime(windowStart);
  const endTimeFilter = toTime(Math.min(windowEnd, 23 * 60 + 59));

  try {
    // Buscar agendamentos de hoje na janela de 4-5h que não têm lembrete 4h
    const appointments = await prisma.appointment.findMany({
      where: {
        date: todayDate,
        status: { in: ["pending", "confirmed"] },
        startTime: { gte: startTimeFilter, lte: endTimeFilter },
        notifications: { none: { type: "reminder_4h" } },
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
          type: "reminder_4h",
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
        time: apt.startTime,
        tenantName: apt.tenant.name,
      });
    }

    return NextResponse.json({ success: true, reminders });
  } catch (error) {
    console.error("Reminders 4h error:", error);
    return NextResponse.json({ error: "Erro ao buscar lembretes." }, { status: 500 });
  }
}
