"use client";

import { DAY_LABELS, TIME_OPTIONS, type DaySchedule } from "@/lib/onboarding";
import { Check } from "lucide-react";

interface DayScheduleRowProps {
  day: DaySchedule;
  onChange: (day: DaySchedule) => void;
}

const selectClass =
  "px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-300 focus:bg-white transition-colors";

export function DayScheduleRow({ day, onChange }: DayScheduleRowProps) {
  const label = DAY_LABELS[day.dayOfWeek];

  return (
    <div
      className={`
        flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3.5 rounded-2xl border-2 transition-all
        ${day.isActive ? "bg-white border-gray-100" : "bg-gray-50/50 border-gray-50"}
      `}
    >
      <label className="flex items-center gap-2.5 shrink-0 w-28 cursor-pointer">
        <div
          onClick={() => onChange({ ...day, isActive: !day.isActive })}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors cursor-pointer ${
            day.isActive
              ? "bg-primary-500 border-primary-500"
              : "border-gray-300 bg-white"
          }`}
        >
          {day.isActive && <Check className="w-3 h-3 text-white" />}
        </div>
        <span className={`text-sm font-medium ${day.isActive ? "text-gray-800" : "text-gray-400"}`}>
          {label}
        </span>
      </label>

      {day.isActive && (
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={day.startTime}
            onChange={(e) => onChange({ ...day, startTime: e.target.value })}
            className={selectClass}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <span className="text-gray-300 text-sm">-</span>
          <select
            value={day.endTime}
            onChange={(e) => onChange({ ...day, endTime: e.target.value })}
            className={selectClass}
          >
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 ml-1 cursor-pointer">
            <div
              onClick={() => onChange({ ...day, hasBreak: !day.hasBreak })}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
                day.hasBreak
                  ? "bg-primary-500 border-primary-500"
                  : "border-gray-300 bg-white"
              }`}
            >
              {day.hasBreak && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className="text-xs text-gray-500">Intervalo</span>
          </label>

          {day.hasBreak && (
            <div className="flex items-center gap-1.5">
              <select
                value={day.breakStart}
                onChange={(e) => onChange({ ...day, breakStart: e.target.value })}
                className={`${selectClass} text-xs`}
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <span className="text-gray-300 text-xs">-</span>
              <select
                value={day.breakEnd}
                onChange={(e) => onChange({ ...day, breakEnd: e.target.value })}
                className={`${selectClass} text-xs`}
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
