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

// GET — listar todos os tenants
export async function GET() {
  const admin = await verifySuperAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  }

  const tenants = await prisma.tenant.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      name: true,
      slug: true,
      phone: true,
      email: true,
      plan: true,
      status: true,
      onboardingCompleted: true,
      createdAt: true,
      _count: {
        select: {
          professionals: { where: { isActive: true, deletedAt: null } },
          clients: { where: { deletedAt: null } },
          appointments: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    data: tenants.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      phone: t.phone,
      email: t.email,
      plan: t.plan,
      status: t.status,
      onboardingCompleted: t.onboardingCompleted,
      createdAt: t.createdAt.toISOString(),
      totalProfessionals: t._count.professionals,
      totalClients: t._count.clients,
      totalAppointments: t._count.appointments,
    })),
  });
}
