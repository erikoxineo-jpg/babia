import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/rbac";

// GET — detalhes da campanha + resultados
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth();
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;
  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({
    where: { id, tenantId },
    include: {
      messages: {
        include: { client: { select: { id: true, name: true, phone: true } } },
        orderBy: { sentAt: "desc" },
        take: 50,
      },
      _count: { select: { messages: true } },
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }

  const sentMessages = campaign.messages.filter((m) => m.status === "sent");
  const respondedMessages = campaign.messages.filter((m) => m.status === "responded");

  return NextResponse.json({
    success: true,
    data: {
      id: campaign.id,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      template: campaign.template,
      targetSegment: campaign.targetSegment,
      sentCount: campaign.sentCount,
      responseCount: campaign.responseCount,
      recipientsCount: campaign._count.messages,
      metrics: {
        total: campaign._count.messages,
        sent: sentMessages.length,
        responded: respondedMessages.length,
      },
      messages: campaign.messages.map((m) => ({
        id: m.id,
        client: m.client,
        status: m.status,
        sentAt: m.sentAt?.toISOString() ?? null,
      })),
      sentAt: campaign.sentAt?.toISOString() ?? null,
      createdAt: campaign.createdAt.toISOString(),
    },
  });
}

// PUT — atualizar campanha (só draft, owner/admin)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(["owner", "admin"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;
  const { id } = await params;

  const campaign = await prisma.campaign.findFirst({ where: { id, tenantId } });
  if (!campaign) {
    return NextResponse.json({ error: "Campanha não encontrada." }, { status: 404 });
  }
  if (campaign.status !== "draft") {
    return NextResponse.json({ error: "Só é possível editar campanhas em rascunho." }, { status: 409 });
  }

  try {
    const body = await request.json();
    const { name, template } = body as { name?: string; template?: string };

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(template !== undefined && { template: template.trim() }),
      },
    });

    return NextResponse.json({
      success: true,
      data: { id: updated.id, name: updated.name, template: updated.template },
    });
  } catch (error) {
    console.error("Update campaign error:", error);
    return NextResponse.json({ error: "Erro ao atualizar campanha." }, { status: 500 });
  }
}
