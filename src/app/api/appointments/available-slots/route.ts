import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, getDayOfWeek } from "@/lib/availability";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const professionalId = searchParams.get("professional_id");
  const serviceId = searchParams.get("service_id");

  if (!date || !professionalId || !serviceId) {
    return NextResponse.json(
      { error: "Parâmetros date, professional_id e service_id são obrigatórios." },
      { status: 422 }
    );
  }

  const [professional, service] = await Promise.all([
    prisma.professional.findFirst({
      where: { id: professionalId, tenantId, isActive: true },
      include: {
        schedules: { where: { dayOfWeek: getDayOfWeek(date) } },
        breaks: { where: { dayOfWeek: getDayOfWeek(date) } },
        blocks: { where: { date: new Date(date + "T00:00:00") } },
        appointments: {
          where: {
            date: new Date(date + "T00:00:00"),
            status: { not: "cancelled" },
          },
          select: { startTime: true, endTime: true, status: true },
        },
      },
    }),
    prisma.service.findFirst({
      where: { id: serviceId, tenantId, isActive: true },
      select: { durationMinutes: true, intervalMinutes: true },
    }),
  ]);

  if (!professional) {
    return NextResponse.json({ error: "Profissional não encontrado." }, { status: 404 });
  }
  if (!service) {
    return NextResponse.json({ error: "Serviço não encontrado." }, { status: 404 });
  }

  const schedule = professional.schedules[0] ?? null;
  const slots = getAvailableSlots({
    schedule: schedule
      ? { startTime: schedule.startTime, endTime: schedule.endTime, isActive: schedule.isActive }
      : null,
    breaks: professional.breaks.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
    })),
    blocks: professional.blocks.map((b) => ({
      startTime: b.startTime,
      endTime: b.endTime,
      reason: b.reason,
    })),
    appointments: professional.appointments.map((a) => ({
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
    })),
    serviceDurationMinutes: service.durationMinutes,
    serviceIntervalMinutes: service.intervalMinutes,
    date,
  });

  return NextResponse.json({ slots });
}
