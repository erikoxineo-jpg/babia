import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, isErrorResponse } from "@/lib/rbac";

// POST — criar profissional individual (pós-onboarding)
export async function POST(request: Request) {
  const auth = await requireAuth(["owner"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;

  try {
    const body = await request.json();
    const { name, phone, specialty, serviceIds } = body as {
      name: string;
      phone?: string;
      specialty?: string;
      serviceIds: string[];
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nome é obrigatório." }, { status: 400 });
    }

    // Get owner's schedule to copy
    const ownerPro = await prisma.professional.findFirst({
      where: { tenantId, user: { role: "owner" } },
      include: { schedules: true, breaks: true },
    });

    // Get max displayOrder
    const maxOrder = await prisma.professional.aggregate({
      where: { tenantId, deletedAt: null },
      _max: { displayOrder: true },
    });

    const pro = await prisma.$transaction(async (tx) => {
      const created = await tx.professional.create({
        data: {
          tenantId,
          name: name.trim(),
          phone: phone?.trim() || null,
          specialty: specialty?.trim() || null,
          displayOrder: (maxOrder._max.displayOrder ?? 0) + 1,
        },
      });

      // Copy owner's schedule
      if (ownerPro) {
        for (const sched of ownerPro.schedules) {
          await tx.professionalSchedule.create({
            data: {
              professionalId: created.id,
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
              professionalId: created.id,
              dayOfWeek: brk.dayOfWeek,
              startTime: brk.startTime,
              endTime: brk.endTime,
            },
          });
        }
      }

      // Link services
      for (const serviceId of serviceIds) {
        await tx.professionalService.create({
          data: { professionalId: created.id, serviceId },
        });
      }

      return created;
    });

    return NextResponse.json({ success: true, data: { id: pro.id } });
  } catch (error) {
    console.error("POST equipe error:", error);
    return NextResponse.json({ error: "Erro ao criar profissional." }, { status: 500 });
  }
}

// PATCH — editar profissional
export async function PATCH(request: Request) {
  const auth = await requireAuth(["owner"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;

  try {
    const body = await request.json();
    const { id, name, phone, specialty, serviceIds, isActive } = body as {
      id: string;
      name?: string;
      phone?: string;
      specialty?: string;
      serviceIds?: string[];
      isActive?: boolean;
    };

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }

    const pro = await prisma.professional.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!pro) {
      return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.professional.update({
        where: { id },
        data: {
          ...(name !== undefined && { name: name.trim() }),
          ...(phone !== undefined && { phone: phone.trim() || null }),
          ...(specialty !== undefined && { specialty: specialty.trim() || null }),
          ...(isActive !== undefined && { isActive }),
        },
      });

      if (serviceIds !== undefined) {
        await tx.professionalService.deleteMany({ where: { professionalId: id } });
        for (const serviceId of serviceIds) {
          await tx.professionalService.create({
            data: { professionalId: id, serviceId },
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH equipe error:", error);
    return NextResponse.json({ error: "Erro ao atualizar profissional." }, { status: 500 });
  }
}

// DELETE — soft delete profissional
export async function DELETE(request: Request) {
  const auth = await requireAuth(["owner"]);
  if (isErrorResponse(auth)) return auth;

  const { tenantId } = auth.user;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório." }, { status: 400 });
    }

    const pro = await prisma.professional.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!pro) {
      return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
    }

    // Don't allow deleting the owner
    if (pro.userId) {
      return NextResponse.json({ error: "Não é possível excluir o proprietário." }, { status: 400 });
    }

    await prisma.professional.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE equipe error:", error);
    return NextResponse.json({ error: "Erro ao excluir profissional." }, { status: 500 });
  }
}

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
