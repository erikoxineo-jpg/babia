import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots, getDayOfWeek } from "@/lib/availability";

// GET — slots disponíveis para agendamento público
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const professionalId = searchParams.get("professional_id");
  const serviceId = searchParams.get("service_id");

  if (!date || !professionalId || !serviceId) {
    return NextResponse.json(
      { error: "Parâmetros obrigatórios: date, professional_id, service_id." },
      { status: 422 }
    );
  }

  // Validar data não é no passado
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  if (date < todayStr) {
    return NextResponse.json(
      { error: "Data não pode ser no passado." },
      { status: 422 }
    );
  }

  // Limite de 30 dias no futuro
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);
  const maxDateStr = `${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, "0")}-${String(maxDate.getDate()).padStart(2, "0")}`;
  if (date > maxDateStr) {
    return NextResponse.json(
      { error: "Só é possível consultar até 30 dias no futuro." },
      { status: 422 }
    );
  }

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

  const [professional, service] = await Promise.all([
    prisma.professional.findFirst({
      where: { id: professionalId, tenantId: tenant.id, isActive: true, deletedAt: null },
      include: {
        schedules: { where: { dayOfWeek: getDayOfWeek(date) } },
        breaks: { where: { dayOfWeek: getDayOfWeek(date) } },
        blocks: { where: { date: new Date(date + "T00:00:00") } },
        appointments: {
          where: {
            date: new Date(date + "T00:00:00"),
            status: { notIn: ["cancelled", "no_show"] },
          },
          select: { startTime: true, endTime: true, status: true },
        },
      },
    }),
    prisma.service.findFirst({
      where: { id: serviceId, tenantId: tenant.id, isActive: true },
      select: { durationMinutes: true, intervalMinutes: true },
    }),
  ]);

  if (!professional) {
    return NextResponse.json(
      { error: "Profissional não encontrado." },
      { status: 404 }
    );
  }
  if (!service) {
    return NextResponse.json(
      { error: "Serviço não encontrado." },
      { status: 404 }
    );
  }

  const schedule = professional.schedules[0] ?? null;
  const slots = getAvailableSlots({
    schedule: schedule
      ? { startTime: schedule.startTime, endTime: schedule.endTime, isActive: schedule.isActive }
      : null,
    breaks: professional.breaks.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
    blocks: professional.blocks.map((b) => ({ startTime: b.startTime, endTime: b.endTime })),
    appointments: professional.appointments.map((a) => ({
      startTime: a.startTime,
      endTime: a.endTime,
      status: a.status,
    })),
    serviceDurationMinutes: service.durationMinutes,
    serviceIntervalMinutes: service.intervalMinutes,
    date,
  });

  return NextResponse.json({ date, slots });
}
