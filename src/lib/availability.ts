import type { AvailableSlotsInput, TimeSlot } from "@/types/agenda";

// ==========================================
// Motor de Disponibilidade (função pura)
// ==========================================

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function rangesOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + "T12:00:00");
  return date.getDay();
}

export function getAvailableSlots(input: AvailableSlotsInput): TimeSlot[] {
  const { schedule, breaks, blocks, appointments, serviceDurationMinutes, serviceIntervalMinutes, date } = input;

  // 1. Sem schedule ou dia inativo → sem slots
  if (!schedule || !schedule.isActive) return [];

  const schedStart = timeToMinutes(schedule.startTime);
  const schedEnd = timeToMinutes(schedule.endTime);
  const totalNeeded = serviceDurationMinutes + serviceIntervalMinutes;

  // 2. Montar lista de intervalos bloqueados
  const blocked: { start: number; end: number }[] = [];

  for (const brk of breaks) {
    blocked.push({
      start: timeToMinutes(brk.startTime),
      end: timeToMinutes(brk.endTime),
    });
  }

  for (const blk of blocks) {
    blocked.push({
      start: timeToMinutes(blk.startTime),
      end: timeToMinutes(blk.endTime),
    });
  }

  for (const apt of appointments) {
    if (apt.status === "cancelled") continue;
    blocked.push({
      start: timeToMinutes(apt.startTime),
      end: timeToMinutes(apt.endTime),
    });
  }

  // 3. Gerar slots de 15 em 15 min
  const slots: TimeSlot[] = [];
  for (let slotStart = schedStart; slotStart + totalNeeded <= schedEnd; slotStart += 15) {
    const slotEnd = slotStart + totalNeeded;

    // 4. Verificar se sobrepõe algum bloqueio
    const hasConflict = blocked.some((b) =>
      rangesOverlap(slotStart, slotEnd, b.start, b.end)
    );

    if (!hasConflict) {
      slots.push({
        start: minutesToTime(slotStart),
        end: minutesToTime(slotStart + serviceDurationMinutes),
      });
    }
  }

  // 5. Se data = hoje → remover slots no passado (+30min buffer)
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  if (date === todayStr) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes() + 30;
    return slots.filter((s) => timeToMinutes(s.start) >= currentMinutes);
  }

  return slots;
}
