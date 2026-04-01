import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  try {
    const body = await request.json();
    const { schedule } = body as {
      schedule: {
        dayOfWeek: number;
        isActive: boolean;
        startTime: string;
        endTime: string;
        hasBreak: boolean;
        breakStart?: string;
        breakEnd?: string;
      }[];
    };

    if (!schedule || schedule.length !== 7) {
      return NextResponse.json(
        { error: "Envie os 7 dias da semana." },
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
      await tx.professionalSchedule.deleteMany({
        where: { professionalId: ownerPro.id },
      });
      await tx.professionalBreak.deleteMany({
        where: { professionalId: ownerPro.id },
      });

      for (const day of schedule) {
        await tx.professionalSchedule.create({
          data: {
            professionalId: ownerPro.id,
            dayOfWeek: day.dayOfWeek,
            startTime: day.startTime,
            endTime: day.endTime,
            isActive: day.isActive,
          },
        });

        if (day.isActive && day.hasBreak && day.breakStart && day.breakEnd) {
          await tx.professionalBreak.create({
            data: {
              professionalId: ownerPro.id,
              dayOfWeek: day.dayOfWeek,
              startTime: day.breakStart,
              endTime: day.breakEnd,
            },
          });
        }
      }

      const workingDays = schedule
        .filter((d) => d.isActive)
        .map((d) => d.dayOfWeek);

      await tx.tenantSettings.update({
        where: { tenantId },
        data: { workingDays },
      });

      const tenant = await tx.tenant.findUnique({ where: { id: tenantId } });
      await tx.tenant.update({
        where: { id: tenantId },
        data: { onboardingStep: Math.max(2, tenant!.onboardingStep) },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Onboarding horarios error:", error);
    return NextResponse.json(
      { error: "Erro ao salvar horários." },
      { status: 500 }
    );
  }
}
