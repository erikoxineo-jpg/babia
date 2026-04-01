"use client";

import { useState, useEffect, useCallback } from "react";
import { use } from "react";
import {
  Loader2,
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Scissors,
  User,
  Clock,
  MessageCircle,
  CalendarPlus,
  Edit3,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

// ==========================================
// Types
// ==========================================

interface ClientDetail {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  notes: string | null;
  status: "active" | "at_risk" | "inactive";
  totalVisits: number;
  totalSpent: number;
  averageTicket: number;
  lastVisit: string | null;
  firstVisit: string | null;
  noShowCount: number;
  preferredProfessional: { id: string; name: string; count: number } | null;
  preferredServices: { id: string; name: string; count: number }[];
  nextAppointment: {
    id: string;
    date: string;
    startTime: string;
    service: string;
    professional: string;
  } | null;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  price: number;
  notes: string | null;
  service: { id: string; name: string };
  professional: { id: string; name: string };
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-success-100 text-success-700" },
  at_risk: { label: "Em risco", className: "bg-warning-100 text-warning-700" },
  inactive: { label: "Inativo", className: "bg-gray-100 text-gray-600" },
};

const APT_STATUS_ICONS: Record<string, { icon: React.ElementType; className: string }> = {
  completed: { icon: CheckCircle, className: "text-success-500" },
  cancelled: { icon: XCircle, className: "text-gray-400" },
  no_show: { icon: AlertTriangle, className: "text-error-500" },
  pending: { icon: Clock, className: "text-warning-500" },
  confirmed: { icon: CheckCircle, className: "text-primary-500" },
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ==========================================
// Edit Drawer (inline)
// ==========================================

function EditDrawer({
  open,
  onClose,
  client,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  client: ClientDetail;
  onSaved: () => void;
}) {
  const [name, setName] = useState(client.name);
  const [phone, setPhone] = useState(client.phone);
  const [email, setEmail] = useState(client.email ?? "");
  const [notes, setNotes] = useState(client.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setName(client.name);
      setPhone(client.phone);
      setEmail(client.email ?? "");
      setNotes(client.notes ?? "");
      setError("");
    }
  }, [open, client]);

  async function handleSave() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, notes }),
      });
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao salvar.");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-heading font-semibold text-gray-800">Editar Cliente</h2>
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">Fechar</button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Telefone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Observações</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white resize-none" />
          </div>
          {error && <p className="text-xs text-error-600">{error}</p>}
          <button onClick={handleSave} disabled={saving || !name.trim() || !phone.trim()}
            className="w-full py-3.5 bg-primary-500 text-white text-sm font-medium rounded-2xl hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Main Page
// ==========================================

