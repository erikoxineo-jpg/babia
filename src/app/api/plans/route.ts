import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — lista planos
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const plans = await prisma.plan.findMany({
    where: { tenantId },
    include: { _count: { select: { clientPlans: { where: { status: "active" } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: plans.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: Number(p.price),
      durationDays: p.durationDays,
      totalSessions: p.totalSessions,
      services: p.services,
      isActive: p.isActive,
      activeClients: p._count.clientPlans,
      createdAt: p.createdAt.toISOString(),
    })),
  });
}

// POST — criar plano
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  try {
    const body = await request.json();
    const { name, description, price, durationDays, totalSessions, services } = body as {
      name: string;
      description?: string;
      price: number;
      durationDays: number;
      totalSessions: number;
      services?: string[];
    };

    if (!name?.trim() || !price || !durationDays || !totalSessions) {
      return NextResponse.json({ error: "Nome, preço, duração e sessões são obrigatórios." }, { status: 422 });
    }

    const plan = await prisma.plan.create({
      data: {
        tenantId,
        name: name.trim(),
        description: description?.trim() || null,
        price,
        durationDays,
        totalSessions,
        services: services ?? [],
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: plan.id,
          name: plan.name,
          price: Number(plan.price),
          durationDays: plan.durationDays,
          totalSessions: plan.totalSessions,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create plan error:", error);
    return NextResponse.json({ error: "Erro ao criar plano." }, { status: 500 });
  }
}
