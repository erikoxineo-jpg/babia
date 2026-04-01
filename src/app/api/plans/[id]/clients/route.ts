import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — listar clientes vinculados ao plano
export async function GET(
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

  const plan = await prisma.plan.findFirst({ where: { id, tenantId } });
  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  const clientPlans = await prisma.clientPlan.findMany({
    where: { planId: id },
    include: { client: { select: { id: true, name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: clientPlans.map((cp) => ({
      id: cp.id,
      client: cp.client,
      sessionsUsed: cp.sessionsUsed,
      sessionsTotal: cp.sessionsTotal,
      startDate: cp.startDate.toISOString().split("T")[0],
      endDate: cp.endDate.toISOString().split("T")[0],
      status: cp.status,
    })),
  });
}

// POST — vincular cliente ao plano
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
  const { id } = await params;

  try {
    const body = await request.json();
    const { clientId } = body as { clientId: string };

    if (!clientId) {
      return NextResponse.json({ error: "ID do cliente é obrigatório." }, { status: 422 });
    }

    const [plan, client] = await Promise.all([
      prisma.plan.findFirst({ where: { id, tenantId, isActive: true } }),
      prisma.client.findFirst({ where: { id: clientId, tenantId, deletedAt: null } }),
    ]);

    if (!plan) {
      return NextResponse.json({ error: "Plano não encontrado ou inativo." }, { status: 404 });
    }
    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    }

    // Check if client already has an active plan of this type
    const existing = await prisma.clientPlan.findFirst({
      where: { clientId, planId: id, status: "active" },
    });
    if (existing) {
      return NextResponse.json({ error: "Cliente já possui este plano ativo." }, { status: 409 });
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationDays);

    const clientPlan = await prisma.clientPlan.create({
      data: {
        clientId,
        planId: id,
        sessionsTotal: plan.totalSessions,
        startDate,
        endDate,
      },
      include: { client: { select: { id: true, name: true } } },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: clientPlan.id,
          client: clientPlan.client,
          sessionsTotal: clientPlan.sessionsTotal,
          startDate: clientPlan.startDate.toISOString().split("T")[0],
          endDate: clientPlan.endDate.toISOString().split("T")[0],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Link client plan error:", error);
    return NextResponse.json({ error: "Erro ao vincular plano." }, { status: 500 });
  }
}
