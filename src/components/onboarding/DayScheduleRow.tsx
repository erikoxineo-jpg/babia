"use client";

import { DAY_LABELS, TIME_OPTIONS, type DaySchedule } from "@/lib/onboarding";

interface DayScheduleRowProps {
  day: DaySchedule;
  onChange: (day: DaySchedule) => void;
}

export function DayScheduleRow({ day, onChange }: DayScheduleRowProps) {
  const label = DAY_LABELS[day.dayOfWeek];

  return (
    <div
      className={`
        flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg border
        ${day.isActive ? "bg-white border-gray-200" : "bg-gray-50 border-gray-100"}
      `}
    >
      <label className="flex items-center gap-2 shrink-0 w-24 cursor-pointer">
        <input
          type="checkbox"
          checked={day.isActive}
          onChange={(e) => onChange({ ...day, isActive: e.target.checked })}
          className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
        />
        <span className={`text-sm font-medium ${day.isActive ? "text-gray-800" : "text-gray-400"}`}>
          {label}
        </span>
      </label>

      {day.isActive && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={day.startTime}
            onChange={(e) => onChange({ ...day, startTime: e.target.value })}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="text-gray-400 text-sm">às</span>
          <select
            value={day.endTime}
            onChange={(e) => onChange({ ...day, endTime: e.target.value })}
            className="px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 ml-2 cursor-pointer">
            <input
              type="checkbox"
              checked={day.hasBreak}
              onChange={(e) => onChange({ ...day, hasBreak: e.target.checked })}
              className="w-3.5 h-3.5 rounded border-gray-300 text-secondary-500 focus:ring-secondary-500"
            />
            <span className="text-xs text-gray-600">Intervalo</span>
          </label>

          {day.hasBreak && (
            <div className="flex items-center gap-1.5">
              <select
                value={day.breakStart}
                onChange={(e) => onChange({ ...day, breakStart: e.target.value })}
                className="px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-secondary-500"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <span className="text-gray-400 text-xs">-</span>
              <select
                value={day.breakEnd}
                onChange={(e) => onChange({ ...day, breakEnd: e.target.value })}
                className="px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-secondary-500"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
