import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        onboardingStep: 5,
        onboardingCompleted: true,
      },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, slug: true },
    });

    const servicesCount = await prisma.service.count({ where: { tenantId } });
    const professionalsCount = await prisma.professional.count({
      where: { tenantId, isActive: true },
    });

    return NextResponse.json({
      success: true,
      tenantName: tenant?.name,
      slug: tenant?.slug,
      servicesCount,
      professionalsCount,
    });
  } catch (error) {
    console.error("Onboarding concluir error:", error);
    return NextResponse.json(
      { error: "Erro ao finalizar onboarding." },
      { status: 500 }
    );
  }
}
