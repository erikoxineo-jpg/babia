import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { timeToMinutes, rangesOverlap } from "@/lib/availability";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const user = session.user as Record<string, unknown>;
  const tenantId = user.tenantId as string;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const todayDate = new Date(todayStr + "T00:00:00Z");
  const dayOfWeek = new Date(todayStr + "T12:00:00").getDay();

  // Week start (Monday)
  const weekStart = new Date(todayDate);
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  weekStart.setDate(weekStart.getDate() - daysSinceMonday);

  // ── Parallel queries ──
  const [
    todayAppointments,
    weekNoShows,
    professionals,
    nextAppointment,
    atRiskClients,
    waitlistCount,
  ] = await Promise.all([
    // 1. Today's appointments
    prisma.appointment.findMany({
      where: { tenantId, date: todayDate },
      select: {
        id: true,
        status: true,
        startTime: true,
        endTime: true,
        price: true,
        client: { select: { name: true } },
        service: { select: { name: true } },
        professional: { select: { id: true, name: true } },
      },
      orderBy: [{ startTime: "asc" }],
    }),

    // 2. No-shows this week
    prisma.appointment.count({
      where: {
        tenantId,
        status: "no_show",
        date: { gte: weekStart, lte: todayDate },
      },
    }),

    // 3. Active professionals with schedules/breaks/blocks for today
    prisma.professional.findMany({
      where: { tenantId, isActive: true, deletedAt: null },
      select: {
        id: true,
        schedules: {
          where: { dayOfWeek, isActive: true },
          select: { startTime: true, endTime: true },
        },
        breaks: {
          where: { dayOfWeek },
          select: { startTime: true, endTime: true },
        },
        blocks: {
          where: { date: todayDate },
          select: { startTime: true, endTime: true },
        },
      },
    }),

    // 4. Next upcoming appointment (pending/confirmed, from now)
    prisma.appointment.findFirst({
      where: {
        tenantId,
        status: { in: ["pending", "confirmed"] },
        date: { gte: todayDate },
      },
      select: {
        id: true,
        startTime: true,
        date: true,
        client: { select: { name: true } },
        service: { select: { name: true } },
        professional: { select: { name: true } },
      },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    }),

    // 5. At-risk clients count
    prisma.client.count({
      where: { tenantId, status: "at_risk", deletedAt: null },
    }),

    // 6. Waitlist count
    prisma.waitlist.count({
      where: { tenantId, status: "waiting" },
    }),
  ]);

  // ── Appointment breakdown ──
  const breakdown = { total: 0, completed: 0, confirmed: 0, pending: 0, cancelled: 0, no_show: 0 };
  for (const apt of todayAppointments) {
    breakdown.total++;
    if (apt.status === "completed") breakdown.completed++;
    else if (apt.status === "confirmed") breakdown.confirmed++;
    else if (apt.status === "pending") breakdown.pending++;
    else if (apt.status === "cancelled") breakdown.cancelled++;
    else if (apt.status === "no_show") breakdown.no_show++;
  }

  // ── Revenue ──
  let revenueToday = 0;
  let revenueProjected = 0;
  for (const apt of todayAppointments) {
    const price = Number(apt.price);
    if (apt.status === "completed") {
      revenueToday += price;
      revenueProjected += price;
    } else if (apt.status === "pending" || apt.status === "confirmed") {
      revenueProjected += price;
    }
  }

  // ── Occupancy rate & gaps ──
  let totalSlots = 0;
  let occupiedSlots = 0;
  let gapsCount = 0;
  const slotSize = 30; // 30-minute slots

  for (const prof of professionals) {
    const schedule = prof.schedules[0];
    if (!schedule) continue;

    const schedStart = timeToMinutes(schedule.startTime);
    const schedEnd = timeToMinutes(schedule.endTime);

    // Get blocked ranges for this professional
    const blocked: { start: number; end: number }[] = [];
    for (const brk of prof.breaks) {
      blocked.push({ start: timeToMinutes(brk.startTime), end: timeToMinutes(brk.endTime) });
    }
    for (const blk of prof.blocks) {
      blocked.push({ start: timeToMinutes(blk.startTime), end: timeToMinutes(blk.endTime) });
    }

    // Get this professional's appointments
    const profAppointments = todayAppointments.filter((apt) => {
      return apt.professional.id === prof.id && apt.status !== "cancelled";
    });

    // Count slots in 30-min increments
    for (let slotStart = schedStart; slotStart + slotSize <= schedEnd; slotStart += slotSize) {
      const slotEnd = slotStart + slotSize;

      // Skip if overlaps with break/block
      const isBlocked = blocked.some((b) => rangesOverlap(slotStart, slotEnd, b.start, b.end));
      if (isBlocked) continue;

      totalSlots++;

      // Check if any appointment occupies this slot
      const isOccupied = profAppointments.some((apt) =>
        rangesOverlap(slotStart, slotEnd, timeToMinutes(apt.startTime), timeToMinutes(apt.endTime))
      );

      if (isOccupied) {
        occupiedSlots++;
      } else {
        gapsCount++;
      }
    }
  }

  const occupancyRate = totalSlots > 0 ? Math.round((occupiedSlots / totalSlots) * 1000) / 10 : 0;

  // ── Filter next appointment to be actually upcoming ──
  let filteredNext = nextAppointment;
  if (filteredNext) {
    const aptDateStr = filteredNext.date.toISOString().split("T")[0];
    if (aptDateStr === todayStr) {
      const aptMinutes = timeToMinutes(filteredNext.startTime);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (aptMinutes < currentMinutes) {
        filteredNext = null;
      }
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      date: todayStr,
      appointments: breakdown,
      revenue: {
        today: Math.round(revenueToday * 100) / 100,
        projected: Math.round(revenueProjected * 100) / 100,
      },
      occupancy_rate: occupancyRate,
      next_appointment: filteredNext
        ? {
            id: filteredNext.id,
            time: filteredNext.startTime,
            client: filteredNext.client.name,
            service: filteredNext.service.name,
            professional: filteredNext.professional.name,
          }
        : null,
      gaps_count: gapsCount,
      waitlist_count: waitlistCount,
      week_no_shows: weekNoShows,
      at_risk_clients: atRiskClients,
    },
  });
}
