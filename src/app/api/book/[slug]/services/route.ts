import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET — serviços disponíveis para agendamento público
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

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

  // Buscar serviços ativos que pelo menos 1 profissional ativo atende
  const services = await prisma.service.findMany({
    where: {
      tenantId: tenant.id,
      isActive: true,
      professionals: {
        some: {
          professional: { isActive: true, deletedAt: null },
        },
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      durationMinutes: true,
      price: true,
      category: true,
    },
    orderBy: { displayOrder: "asc" },
  });

  return NextResponse.json(
    services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMinutes: s.durationMinutes,
      price: Number(s.price),
      category: s.category,
    }))
  );
}
