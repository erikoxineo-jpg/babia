import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/rbac";

export async function GET() {
  const auth = await requireAuth(["owner"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;

  try {
    const professionals = await prisma.professional.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        id: true,
        name: true,
        phone: true,
        specialty: true,
        isActive: true,
        displayOrder: true,
        services: {
          include: {
            service: {
              select: { id: true, name: true },
            },
          },
        },
      },
      orderBy: { displayOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      data: professionals.map((p) => ({
        id: p.id,
        name: p.name,
        phone: p.phone,
        specialty: p.specialty,
        isActive: p.isActive,
        displayOrder: p.displayOrder,
        services: p.services.map((ps) => ({
          id: ps.service.id,
          name: ps.service.name,
        })),
      })),
    });
  } catch (error) {
    console.error("GET onboarding equipe error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar profissionais." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const auth = await requireAuth(["owner"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;

  try {
    const body = await request.json();
    const { professionals, mode } = body as {
      professionals: {
        name: string;
        phone?: string;
        serviceIds: string[];
      }[];
      mode?: "solo" | "team";
    };

    const ownerPro = await prisma.professional.findFirst({
      where: { tenantId, user: { role: "owner" } },
      include: { schedules: true, breaks: true },
    });

    if (!ownerPro) {
      return NextResponse.json(
        { error: "Profissional do owner não encontrado." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // Delete non-owner professionals created during onboarding
      await tx.professional.deleteMany({
        where: { tenantId, userId: null },
      });

      if (professionals && professionals.length > 0) {
        for (let i = 0; i < professionals.length; i++) {
          const p = professionals[i];
          const pro = await tx.professional.create({
            data: {
              tenantId,
              name: p.name,
              phone: p.phone || null,
              displayOrder: i + 1,
            },
          });

          // Copy owner's schedule to new professional
          for (const sched of ownerPro.schedules) {
            await tx.professionalSchedule.create({
              data: {
                professionalId: pro.id,
                dayOfWeek: sched.dayOfWeek,
                startTime: sched.startTime,
                endTime: sched.endTime,
                isActive: sched.isActive,
              },
            });
          }

          for (const brk of ownerPro.breaks) {
            await tx.professionalBreak.create({
              data: {
                professionalId: pro.id,
                dayOfWeek: brk.dayOfWeek,
                startTime: brk.startTime,
                endTime: brk.endTime,
              },
            });
          }

          // Link services
          for (const serviceId of p.serviceIds) {
            await tx.professionalService.create({
              data: {
                professionalId: pro.id,
                serviceId,
              },
            });
          }
        }
      }

      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      await tx.tenant.update({
        where: { id: tenantId },
        data: { onboardingStep: Math.max(4, tenant!.onboardingStep) },
      });

      await tx.tenantSettings.upsert({
        where: { tenantId },
        create: { tenantId, viewMode: mode === "solo" ? "solo" : "full" },
        update: { viewMode: mode === "solo" ? "solo" : "full" },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding equipe error:", error);
    return NextResponse.json(
      { error: "Erro ao salvar equipe." },
      { status: 500 }
    );
  }
}
