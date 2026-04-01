import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// GET — lista notificações
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? "pending";
  const type = searchParams.get("type");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("per_page") ?? "20")));

  const where: Prisma.NotificationWhereInput = { tenantId };

  if (status !== "all") {
    where.status = status as "pending" | "sent" | "failed";
  }
  if (type) {
    where.type = type as "confirmation" | "reminder" | "reactivation" | "waitlist";
  }

  const orderBy: Prisma.NotificationOrderByWithRelationInput =
    status === "pending"
      ? { scheduledFor: "asc" }
      : { createdAt: "desc" };

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      select: {
        id: true,
        type: true,
        channel: true,
        status: true,
        scheduledFor: true,
        sentAt: true,
        createdAt: true,
        client: { select: { id: true, name: true, phone: true } },
        appointment: {
          select: {
            id: true,
            date: true,
            startTime: true,
            service: { select: { name: true } },
          },
        },
      },
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.notification.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: notifications.map((n) => ({
      id: n.id,
      type: n.type,
      channel: n.channel,
      status: n.status,
      recipient: {
        clientId: n.client.id,
        name: n.client.name,
        phone: n.client.phone,
      },
      appointment: n.appointment
        ? {
            id: n.appointment.id,
            date: n.appointment.date.toISOString().split("T")[0],
            startTime: n.appointment.startTime,
            service: n.appointment.service.name,
          }
        : null,
      scheduledFor: n.scheduledFor.toISOString(),
      sentAt: n.sentAt?.toISOString() ?? null,
      createdAt: n.createdAt.toISOString(),
    })),
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  });
}