export default function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [editing, setEditing] = useState(false);

  const fetchClient = useCallback(async () => {
    try {
      const res = await fetch(`/api/clients/${id}`);
      if (res.ok) {
        setClient(await res.json());
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`/api/clients/${id}/history?page=${historyPage}&per_page=10`);
      if (res.ok) {
        const json = await res.json();
        setHistory(json.data ?? []);
        setHistoryTotal(json.meta?.total ?? 0);
      }
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  }, [id, historyPage]);

  useEffect(() => { fetchClient(); }, [fetchClient]);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-gray-400">Cliente não encontrado.</p>
        <Link href="/clientes" className="text-sm text-primary-500 hover:underline mt-2 inline-block">
          Voltar para lista
        </Link>
      </div>
    );
  }

  const statusBadge = STATUS_CONFIG[client.status] ?? STATUS_CONFIG.active;
  const whatsappLink = `https://wa.me/55${client.phone.replace(/\D/g, "")}`;
  const totalHistoryPages = Math.ceil(historyTotal / 10);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/clientes" className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-gray-800 truncate">{client.name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${statusBadge.className}`}>
              {statusBadge.label}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Phone size={10} /> {client.phone}
            </span>
            {client.email && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Mail size={10} /> {client.email}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-success-50 text-success-600 text-xs font-medium rounded-xl hover:bg-success-100 transition-colors"
        >
          <MessageCircle size={14} /> WhatsApp
        </a>
        <Link
          href="/agenda"
          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-primary-50 text-primary-600 text-xs font-medium rounded-xl hover:bg-primary-100 transition-colors"
        >
          <CalendarPlus size={14} /> Agendar
        </Link>
        <button
          onClick={() => setEditing(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 bg-gray-50 text-gray-600 text-xs font-medium rounded-xl hover:bg-gray-100 transition-colors"
        >
          <Edit3 size={14} /> Editar
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 text-center">
          <p className="text-xl font-bold text-gray-800">{client.totalVisits}</p>
          <p className="text-xs text-gray-400 mt-0.5">Visitas</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 text-center">
          <p className="text-xl font-bold text-gray-800">{formatCurrency(client.totalSpent)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Total gasto</p>
        </div>
        <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 text-center">
          <p className="text-xl font-bold text-gray-800">{formatCurrency(client.averageTicket)}</p>
          <p className="text-xs text-gray-400 mt-0.5">Ticket médio</p>
        </div>
      </div>

      {/* Info cards */}
      <div className="space-y-2">
        {client.nextAppointment && (
          <div className="bg-primary-50 rounded-3xl border border-primary-100 p-5">
            <p className="text-xs font-medium text-primary-600 mb-1">Próximo agendamento</p>
            <p className="text-sm text-primary-800">
              {new Date(client.nextAppointment.date + "T12:00:00").toLocaleDateString("pt-BR")} {client.nextAppointment.startTime} — {client.nextAppointment.service} com {client.nextAppointment.professional}
            </p>
          </div>
        )}

        {client.preferredProfessional && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <User size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Profissional preferido</p>
              <p className="text-sm font-medium text-gray-800">{client.preferredProfessional.name}</p>
            </div>
          </div>
        )}

        {client.preferredServices.length > 0 && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <Scissors size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Serviços frequentes</p>
              <p className="text-sm font-medium text-gray-800">
                {client.preferredServices.map((s) => s.name).join(", ")}
              </p>
            </div>
          </div>
        )}

        {client.lastVisit && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Última visita</p>
              <p className="text-sm font-medium text-gray-800">
                {new Date(client.lastVisit + "T12:00:00").toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        )}

        {client.noShowCount > 0 && (
          <div className="bg-secondary-50 rounded-3xl border border-secondary-100 p-5 flex items-center gap-3">
            <AlertTriangle size={16} className="text-secondary-500" />
            <p className="text-xs text-secondary-600 font-medium">
              {client.noShowCount} falta{client.noShowCount > 1 ? "s" : ""}
            </p>
          </div>
        )}

        {client.notes && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-5">
            <p className="text-xs text-gray-400 mb-1">Observações</p>
            <p className="text-sm text-gray-700">{client.notes}</p>
          </div>
        )}
      </div>

      {/* History */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">Histórico</h2>
          {historyTotal > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {historyTotal}
            </span>
          )}
        </div>

        {loadingHistory ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Nenhum atendimento registrado.</p>
        ) : (
          <div className="space-y-1">
            {history.map((h) => {
              const statusInfo = APT_STATUS_ICONS[h.status] ?? APT_STATUS_ICONS.pending;
              const Icon = statusInfo.icon;
              return (
                <div key={h.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={`shrink-0 ${statusInfo.className}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-800">{h.service.name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(h.date + "T12:00:00").toLocaleDateString("pt-BR")} {h.startTime} — {h.professional.name}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-800">{formatCurrency(h.price)}</span>
                </div>
              );
            })}

            {/* Pagination */}
            {totalHistoryPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-3 mt-2 border-t border-gray-100">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage <= 1}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={14} className="text-gray-600" />
                </button>
                <span className="text-xs text-gray-500">
                  {historyPage} de {totalHistoryPages}
                </span>
                <button
                  onClick={() => setHistoryPage((p) => p + 1)}
                  disabled={historyPage >= totalHistoryPages}
                  className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={14} className="text-gray-600" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Drawer */}
      <EditDrawer
        open={editing}
        onClose={() => setEditing(false)}
        client={client}
        onSaved={fetchClient}
      />
    </div>
  );
}
