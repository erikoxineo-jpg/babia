"use client";

import { useEffect, useState } from "react";
import type {
  AppointmentWithRelations,
  ProfessionalWithSchedule,
  ScheduleBlockData,
} from "@/types/agenda";
import { AppointmentCard } from "./AppointmentCard";

const PIXELS_PER_MINUTE = 48 / 15; // 48px por 15min = 3.2px/min

interface DayColumnProps {
  professional: ProfessionalWithSchedule;
  appointments: AppointmentWithRelations[];
  date: string;
  onSlotClick: (professionalId: string, time: string) => void;
  onAppointmentClick: (appointment: AppointmentWithRelations) => void;
  onBlockClick?: (block: ScheduleBlockData, professionalName: string) => void;
}

function generateTimeLabels(start: number, end: number): string[] {
  const labels: string[] = [];
  for (let m = start; m < end; m += 60) {
    const h = Math.floor(m / 60);
    labels.push(`${String(h).padStart(2, "0")}:00`);
  }
  return labels;
}

export function DayColumn({
  professional,
  appointments,
  date,
  onSlotClick,
  onAppointmentClick,
  onBlockClick,
}: DayColumnProps) {
  const [nowMinutes, setNowMinutes] = useState<number | null>(null);

  const schedule = professional.schedule;
  if (!schedule || !schedule.isActive) {
    return (
      <div className="flex-1 min-w-[200px]">
        <div className="text-center py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{professional.name}</span>
        </div>
        <div className="flex items-center justify-center h-40 text-xs text-gray-400">
          Folga
        </div>
      </div>
    );
  }

  const [sh, sm2] = schedule.startTime.split(":").map(Number);
  const [eh, em2] = schedule.endTime.split(":").map(Number);
  const startOfDay = sh * 60 + sm2;
  const endOfDay = eh * 60 + em2;
  const totalMinutes = endOfDay - startOfDay;
  const totalHeight = totalMinutes * PIXELS_PER_MINUTE;

  const timeLabels = generateTimeLabels(startOfDay, endOfDay);

  // Linha vermelha "agora"
  useEffect(() => {
    function update() {
      const now = new Date();
      const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      if (date === todayStr) {
        setNowMinutes(now.getHours() * 60 + now.getMinutes());
      } else {
        setNowMinutes(null);
      }
    }
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [date]);

  // Breaks (não clicáveis) e blocks (clicáveis)
  const breakRanges = professional.breaks.map((b) => ({
    start: b.startTime,
    end: b.endTime,
    label: "Intervalo",
  }));

  const blockRanges = professional.blocks.map((b) => ({
    id: b.id,
    start: b.startTime,
    end: b.endTime,
    label: b.reason || "Bloqueado",
    reason: b.reason,
    block: b,
  }));

  return (
    <div className="flex-1 min-w-[200px]">
      <div className="text-center py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{professional.name}</span>
      </div>

      <div
        className="relative border-r border-gray-100"
        style={{ height: `${totalHeight}px` }}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const y = e.clientY - rect.top;
          const clickMinute = Math.floor(y / PIXELS_PER_MINUTE) + startOfDay;
          // Snap to 15-minute intervals
          const snapped = Math.floor(clickMinute / 15) * 15;
          const h = Math.floor(snapped / 60);
          const m = snapped % 60;
          const time = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
          onSlotClick(professional.id, time);
        }}
      >
        {/* Time grid lines */}
        {timeLabels.map((label) => {
          const [lh, lm] = label.split(":").map(Number);
          const top = (lh * 60 + lm - startOfDay) * PIXELS_PER_MINUTE;
          return (
            <div
              key={label}
              className="absolute left-0 right-0 border-t border-gray-100"
              style={{ top: `${top}px` }}
            >
              <span className="text-[10px] text-gray-300 pl-1 select-none">
                {label}
              </span>
            </div>
          );
        })}

        {/* Break indicators (não clicáveis) */}
        {breakRanges.map((range, i) => {
          const [rs, rse] = range.start.split(":").map(Number);
          const [re, ree] = range.end.split(":").map(Number);
          const rStartMin = rs * 60 + rse;
          const rEndMin = re * 60 + ree;
          const top = (rStartMin - startOfDay) * PIXELS_PER_MINUTE;
          const height = (rEndMin - rStartMin) * PIXELS_PER_MINUTE;
          return (
            <div
              key={`break-${i}`}
              className="absolute left-0 right-0 bg-gray-50 border-y border-dashed border-gray-200 flex items-center justify-center pointer-events-none"
              style={{ top: `${top}px`, height: `${height}px` }}
            >
              <span className="text-[10px] text-gray-400 italic">{range.label}</span>
            </div>
          );
        })}

        {/* Block indicators (clicáveis) */}
        {blockRanges.map((range) => {
          const [rs, rse] = range.start.split(":").map(Number);
          const [re, ree] = range.end.split(":").map(Number);
          const rStartMin = rs * 60 + rse;
          const rEndMin = re * 60 + ree;
          const top = (rStartMin - startOfDay) * PIXELS_PER_MINUTE;
          const height = (rEndMin - rStartMin) * PIXELS_PER_MINUTE;
          return (
            <div
              key={`block-${range.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onBlockClick?.(range.block, professional.name);
              }}
              className="absolute left-1 right-1 bg-gray-100 border border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors z-10"
              style={{ top: `${top}px`, height: `${height}px` }}
            >
              <div className="text-center">
                <span className="text-[10px] text-gray-500 font-medium">{range.label}</span>
                {height >= 40 && (
                  <p className="text-[10px] text-gray-400">{range.start} - {range.end}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Appointments */}
        {appointments.map((apt) => (
          <AppointmentCard
            key={apt.id}
            appointment={apt}
            onClick={() => onAppointmentClick(apt)}
            pixelsPerMinute={PIXELS_PER_MINUTE}
            startOfDay={startOfDay}
          />
        ))}

        {/* Now line */}
        {nowMinutes !== null && nowMinutes >= startOfDay && nowMinutes <= endOfDay && (
          <div
            className="absolute left-0 right-0 border-t-2 border-error-500 z-20 pointer-events-none"
            style={{ top: `${(nowMinutes - startOfDay) * PIXELS_PER_MINUTE}px` }}
          >
            <div className="w-2 h-2 bg-error-500 rounded-full -mt-1 -ml-1" />
          </div>
        )}
      </div>
    </div>
  );
}
