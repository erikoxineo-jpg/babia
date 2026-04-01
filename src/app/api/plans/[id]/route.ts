import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// PUT — atualizar plano
export async function PUT(
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

  const plan = await prisma.plan.findFirst({ where: { id, tenantId } });
  if (!plan) {
    return NextResponse.json({ error: "Plano não encontrado." }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { name, description, price, durationDays, totalSessions, isActive } = body as {
      name?: string;
      description?: string;
      price?: number;
      durationDays?: number;
      totalSessions?: number;
      isActive?: boolean;
    };

    const updated = await prisma.plan.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(price !== undefined && { price }),
        ...(durationDays !== undefined && { durationDays }),
        ...(totalSessions !== undefined && { totalSessions }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        price: Number(updated.price),
        isActive: updated.isActive,
      },
    });
  } catch (error) {
    console.error("Update plan error:", error);
    return NextResponse.json({ error: "Erro ao atualizar plano." }, { status: 500 });
  }
}
