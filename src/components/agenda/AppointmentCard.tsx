"use client";

import type { AppointmentWithRelations } from "@/types/agenda";
import { STATUS_COLORS, STATUS_DOT_COLORS } from "@/types/agenda";

interface AppointmentCardProps {
  appointment: AppointmentWithRelations;
  onClick: () => void;
  pixelsPerMinute: number;
  startOfDay: number;
}

export function AppointmentCard({
  appointment,
  onClick,
  pixelsPerMinute,
  startOfDay,
}: AppointmentCardProps) {
  const [sh, sm] = appointment.startTime.split(":").map(Number);
  const [eh, em] = appointment.endTime.split(":").map(Number);
  const startMin = sh * 60 + sm;
  const endMin = eh * 60 + em;
  const duration = endMin - startMin;

  const top = (startMin - startOfDay) * pixelsPerMinute;
  const height = Math.max(duration * pixelsPerMinute, 24);

  return (
    <button
      onClick={onClick}
      className={`absolute left-1 right-1 rounded-md border-l-4 px-2 py-1 text-left cursor-pointer overflow-hidden transition-opacity hover:opacity-90 ${STATUS_COLORS[appointment.status]}`}
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT_COLORS[appointment.status]}`}
        />
        <span className="text-xs font-medium text-gray-800 truncate">
          {appointment.client.name}
        </span>
      </div>
      {height >= 40 && (
        <p className="text-[10px] text-gray-500 truncate mt-0.5">
          {appointment.service.name}
        </p>
      )}
      {height >= 56 && (
        <p className="text-[10px] text-gray-400 mt-0.5">
          {appointment.startTime} - {appointment.endTime}
        </p>
      )}
    </button>
  );
}
