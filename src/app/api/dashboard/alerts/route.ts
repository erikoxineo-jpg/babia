import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Alert {
  type: string;
  severity: "info" | "warning" | "danger";
  title: string;
  message: string;
  action?: { type: "link"; url: string; label: string };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayDate = new Date(todayStr + "T00:00:00Z");

  const tomorrow = new Date(todayDate);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const alerts: Alert[] = [];

  const [
    unconfirmedCount,
    inactiveCount,
    atRiskCount,
    tomorrowNoShowRisk,
  ] = await Promise.all([
    // Unconfirmed appointments today
    prisma.appointment.count({
      where: {
        tenantId,
        date: todayDate,
        status: "pending",
      },
    }),

    // Inactive clients
    prisma.client.count({
      where: { tenantId, status: "inactive", deletedAt: null },
    }),

    // At-risk clients
    prisma.client.count({
      where: { tenantId, status: "at_risk", deletedAt: null },
    }),

    // Tomorrow's appointments from clients with 2+ no-shows
    prisma.appointment.findMany({
      where: {
        tenantId,
        date: tomorrow,
        status: { in: ["pending", "confirmed"] },
        client: {
          appointments: {
            some: { status: "no_show" },
          },
        },
      },
      select: {
        startTime: true,
        client: {
          select: {
            id: true,
            name: true,
            _count: { select: { appointments: { where: { status: "no_show" } } } },
          },
        },
      },
      take: 5,
    }),
  ]);

  // Unconfirmed appointments
  if (unconfirmedCount > 0) {
    alerts.push({
      type: "unconfirmed_appointments",
      severity: unconfirmedCount >= 5 ? "warning" : "info",
      title: `${unconfirmedCount} agendamento${unconfirmedCount > 1 ? "s" : ""} não confirmado${unconfirmedCount > 1 ? "s" : ""}`,
      message: `${unconfirmedCount} agendamento${unconfirmedCount > 1 ? "s" : ""} de hoje ainda ${unconfirmedCount > 1 ? "estão" : "está"} pendente${unconfirmedCount > 1 ? "s" : ""} de confirmação`,
      action: { type: "link", url: "/agenda", label: "Ver agenda" },
    });
  }

  // At-risk clients
  if (atRiskCount > 0) {
    alerts.push({
      type: "at_risk_clients",
      severity: "warning",
      title: `${atRiskCount} cliente${atRiskCount > 1 ? "s" : ""} em risco`,
      message: `${atRiskCount} cliente${atRiskCount > 1 ? "s" : ""} próximo${atRiskCount > 1 ? "s" : ""} de se tornar${atRiskCount > 1 ? "em" : ""} inativo${atRiskCount > 1 ? "s" : ""}`,
      action: { type: "link", url: "/clientes?status=at_risk", label: "Ver clientes em risco" },
    });
  }

  // Inactive clients
  if (inactiveCount > 0) {
    alerts.push({
      type: "inactive_clients",
      severity: "warning",
      title: `${inactiveCount} cliente${inactiveCount > 1 ? "s" : ""} inativo${inactiveCount > 1 ? "s" : ""}`,
      message: `${inactiveCount} cliente${inactiveCount > 1 ? "s" : ""} não visitam há mais de 45 dias`,
      action: { type: "link", url: "/clientes?status=inactive", label: "Ver clientes inativos" },
    });
  }

  // No-show risk for tomorrow
  for (const apt of tomorrowNoShowRisk) {
    const noShowCount = apt.client._count.appointments;
    if (noShowCount >= 2) {
      alerts.push({
        type: "no_show_risk",
        severity: "danger",
        title: "Cliente com histórico de faltas",
        message: `${apt.client.name} (${noShowCount} falta${noShowCount > 1 ? "s" : ""}) tem agendamento amanhã às ${apt.startTime}`,
        action: { type: "link", url: `/clientes/${apt.client.id}`, label: "Ver ficha do cliente" },
      });
    }
  }

  // Sort by severity: danger > warning > info
  const severityOrder = { danger: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return NextResponse.json({ success: true, data: { alerts: alerts.slice(0, 20) } });
}
