import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — profissionais disponíveis para agendamento público
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const serviceId = searchParams.get("service_id");

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    select: { id: true, onboardingCompleted: true },
  });

  if (!tenant || !tenant.onboardingCompleted) {
    return NextResponse.json(
      { error: "Barbearia não encontrada." },
      { status: 404 }
    );
  }

  const professionals = await prisma.professional.findMany({
    where: {
      tenantId: tenant.id,
      isActive: true,
      deletedAt: null,
      ...(serviceId && {
        services: { some: { serviceId } },
      }),
    },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
    },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json(professionals);
}
