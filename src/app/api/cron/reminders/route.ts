import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createReminderNotification } from "@/lib/notifications";

// GET — endpoint para cron job enviar lembretes
// Pode ser chamado via Vercel Cron ou serviço externo
export async function GET(request: Request) {
  // Simple auth via secret header
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find all active tenants with settings
  const tenants = await prisma.tenantSettings.findMany({
    where: { tenant: { status: "active" } },
    select: {
      tenantId: true,
      reminderHoursBefore: true,
    },
  });

  let sent = 0;
  let errors = 0;

  for (const ts of tenants) {
    const reminderWindow = new Date(now.getTime() + ts.reminderHoursBefore * 60 * 60 * 1000);
    const windowStart = new Date(reminderWindow.getTime() - 30 * 60 * 1000); // 30min tolerance

    const todayStr = `${reminderWindow.getFullYear()}-${String(reminderWindow.getMonth() + 1).padStart(2, "0")}-${String(reminderWindow.getDate()).padStart(2, "0")}`;
    const todayDate = new Date(todayStr + "T00:00:00Z");

    // Find appointments that need reminders
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId: ts.tenantId,
        date: todayDate,
        status: { in: ["pending", "confirmed"] },
        // Exclude ones that already have a reminder notification
        notifications: { none: { type: "reminder" } },
      },
      select: {
        id: true,
        startTime: true,
        client: { select: { id: true, name: true, phone: true } },
        service: { select: { name: true } },
      },
    });

    // Filter by time window
    for (const apt of appointments) {
      const [h, m] = apt.startTime.split(":").map(Number);
      const aptTime = new Date(todayDate);
      aptTime.setHours(h, m, 0, 0);

      // Only send if appointment is within the reminder window
      if (aptTime >= windowStart && aptTime <= reminderWindow) {
        try {
          await createReminderNotification({
            tenantId: ts.tenantId,
            clientId: apt.client.id,
            appointmentId: apt.id,
            type: "reminder",
            clientName: apt.client.name,
            clientPhone: apt.client.phone,
            serviceName: apt.service.name,
            time: apt.startTime,
          });
          sent++;
        } catch {
          errors++;
        }
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: { sent, errors, checkedTenants: tenants.length },
  });
}
