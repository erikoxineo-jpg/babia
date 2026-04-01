"use client";

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Drawer } from "./Drawer";
import { ClientSearch } from "./ClientSearch";
import type { TimeSlot } from "@/types/agenda";

interface ClientResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

interface ServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
}

interface ProfessionalOption {
  id: string;
  name: string;
}

interface Prefill {
  professionalId?: string;
  time?: string;
  date: string;
}

interface NewAppointmentDrawerProps {
  open: boolean;
  onClose: () => void;
  prefill: Prefill;
  professionals: ProfessionalOption[];
  services: ServiceOption[];
  onCreated: () => void;
}

export function NewAppointmentDrawer({
  open,
  onClose,
  prefill,
  professionals,
  services,
  onCreated,
}: NewAppointmentDrawerProps) {
  const [client, setClient] = useState<ClientResult | null>(null);
  const [professionalId, setProfessionalId] = useState(prefill.professionalId ?? "");
  const [serviceId, setServiceId] = useState("");
  const [selectedTime, setSelectedTime] = useState(prefill.time ?? "");
  const [notes, setNotes] = useState("");
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reset ao abrir
  useEffect(() => {
    if (open) {
      setClient(null);
      setProfessionalId(prefill.professionalId ?? (professionals.length === 1 ? professionals[0].id : ""));
      setServiceId("");
      setSelectedTime(prefill.time ?? "");
      setNotes("");
      setSlots([]);
      setError("");
    }
  }, [open, prefill.professionalId, prefill.time, professionals]);

  // Buscar slots quando profissional + serviço estão selecionados
  useEffect(() => {
    if (!professionalId || !serviceId || !prefill.date) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);
    setSelectedTime(prefill.time ?? "");

    fetch(
      `/api/appointments/available-slots?date=${prefill.date}&professional_id=${professionalId}&service_id=${serviceId}`
    )
      .then((r) => r.json())
      .then((data) => {
        setSlots(data.slots ?? []);
        // Se o prefill.time está disponível, manter selecionado
        if (prefill.time && data.slots?.some((s: TimeSlot) => s.start === prefill.time)) {
          setSelectedTime(prefill.time);
        } else {
          setSelectedTime("");
        }
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [professionalId, serviceId, prefill.date, prefill.time]);

  async function handleSubmit() {
    if (!client || !professionalId || !serviceId || !selectedTime) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: client.id,
          professionalId,
          serviceId,
          date: prefill.date,
          startTime: selectedTime,
          notes: notes.trim() || undefined,
        }),
      });

      if (res.ok) {
        onCreated();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao criar agendamento.");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Drawer open={open} onClose={onClose} title="Novo Agendamento">
      <div className="space-y-4">
        {/* Cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
          <ClientSearch value={client} onChange={setClient} />
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

        {/* Serviço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serviço</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Selecione um serviço</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.durationMinutes}min — R$ {s.price.toFixed(2)})
              </option>
            ))}
          </select>
        </div>

        {/* Horário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
          {loadingSlots ? (
            <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando horários...
            </div>
          ) : !professionalId || !serviceId ? (
            <p className="text-xs text-gray-400 py-2">
              Selecione profissional e serviço para ver horários.
            </p>
          ) : slots.length === 0 ? (
            <p className="text-xs text-gray-400 py-2">Nenhum horário disponível.</p>
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

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Alguma observação..."
          />
        </div>

        {error && (
          <div className="p-2 bg-error-50 border border-error-200 rounded-md">
            <p className="text-xs text-error-600">{error}</p>
          </div>
        )}

        {/* Botão */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !client || !professionalId || !serviceId || !selectedTime}
          className="w-full py-2.5 bg-primary-500 text-white text-sm font-medium rounded-md hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Agendando..." : "Agendar"}
        </button>
      </div>
    </Drawer>
  );
}
