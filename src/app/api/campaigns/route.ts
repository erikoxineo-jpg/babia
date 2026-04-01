import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// GET — lista campanhas
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get("per_page") ?? "20")));

  const where: Prisma.CampaignWhereInput = { tenantId };
  if (status && status !== "all") {
    where.status = status as "draft" | "sending" | "sent" | "completed";
  }

  const [campaigns, total] = await Promise.all([
    prisma.campaign.findMany({
      where,
      include: { _count: { select: { messages: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.campaign.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: campaigns.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status,
      template: c.template,
      targetSegment: c.targetSegment,
      sentCount: c.sentCount,
      responseCount: c.responseCount,
      recipientsCount: c._count.messages,
      sentAt: c.sentAt?.toISOString() ?? null,
      createdAt: c.createdAt.toISOString(),
    })),
    meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  });
}

// POST — criar campanha
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  try {
    const body = await request.json();
    const { name, type, template, targetSegment } = body as {
      name: string;
      type: "reactivation" | "fill_slots" | "promotion";
      template: string;
      targetSegment?: Record<string, unknown>;
    };

    if (!name?.trim() || !template?.trim()) {
      return NextResponse.json({ error: "Nome e template são obrigatórios." }, { status: 422 });
    }

    // Estimate recipients based on segment
    const segment = targetSegment ?? {};
    let estimatedRecipients = 0;

    if (type === "reactivation") {
      const daysMin = (segment.daysInactiveMin as number) ?? 30;
      const dateCutoff = new Date();
      dateCutoff.setDate(dateCutoff.getDate() - daysMin);

      estimatedRecipients = await prisma.client.count({
        where: {
          tenantId,
          deletedAt: null,
          status: { in: ["at_risk", "inactive"] },
          lastVisit: { lte: dateCutoff },
        },
      });
    } else {
      estimatedRecipients = await prisma.client.count({
        where: { tenantId, deletedAt: null, status: "active" },
      });
    }

    const campaign = await prisma.campaign.create({
      data: {
        tenantId,
        name: name.trim(),
        type,
        template: template.trim(),
        targetSegment: segment as Prisma.InputJsonValue,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: campaign.id,
          name: campaign.name,
          type: campaign.type,
          status: campaign.status,
          template: campaign.template,
          estimatedRecipients,
          createdAt: campaign.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create campaign error:", error);
    return NextResponse.json({ error: "Erro ao criar campanha." }, { status: 500 });
  }
}
