import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/rbac";
import { fireWebhook } from "@/lib/n8n";

export async function POST() {
  const auth = await requireAuth(["owner"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;

  try {
    const servicesCount = await prisma.service.count({ where: { tenantId } });
    const professionalsCount = await prisma.professional.count({
      where: { tenantId, isActive: true },
    });

    // Set viewMode based on team size
    const viewMode = professionalsCount > 1 ? "team" : "solo";

    await prisma.tenant.update({
      where: { id: tenantId },
      data: {
        onboardingStep: 5,
        onboardingCompleted: true,
        settings: {
          upsert: {
            create: { viewMode },
            update: { viewMode },
          },
        },
      },
    });

    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { name: true, slug: true, whatsapp: true, phone: true },
    });

    // Fire-and-forget: notificar N8N sobre conclusão do onboarding
    if (tenant) {
      fireWebhook("onboarding.completed", {
        tenantName: tenant.name,
        slug: tenant.slug,
        phone: tenant.whatsapp || tenant.phone,
        servicesCount,
        professionalsCount,
        bookingUrl: `https://babia.oxineo.com.br/agendar/${tenant.slug}`,
      }).catch(() => {});
    }

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
