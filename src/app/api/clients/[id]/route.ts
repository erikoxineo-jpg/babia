import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — ficha completa do cliente
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
  const { id } = await params;

  const client = await prisma.client.findFirst({
    where: { id, tenantId, deletedAt: null },
  });

  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
  }

  // Buscar dados complementares em paralelo
  const [appointments, nextAppointment] = await Promise.all([
    // Últimos atendimentos para calcular profissional/serviço preferido
    prisma.appointment.findMany({
      where: { clientId: id, tenantId, status: "completed" },
      select: {
        professionalId: true,
        serviceId: true,
        professional: { select: { id: true, name: true } },
        service: { select: { id: true, name: true } },
      },
      orderBy: { date: "desc" },
      take: 20,
    }),
    // Próximo agendamento
    prisma.appointment.findFirst({
      where: {
        clientId: id,
        tenantId,
        status: { in: ["pending", "confirmed"] },
        date: { gte: new Date() },
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        service: { select: { name: true } },
        professional: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),
  ]);

  // Calcular profissional preferido
  const profCount: Record<string, { id: string; name: string; count: number }> = {};
  for (const apt of appointments) {
    const key = apt.professionalId;
    if (!profCount[key]) {
      profCount[key] = { id: apt.professional.id, name: apt.professional.name, count: 0 };
    }
    profCount[key].count++;
  }
  const preferredProfessional = Object.values(profCount).sort((a, b) => b.count - a.count)[0] ?? null;

  // Calcular serviços preferidos
  const svcCount: Record<string, { id: string; name: string; count: number }> = {};
  for (const apt of appointments) {
    const key = apt.serviceId;
    if (!svcCount[key]) {
      svcCount[key] = { id: apt.service.id, name: apt.service.name, count: 0 };
    }
    svcCount[key].count++;
  }
  const preferredServices = Object.values(svcCount).sort((a, b) => b.count - a.count).slice(0, 5);

  // Contar no-shows
  const noShowCount = await prisma.appointment.count({
    where: { clientId: id, tenantId, status: "no_show" },
  });

  return NextResponse.json({
    id: client.id,
    name: client.name,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
    status: client.status,
    totalVisits: client.totalVisits,
    totalSpent: Number(client.totalSpent),
    averageTicket: Number(client.averageTicket),
    lastVisit: client.lastVisit?.toISOString().split("T")[0] ?? null,
    firstVisit: client.firstVisit?.toISOString().split("T")[0] ?? null,
    noShowCount,
    preferredProfessional,
    preferredServices,
    nextAppointment: nextAppointment
      ? {
          id: nextAppointment.id,
          date: nextAppointment.date.toISOString().split("T")[0],
          startTime: nextAppointment.startTime,
          service: nextAppointment.service.name,
          professional: nextAppointment.professional.name,
        }
      : null,
    createdAt: client.createdAt.toISOString(),
  });
}

// PUT — atualizar dados do cliente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;
  const { id } = await params;

  try {
    const body = await request.json();
    const { name, phone, email, notes } = body as {
      name?: string;
      phone?: string;
      email?: string;
      notes?: string;
    };

    const client = await prisma.client.findFirst({
      where: { id, tenantId, deletedAt: null },
    });

    if (!client) {
      return NextResponse.json({ error: "Cliente não encontrado." }, { status: 404 });
    }

    // Verificar duplicata de telefone
    if (phone && phone.trim() !== client.phone) {
      const dup = await prisma.client.findFirst({
        where: { tenantId, phone: phone.trim(), id: { not: id }, deletedAt: null },
      });
      if (dup) {
        return NextResponse.json({ error: "Já existe outro cliente com esse telefone." }, { status: 409 });
      }
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(email !== undefined && { email: email?.trim() || null }),
        ...(notes !== undefined && { notes: notes?.trim() || null }),
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        notes: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update client error:", error);
    return NextResponse.json({ error: "Erro ao atualizar cliente." }, { status: 500 });
  }
}
