"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { Drawer } from "./Drawer";

interface ProfessionalOption {
  id: string;
  name: string;
}

interface ConflictInfo {
  id: string;
  startTime: string;
  endTime: string;
  clientName: string;
  serviceName: string;
  status: string;
}

interface BlockDrawerProps {
  open: boolean;
  onClose: () => void;
  professionals: ProfessionalOption[];
  prefill: {
    professionalId?: string;
    date: string;
    time?: string;
  };
  onCreated: () => void;
}

export function BlockDrawer({
  open,
  onClose,
  professionals,
  prefill,
  onCreated,
}: BlockDrawerProps) {
  const [professionalId, setProfessionalId] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [reason, setReason] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);

  useEffect(() => {
    if (open) {
      setProfessionalId(prefill.professionalId ?? "");
      setStartTime(prefill.time ?? "");
      setEndTime("");
      setReason("");
      setAllDay(false);
      setError("");
      setConflicts([]);
    }
  }, [open, prefill.professionalId, prefill.time]);

  async function handleSubmit() {
    if (!professionalId || !prefill.date) return;
    if (!allDay && (!startTime || !endTime)) return;

    setSubmitting(true);
    setError("");
    setConflicts([]);

    try {
      const res = await fetch("/api/schedule-blocks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          professionalId,
          date: prefill.date,
          startTime: allDay ? undefined : startTime,
          endTime: allDay ? undefined : endTime,
          reason: reason.trim() || undefined,
          allDay,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.conflicts && data.conflicts.length > 0) {
          setConflicts(data.conflicts);
        }
        onCreated();
        if (!data.conflicts || data.conflicts.length === 0) {
          onClose();
        }
      } else {
        setError(data.error ?? "Erro ao criar bloqueio.");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = professionalId && prefill.date && (allDay || (startTime && endTime));

  return (
    <Drawer open={open} onClose={onClose} title="Bloquear Horário">
      <div className="space-y-4">
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
                    ? "bg-gray-700 text-white"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
          <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
            {new Date(prefill.date + "T12:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Dia inteiro */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="allDay"
            checked={allDay}
            onChange={(e) => setAllDay(e.target.checked)}
            className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-500"
          />
          <label htmlFor="allDay" className="text-sm text-gray-700">
            Dia inteiro
          </label>
        </div>

        {/* Horários */}
        {!allDay && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Término</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              />
            </div>
          </div>
        )}

        {/* Motivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Motivo <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
            placeholder="Ex: Consulta médica, Férias..."
            maxLength={500}
          />
        </div>

        {/* Conflitos */}
        {conflicts.length > 0 && (
          <div className="p-3 bg-warning-50 border border-warning-200 rounded-md">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-warning-600" />
              <span className="text-sm font-medium text-warning-700">
                Bloqueio criado com conflitos
              </span>
            </div>
            <p className="text-xs text-warning-600 mb-2">
              Os agendamentos abaixo conflitam com este bloqueio. Eles não foram cancelados automaticamente.
            </p>
            <ul className="space-y-1">
              {conflicts.map((c) => (
                <li key={c.id} className="text-xs text-warning-700">
                  {c.startTime}-{c.endTime} — {c.clientName} ({c.serviceName})
                </li>
              ))}
            </ul>
            <button
              onClick={onClose}
              className="mt-3 w-full py-2 bg-warning-100 text-warning-700 text-sm font-medium rounded-md hover:bg-warning-200 transition-colors"
            >
              Entendi
            </button>
          </div>
        )}

        {error && (
          <div className="p-2 bg-error-50 border border-error-200 rounded-md">
            <p className="text-xs text-error-600">{error}</p>
          </div>
        )}

        {/* Botão */}
        {conflicts.length === 0 && (
          <button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="w-full py-2.5 bg-gray-700 text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Bloqueando..." : "Bloquear horário"}
          </button>
        )}
      </div>
    </Drawer>
  );
}
