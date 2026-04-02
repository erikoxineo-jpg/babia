import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "";

async function verifySuperAdmin(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const email = (session.user as Record<string, unknown>).email as string;
  if (!SUPER_ADMIN_EMAIL || email !== SUPER_ADMIN_EMAIL) return null;
  return email;
}

// PATCH — alterar status do tenant (active/suspended)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await verifySuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { status, plan } = body as { status?: string; plan?: string };

    const validStatuses = ["active", "suspended", "cancelled"];
    const validPlans = ["free", "starter", "professional", "premium"];

    const updateData: Record<string, unknown> = {};

    if (status) {
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: "Status inválido." }, { status: 422 });
      }
      updateData.status = status;
    }

    if (plan) {
      if (!validPlans.includes(plan)) {
        return NextResponse.json({ error: "Plano inválido." }, { status: 422 });
      }
      updateData.plan = plan;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nenhum campo para atualizar." }, { status: 422 });
    }

    const tenant = await prisma.tenant.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        status: true,
        plan: true,
      },
    });

    return NextResponse.json({ success: true, data: tenant });
  } catch {
    return NextResponse.json({ error: "Tenant não encontrado." }, { status: 404 });
  }
}
