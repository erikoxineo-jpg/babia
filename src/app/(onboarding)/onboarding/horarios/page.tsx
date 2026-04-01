"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/onboarding/Stepper";
import { DayScheduleRow } from "@/components/onboarding/DayScheduleRow";
import { DEFAULT_SCHEDULE, type DaySchedule } from "@/lib/onboarding";

export default function HorariosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [schedule, setSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);

  useEffect(() => {
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.ownerProfessional?.schedules?.length > 0) {
          const existing = data.ownerProfessional.schedules;
          const breaks = data.ownerProfessional.breaks || [];

          const merged = DEFAULT_SCHEDULE.map((def) => {
            const sched = existing.find(
              (s: { dayOfWeek: number }) => s.dayOfWeek === def.dayOfWeek
            );
            const brk = breaks.find(
              (b: { dayOfWeek: number }) => b.dayOfWeek === def.dayOfWeek
            );
            if (sched) {
              return {
                dayOfWeek: sched.dayOfWeek,
                isActive: sched.isActive,
                startTime: sched.startTime,
                endTime: sched.endTime,
                hasBreak: !!brk,
                breakStart: brk?.startTime || "12:00",
                breakEnd: brk?.endTime || "13:00",
              };
            }
            return def;
          });
          setSchedule(merged);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function updateDay(index: number, day: DaySchedule) {
    setSchedule((prev) => prev.map((d, i) => (i === index ? day : d)));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/onboarding/horarios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schedule }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar.");
        setSaving(false);
        return;
      }

      router.push("/onboarding/servicos");
    } catch {
      setError("Erro de conexão.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-gray-400 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <Stepper currentStep={2} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-heading font-semibold text-gray-800 mb-1">Horário de funcionamento</h2>
        <p className="text-sm text-gray-500 mb-6">
          Defina seus dias e horários de atendimento. Você pode ajustar depois.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          {schedule.map((day, index) => (
            <DayScheduleRow
              key={day.dayOfWeek}
              day={day}
              onChange={(d) => updateDay(index, d)}
            />
          ))}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.push("/onboarding/barbearia")}
              className="px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Voltar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-500 text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Salvando..." : "Continuar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
