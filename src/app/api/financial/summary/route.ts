import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month";

  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let startDate: Date;
    let comparisonStart: Date;
    let comparisonEnd: Date;

    if (period === "today") {
      startDate = today;
      // Comparação: ontem
      comparisonStart = new Date(today);
      comparisonStart.setDate(comparisonStart.getDate() - 1);
      comparisonEnd = today;
    } else if (period === "week") {
      startDate = new Date(today);
      const dayOfWeek = startDate.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Segunda como início
      startDate.setDate(startDate.getDate() - diff);
      // Comparação: semana anterior
      comparisonStart = new Date(startDate);
      comparisonStart.setDate(comparisonStart.getDate() - 7);
      comparisonEnd = new Date(startDate);
    } else {
      // month
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      // Comparação: mês anterior
      comparisonStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      comparisonEnd = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1);

    // Buscar agendamentos completados no período
    const appointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        status: "completed",
        date: { gte: startDate, lt: endDate },
      },
      include: {
        service: { select: { name: true } },
      },
    });

    // Buscar transações no período para métodos de pagamento
    const transactions = await prisma.transaction.findMany({
      where: {
        tenantId,
        date: { gte: startDate, lt: endDate },
      },
    });

    // Receita do período
    const revenue = appointments.reduce((sum, apt) => sum + Number(apt.price), 0);
    const completedCount = appointments.length;
    const averageTicket = completedCount > 0 ? revenue / completedCount : 0;

    // Receita do período de comparação
    const comparisonAppointments = await prisma.appointment.findMany({
      where: {
        tenantId,
        status: "completed",
        date: { gte: comparisonStart, lt: comparisonEnd },
      },
      select: { price: true },
    });
    const comparisonRevenue = comparisonAppointments.reduce(
      (sum, apt) => sum + Number(apt.price), 0
    );

    // Agrupar por método de pagamento (das transactions)
    const methodMap = new Map<string, { total: number; count: number }>();
    for (const tx of transactions) {
      const existing = methodMap.get(tx.paymentMethod) || { total: 0, count: 0 };
      existing.total += Number(tx.amount);
      existing.count += 1;
      methodMap.set(tx.paymentMethod, existing);
    }

    // Se não há transactions ainda, agrupar dos appointments (fallback)
    if (transactions.length === 0 && appointments.length > 0) {
      // Sem dados de payment method, mostra tudo como "não registrado"
      methodMap.set("not_registered", { total: revenue, count: completedCount });
    }

    const paymentMethods = Array.from(methodMap.entries())
      .map(([method, data]) => ({ method, total: data.total, count: data.count }))
      .sort((a, b) => b.total - a.total);

    // Receita diária
    const dailyMap = new Map<string, number>();
    for (const apt of appointments) {
      const dateStr = apt.date.toISOString().split("T")[0];
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + Number(apt.price));
    }
    const dailyRevenue = Array.from(dailyMap.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Top serviços
    const serviceMap = new Map<string, { revenue: number; count: number }>();
    for (const apt of appointments) {
      const name = apt.service.name;
      const existing = serviceMap.get(name) || { revenue: 0, count: 0 };
      existing.revenue += Number(apt.price);
      existing.count += 1;
      serviceMap.set(name, existing);
    }
    const topServices = Array.from(serviceMap.entries())
      .map(([name, data]) => ({ name, revenue: data.revenue, count: data.count }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        revenue,
        completedCount,
        averageTicket,
        comparisonRevenue,
        paymentMethods,
        dailyRevenue,
        topServices,
      },
    });
  } catch (error) {
    console.error("Financial summary error:", error);
    return NextResponse.json({ error: "Erro ao carregar resumo financeiro." }, { status: 500 });
  }
}
