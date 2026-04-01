import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  try {
    const services = await prisma.service.findMany({
      where: { tenantId },
      select: {
        id: true,
        name: true,
        durationMinutes: true,
        price: true,
        category: true,
        isActive: true,
        displayOrder: true,
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: services.map((s) => ({
        ...s,
        price: Number(s.price),
      })),
    });
  } catch (error) {
    console.error("GET onboarding servicos error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar serviços." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  try {
    const body = await request.json();
    const { services } = body as {
      services: {
        name: string;
        durationMinutes: number;
        price: number;
        category: string;
      }[];
    };

    if (!services || services.length === 0) {
      return NextResponse.json(
        { error: "Adicione pelo menos 1 serviço." },
        { status: 422 }
      );
    }

    const ownerPro = await prisma.professional.findFirst({
      where: { tenantId, user: { role: "owner" } },
    });

    if (!ownerPro) {
      return NextResponse.json(
        { error: "Profissional do owner não encontrado." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.professionalService.deleteMany({
        where: { professional: { tenantId } },
      });
      await tx.service.deleteMany({ where: { tenantId } });

      for (let i = 0; i < services.length; i++) {
        const s = services[i];
        const service = await tx.service.create({
          data: {
            tenantId,
            name: s.name,
            durationMinutes: s.durationMinutes,
            price: s.price,
            category: s.category,
            displayOrder: i,
          },
        });

        await tx.professionalService.create({
          data: {
            professionalId: ownerPro.id,
            serviceId: service.id,
          },
        });
      }

      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      await tx.tenant.update({
        where: { id: tenantId },
        data: { onboardingStep: Math.max(3, tenant!.onboardingStep) },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding servicos error:", error);
    return NextResponse.json(
      { error: "Erro ao salvar serviços." },
      { status: 500 }
    );
  }
}
