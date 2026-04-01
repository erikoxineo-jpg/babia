import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/rbac";
import { buildWhatsappLink } from "@/lib/notifications";
import {
  sendWhatsappMessage,
  isEvolutionConfigured,
  delay,
} from "@/lib/whatsapp";

// POST — disparar campanha (owner, admin)
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["owner", "admin"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;
  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id, tenantId },
  });

  if (!campaign) {
    return NextResponse.json(
      { error: "Campanha não encontrada." },
      { status: 404 }
    );
  }

  if (campaign.status !== "draft") {
    return NextResponse.json(
      { error: "Campanha já foi enviada." },
      { status: 409 }
    );
  }

  // Get tenant name for template variables
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { name: true },
  });

  // Build target client list based on segment
  const segment = campaign.targetSegment as Record<string, unknown>;
  const daysMin = (segment.daysInactiveMin as number) ?? 30;
  const dateCutoff = new Date();
  dateCutoff.setDate(dateCutoff.getDate() - daysMin);

  let clients;
  if (campaign.type === "reactivation") {
    clients = await prisma.client.findMany({
      where: {
        tenantId,
        deletedAt: null,
        status: { in: ["at_risk", "inactive"] },
        lastVisit: { lte: dateCutoff },
      },
      select: { id: true, name: true, phone: true, lastVisit: true },
      take: 200,
    });
  } else {
    clients = await prisma.client.findMany({
      where: { tenantId, deletedAt: null, status: "active" },
      select: { id: true, name: true, phone: true, lastVisit: true },
      take: 200,
    });
  }

  if (clients.length === 0) {
    return NextResponse.json(
      { error: "Nenhum destinatário encontrado." },
      { status: 422 }
    );
  }

  const useEvolution = isEvolutionConfigured();
  const now = new Date();
  let sentCount = 0;
  let failedCount = 0;
  const whatsappLinks: { clientName: string; link: string | null }[] = [];

  // Mark as sending
  await prisma.campaign.update({
    where: { id },
    data: { status: "sending" },
  });

  // Process each client
  for (const client of clients) {
    const daysSinceVisit = client.lastVisit
      ? Math.floor(
          (now.getTime() - client.lastVisit.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    const message = campaign.template
      .replace(/\{\{client_name\}\}/g, client.name)
      .replace(/\{\{barbershop_name\}\}/g, tenant?.name ?? "")
      .replace(/\{\{last_visit_days\}\}/g, String(daysSinceVisit));

    let messageStatus: "sent" | "pending" = "pending";

    if (useEvolution) {
      const result = await sendWhatsappMessage(client.phone, message);
      if (result.success) {
        messageStatus = "sent";
        sentCount++;
      } else {
        failedCount++;
        console.error(
          `Campaign ${id}: failed to send to ${client.name}: ${result.error}`
        );
      }
      // Delay 1.5-3s between messages to avoid rate limiting
      await delay(1500 + Math.random() * 1500);
    } else {
      // Fallback: generate WhatsApp links (manual mode)
      messageStatus = "sent";
      sentCount++;
      whatsappLinks.push({
        clientName: client.name,
        link: buildWhatsappLink(client.phone, message),
      });
    }

    await prisma.campaignMessage.create({
      data: {
        campaignId: id,
        clientId: client.id,
        status: messageStatus,
        sentAt: messageStatus === "sent" ? now : undefined,
      },
    });
  }

  // Update campaign status
  await prisma.campaign.update({
    where: { id },
    data: {
      status: "sent",
      sentCount,
      sentAt: now,
    },
  });

  if (useEvolution) {
    return NextResponse.json({
      success: true,
      data: {
        id: campaign.id,
        mode: "automatic",
        status: "sent",
        recipientsCount: clients.length,
        sentCount,
        failedCount,
      },
    });
  }

  // Manual fallback response
  return NextResponse.json({
    success: true,
    data: {
      id: campaign.id,
      mode: "manual",
      status: "sent",
      recipientsCount: clients.length,
      whatsappLinks: whatsappLinks.slice(0, 50),
    },
  });
}
