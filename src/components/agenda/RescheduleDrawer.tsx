"use client";

import { useState, useEffect } from "react";
import { Loader2, CalendarDays } from "lucide-react";
import { Drawer } from "./Drawer";
import type { TimeSlot } from "@/types/agenda";

interface ProfessionalOption {
  id: string;
  name: string;
}

interface RescheduleData {
  appointmentId: string;
  currentDate: string;
  currentStartTime: string;
  currentProfessionalId: string;
  currentProfessionalName: string;
  clientName: string;
  serviceName: string;
  serviceId: string;
  serviceDurationMinutes: number;
}

interface RescheduleDrawerProps {
  open: boolean;
  onClose: () => void;
  data: RescheduleData | null;
  professionals: ProfessionalOption[];
  onRescheduled: () => void;
}

export function RescheduleDrawer({
  open,
  onClose,
  data,
  professionals,
  onRescheduled,
}: RescheduleDrawerProps) {
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset ao abrir
  useEffect(() => {
    if (open && data) {
      setProfessionalId(data.currentProfessionalId);
      setDate(data.currentDate);
      setSelectedTime("");
      setSlots([]);
      setError("");
    }
  }, [open, data]);

  // Buscar slots quando profissional + data mudam
  useEffect(() => {
    if (!professionalId || !date || !data) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSelectedTime("");

    fetch(
      `/api/appointments/available-slots?date=${date}&professional_id=${professionalId}&service_id=${data.serviceId}`
    )
      .then((r) => r.json())
      .then((json) => {
        setSlots(json.slots ?? []);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [professionalId, date, data]);

  async function handleSubmit() {
    if (!data || !selectedTime || !date) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/appointments/${data.appointmentId}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          startTime: selectedTime,
          professionalId: professionalId !== data.currentProfessionalId ? professionalId : undefined,
        }),
      });

      if (res.ok) {
        onRescheduled();
        onClose();
      } else {
        const json = await res.json();
        setError(json.error ?? "Erro ao reagendar.");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) return null;

  // Data mínima: hoje
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  return (
    <Drawer open={open} onClose={onClose} title="Reagendar">
      <div className="space-y-4">
        {/* Resumo do agendamento */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm font-medium text-gray-700">{data.clientName}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {data.serviceName} — {data.serviceDurationMinutes}min
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Atual: {new Date(data.currentDate + "T12:00:00").toLocaleDateString("pt-BR")} {data.currentStartTime} com {data.currentProfessionalName}
          </p>
        </div>

        {/* Profissional */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Profissional</label>
          <div className="flex flex-wrap gap-2">
            {professionals.map((p) => (
              <button
                key={p.id}
                onClick={() => setProfessionalId(p.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  professionalId === p.id
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Data */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nova data</label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={date}
              min={minDate}
              onChange={(e) => setDate(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Horários disponíveis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Novo horário</label>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando horários...
            </div>
          ) : !professionalId || !date ? (
            <p className="text-xs text-gray-400 py-2">
              Selecione profissional e data.
            </p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">Nenhum horário disponível nesta data.</p>
          ) : (
            <div className="grid grid-cols-4 gap-1.5 max-h-48 overflow-y-auto">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  onClick={() => setSelectedTime(slot.start)}
                  className={`px-2 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedTime === slot.start
                      ? "bg-primary-500 text-white"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {slot.start}
                </button>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-2 bg-error-50 border border-error-200 rounded-md">
            <p className="text-xs text-error-600">{error}</p>
          </div>
        )}

        {/* Botão */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !selectedTime || !date}
          className="w-full py-2.5 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Reagendando..." : "Confirmar reagendamento"}
        </button>
      </div>
    </Drawer>
  );
}
