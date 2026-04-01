import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/rbac";
import { buildWhatsappLink } from "@/lib/notifications";

// POST — enviar notificação manual (owner, admin)
export async function POST(request: Request) {
  const auth = await requireAuth(["owner", "admin"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;

  try {
    const body = await request.json();
    const { clientId, message, type } = body as {
      clientId: string;
      message: string;
      type?: string;
    };

    if (!clientId || !message?.trim()) {
      return NextResponse.json({ error: "Cliente e mensagem são obrigatórios." }, { status: 422 });
    }

    if (message.length > 500) {
      return NextResponse.json({ error: "Mensagem máxima de 500 caracteres." }, { status: 422 });
    }

    // Rate limit: 10 per hour per tenant
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await prisma.notification.count({
      where: {
        tenantId,
        createdAt: { gte: oneHourAgo },
        type: { in: ["reactivation", "waitlist"] },
      },
    });

    if (recentCount >= 10) {
      return NextResponse.json(
        { error: "Limite de 10 notificações manuais por hora." },
        { status: 429 }
      );
    }

    const client = await prisma.client.findFirst({
      where: { id: clientId, tenantId, deletedAt: null },
      select: { id: true, phone: true, name: true },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    }

    const notificationType = (type === "reminder" || type === "reactivation") ? type : "reactivation";

    const notification = await prisma.notification.create({
      data: {
        tenantId,
        clientId,
        type: notificationType,
        channel: "whatsapp",
        status: "sent",
        scheduledFor: new Date(),
        sentAt: new Date(),
      },
    });

    const whatsappLink = buildWhatsappLink(client.phone, message);

    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        status: "sent",
        channel: "whatsapp",
        whatsappLink,
      },
    });
  } catch (error) {
    console.error("Send notification error:", error);
    return NextResponse.json({ error: "Erro ao enviar notificação." }, { status: 500 });
  }
}
