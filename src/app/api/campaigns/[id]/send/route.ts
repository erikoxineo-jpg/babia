import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildWhatsappLink } from "@/lib/notifications";

// POST — disparar campanha
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id, tenantId },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }

  if (campaign.status !== "draft") {
    return NextResponse.json({ error: "Campanha já foi enviada." }, { status: 409 });
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
    return NextResponse.json({ error: "Nenhum destinatário encontrado." }, { status: 422 });
  }

  // Create messages and build WhatsApp links
  const now = new Date();
  const whatsappLinks: { clientName: string; link: string | null }[] = [];

  await prisma.$transaction(async (tx) => {
    for (const client of clients) {
      // Replace template variables
      const daysSinceVisit = client.lastVisit
        ? Math.floor((now.getTime() - client.lastVisit.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      const message = campaign.template
        .replace(/\{\{client_name\}\}/g, client.name)
        .replace(/\{\{barbershop_name\}\}/g, tenant?.name ?? "")
        .replace(/\{\{last_visit_days\}\}/g, String(daysSinceVisit));

      await tx.campaignMessage.create({
        data: {
          campaignId: id,
          clientId: client.id,
          status: "sent",
          sentAt: now,
        },
      });

      whatsappLinks.push({
        clientName: client.name,
        link: buildWhatsappLink(client.phone, message),
      });
    }

    await tx.campaign.update({
      where: { id },
      data: {
        status: "sent",
        sentCount: clients.length,
        sentAt: now,
      },
    });
  });

  return NextResponse.json({
    success: true,
    data: {
      id: campaign.id,
      status: "sent",
      recipientsCount: clients.length,
      whatsappLinks: whatsappLinks.slice(0, 50),
    },
  });
}
