"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  ChevronRight,
  Loader2,
  UserX,
  CalendarOff,
  Users,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  date: string;
  appointments: {
    total: number;
    completed: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    no_show: number;
  };
  revenue: { today: number; projected: number };
  occupancy_rate: number;
  next_appointment: {
    id: string;
    time: string;
    client: string;
    service: string;
    professional: string;
  } | null;
  gaps_count: number;
  waitlist_count: number;
  week_no_shows: number;
  at_risk_clients: number;
}

interface Alert {
  type: string;
  severity: "info" | "warning" | "danger";
  title: string;
  message: string;
  action?: { type: "link"; url: string; label: string };
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [summaryRes, alertsRes] = await Promise.all([
          fetch("/api/dashboard/summary"),
          fetch("/api/dashboard/alerts"),
        ]);
        const summaryJson = await summaryRes.json();
        const alertsJson = await alertsRes.json();
        if (summaryJson.success) setData(summaryJson.data);
        if (alertsJson.success) setAlerts(alertsJson.data.alerts ?? []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-sm text-gray-400">
        Erro ao carregar dashboard.
      </div>
    );
  }

  const kpis = [
    {
      label: "Agendamentos",
      value: String(data.appointments.total),
      sub: `${data.appointments.completed} concluído${data.appointments.completed !== 1 ? "s" : ""}`,
      icon: Calendar,
      color: "text-primary-500",
      bg: "bg-primary-50",
    },
    {
      label: "Ocupação",
      value: `${data.occupancy_rate}%`,
      sub: `${data.gaps_count} vago${data.gaps_count !== 1 ? "s" : ""}`,
      icon: TrendingUp,
      color: "text-success-600",
      bg: "bg-success-50",
    },
    {
      label: "Faturamento",
      value: formatCurrency(data.revenue.today),
      sub: `Projetado: ${formatCurrency(data.revenue.projected)}`,
      icon: DollarSign,
      color: "text-success-600",
      bg: "bg-success-50",
    },
    {
      label: "Faltas",
      value: String(data.week_no_shows),
      sub: `${data.at_risk_clients} em risco`,
      icon: UserX,
      color: "text-red-500",
      bg: "bg-red-50",
    },
  ];

  const severityStyles = {
    info: { border: "border-l-primary-400", bg: "bg-primary-50/60", icon: <Clock size={16} className="text-primary-500" /> },
    warning: { border: "border-l-warning-400", bg: "bg-warning-50/60", icon: <AlertTriangle size={16} className="text-warning-600" /> },
    danger: { border: "border-l-red-400", bg: "bg-red-50/60", icon: <AlertTriangle size={16} className="text-red-500" /> },
  };

  const statusBreakdown = [
    { label: "Pendentes", value: data.appointments.pending, color: "bg-warning-100 text-warning-700" },
    { label: "Confirmados", value: data.appointments.confirmed, color: "bg-success-100 text-success-700" },
    { label: "Concluídos", value: data.appointments.completed, color: "bg-primary-100 text-primary-700" },
    { label: "Faltas", value: data.appointments.no_show, color: "bg-red-100 text-red-600" },
    { label: "Cancelados", value: data.appointments.cancelled, color: "bg-gray-100 text-gray-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date(data.date + "T12:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 ${kpi.bg} rounded-xl flex items-center justify-center`}
                >
                  <Icon size={16} className={kpi.color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.label} &middot; {kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Next Appointment */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Próximo agendamento
          </h2>
          {data.next_appointment ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {data.next_appointment.client}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {data.next_appointment.service} com{" "}
                  {data.next_appointment.professional}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-primary-600">
                  {data.next_appointment.time}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-gray-400">
              <CalendarOff size={18} />
              <p className="text-sm">Nenhum agendamento próximo</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">
            Ações rápidas
          </h2>
          <div className="space-y-1">
            <Link
              href="/agenda"
              className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
                  <Calendar size={14} className="text-primary-500" />
                </div>
                <span className="text-sm text-gray-700">Ver agenda de hoje</span>
              </div>
              <ChevronRight
                size={14}
                className="text-gray-300 group-hover:text-gray-500"
              />
            </Link>
            {data.gaps_count > 0 && (
              <Link
                href="/agenda"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-warning-50 rounded-xl flex items-center justify-center">
                    <Clock size={14} className="text-warning-500" />
                  </div>
                  <span className="text-sm text-gray-700">
                    Preencher {data.gaps_count} horário{data.gaps_count > 1 ? "s" : ""} vago{data.gaps_count > 1 ? "s" : ""}
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="text-gray-300 group-hover:text-gray-500"
                />
              </Link>
            )}
            {data.at_risk_clients > 0 && (
              <Link
                href="/clientes?status=at_risk"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center">
                    <Users size={14} className="text-red-500" />
                  </div>
                  <span className="text-sm text-gray-700">
                    Reativar {data.at_risk_clients} cliente{data.at_risk_clients > 1 ? "s" : ""} em risco
                  </span>
                </div>
                <ChevronRight
                  size={14}
                  className="text-gray-300 group-hover:text-gray-500"
                />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-3">Alertas</h2>
          <div className="space-y-2">
            {alerts.map((alert, i) => {
              const s = severityStyles[alert.severity];
              return (
                <div
                  key={`${alert.type}-${i}`}
                  className={`border-l-4 ${s.border} ${s.bg} rounded-r-2xl p-4`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{s.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {alert.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {alert.message}
                      </p>
                      {alert.action && (
                        <Link
                          href={alert.action.url}
                          className="inline-block text-xs text-primary-600 font-medium mt-1.5 hover:underline"
                        >
                          {alert.action.label}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today breakdown */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">
          Resumo de hoje
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {statusBreakdown.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xl font-bold text-gray-800">{item.value}</p>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1.5 ${item.color}`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
