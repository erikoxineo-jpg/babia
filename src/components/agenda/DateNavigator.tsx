"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface DateNavigatorProps {
  date: string;
  onChange: (date: string) => void;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  const formatted = date.toLocaleDateString("pt-BR", options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

function addDays(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T12:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const isToday = date === getToday();

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onChange(addDays(date, -1))}
        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft size={20} />
      </button>

      <span className="text-sm font-medium text-gray-800 min-w-[200px] text-center">
        {formatDate(date)}
      </span>

      <button
        onClick={() => onChange(addDays(date, 1))}
        className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
      >
        <ChevronRight size={20} />
      </button>

      {!isToday && (
        <button
          onClick={() => onChange(getToday())}
          className="ml-2 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
        >
          Hoje
        </button>
      )}
    </div>
  );
}
