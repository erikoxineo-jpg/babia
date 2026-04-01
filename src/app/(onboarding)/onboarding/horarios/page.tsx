"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
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
      setError("Erro de conexao.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Stepper currentStep={2} />

      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-bold text-gray-800">Horario de funcionamento</h2>
        <p className="text-sm text-gray-400">
          Defina seus dias e horarios de atendimento. Voce pode ajustar depois.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-secondary-50 border border-secondary-200 text-secondary-600 text-sm px-4 py-3 rounded-2xl">
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

        <div className="flex gap-3 pt-5">
          <button
            type="button"
            onClick={() => router.push("/onboarding/barbearia")}
            className="px-5 py-3 border-2 border-gray-100 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-secondary-500 text-white py-3 px-4 rounded-2xl text-sm font-semibold hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
}
