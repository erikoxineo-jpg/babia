"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Loader2,
  Phone,
  User,
  Scissors,
  RefreshCw,
} from "lucide-react";
import { Drawer } from "./Drawer";
import { STATUS_LABELS, STATUS_DOT_COLORS, VALID_TRANSITIONS } from "@/types/agenda";
import type { AppointmentStatus } from "@prisma/client";

interface HistoryEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  changedBy: string | null;
  createdAt: string;
}

interface AppointmentDetail {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  price: number;
  notes: string | null;
  source: string;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
  completedAt: string | null;
  client: { id: string; name: string; phone: string; email: string | null };
  professional: { id: string; name: string };
  service: { id: string; name: string; durationMinutes: number };
  history: HistoryEntry[];
}

interface AppointmentDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string | null;
  onStatusChanged: () => void;
  onReschedule?: (data: {
    appointmentId: string;
    currentDate: string;
    currentStartTime: string;
    currentProfessionalId: string;
    currentProfessionalName: string;
    clientName: string;
    serviceName: string;
    serviceId: string;
    serviceDurationMinutes: number;
  }) => void;
}

const ACTION_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; className: string }
> = {
  confirmed: {
    label: "Confirmar",
    icon: CheckCircle,
    className: "bg-success-500 hover:bg-success-600 text-white",
  },
  completed: {
    label: "Concluir",
    icon: CheckCircle,
    className: "bg-primary-500 hover:bg-primary-600 text-white",
  },
  cancelled: {
    label: "Cancelar",
    icon: XCircle,
    className: "bg-gray-500 hover:bg-gray-600 text-white",
  },
  no_show: {
    label: "Não compareceu",
    icon: AlertTriangle,
    className: "bg-error-500 hover:bg-error-600 text-white",
  },
};

export function AppointmentDetailDrawer({
  open,
  onClose,
  appointmentId,
  onStatusChanged,
  onReschedule,
}: AppointmentDetailDrawerProps) {
  const [detail, setDetail] = useState<AppointmentDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  useEffect(() => {
    if (!open || !appointmentId) {
      setDetail(null);
      setShowCancelReason(false);
      setCancelReason("");
      return;
    }

    setLoading(true);
    fetch(`/api/appointments/${appointmentId}`)
      .then((r) => r.json())
      .then((data) => setDetail(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, appointmentId]);

  async function handleStatusChange(newStatus: AppointmentStatus, reason?: string) {
    if (!appointmentId) return;

    setUpdating(true);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, reason }),
      });

      if (res.ok) {
        onStatusChanged();
        // Recarregar detalhes
        const updated = await fetch(`/api/appointments/${appointmentId}`);
        const data = await updated.json();
        setDetail(data);
        setShowCancelReason(false);
        setCancelReason("");
      }
    } catch {
      // silently fail
    } finally {
      setUpdating(false);
    }
  }

  const availableTransitions = detail
    ? (VALID_TRANSITIONS[detail.status] ?? [])
    : [];

  return (
    <Drawer open={open} onClose={onClose} title="Detalhes do Agendamento">
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : !detail ? (
        <p className="text-sm text-gray-400 py-4">Agendamento não encontrado.</p>
      ) : (
        <div className="space-y-5">
          {/* Status badge */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${STATUS_DOT_COLORS[detail.status]}`}
            />
            <span className="text-sm font-medium text-gray-800">
              {STATUS_LABELS[detail.status]}
            </span>
          </div>

          {/* Info cards */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
              <User size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">{detail.client.name}</p>
                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                  <Phone size={10} /> {detail.client.phone}
                </p>
                {detail.client.email && (
                  <p className="text-xs text-gray-500 mt-0.5">{detail.client.email}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
              <Scissors size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">{detail.service.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  com {detail.professional.name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
              <Clock size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {detail.startTime} - {detail.endTime}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {detail.service.durationMinutes}min — R$ {detail.price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {detail.notes && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Observações</p>
              <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded-md">
                {detail.notes}
              </p>
            </div>
          )}

          {/* Reagendar */}
          {detail && ["pending", "confirmed"].includes(detail.status) && onReschedule && (
            <button
              onClick={() => {
                onReschedule({
                  appointmentId: detail.id,
                  currentDate: detail.date,
                  currentStartTime: detail.startTime,
                  currentProfessionalId: detail.professional.id,
                  currentProfessionalName: detail.professional.name,
                  clientName: detail.client.name,
                  serviceName: detail.service.name,
                  serviceId: detail.service.id,
                  serviceDurationMinutes: detail.service.durationMinutes,
                });
                onClose();
              }}
              className="w-full py-2 bg-primary-50 text-primary-600 text-sm font-medium rounded-md hover:bg-primary-100 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} />
              Reagendar
            </button>
          )}

          {/* Ações de status */}
          {availableTransitions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Ações</p>

              {showCancelReason ? (
                <div className="space-y-2">
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Motivo do cancelamento..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange("cancelled", cancelReason)}
                      disabled={updating}
                      className="px-3 py-1.5 text-xs font-medium bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:opacity-50"
                    >
                      {updating ? "Cancelando..." : "Confirmar cancelamento"}
                    </button>
                    <button
                      onClick={() => setShowCancelReason(false)}
                      className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
                    >
                      Voltar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availableTransitions.map((status) => {
                    const config = ACTION_CONFIG[status];
                    if (!config) return null;
                    const Icon = config.icon;

                    return (
                      <button
                        key={status}
                        onClick={() => {
                          if (status === "cancelled") {
                            setShowCancelReason(true);
                          } else {
                            handleStatusChange(status);
                          }
                        }}
                        disabled={updating}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 ${config.className}`}
                      >
                        <Icon size={14} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Histórico */}
          {detail.history.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Histórico</p>
              <div className="space-y-2">
                {detail.history.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-start gap-2 text-xs text-gray-500"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                    <div>
                      <span>
                        {h.fromStatus
                          ? `${STATUS_LABELS[h.fromStatus as AppointmentStatus] ?? h.fromStatus} → `
                          : ""}
                        {STATUS_LABELS[h.toStatus as AppointmentStatus] ?? h.toStatus}
                      </span>
                      {h.changedBy && (
                        <span className="text-gray-400"> por {h.changedBy}</span>
                      )}
                      {h.reason && (
                        <span className="text-gray-400 italic"> — {h.reason}</span>
                      )}
                      <p className="text-gray-300 text-[10px]">
                        {new Date(h.createdAt).toLocaleString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
