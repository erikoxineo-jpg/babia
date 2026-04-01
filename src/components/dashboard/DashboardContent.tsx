"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  ChevronRight,
  Loader2,
  UserX,
  CalendarOff,
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
      label: "Agendamentos hoje",
      value: String(data.appointments.total),
      sub: `${data.appointments.completed} concluído${data.appointments.completed !== 1 ? "s" : ""}`,
      icon: Calendar,
      color: "text-primary-500",
      bg: "bg-primary-50",
    },
    {
      label: "Taxa de ocupação",
      value: `${data.occupancy_rate}%`,
      sub: `${data.gaps_count} horário${data.gaps_count !== 1 ? "s" : ""} vago${data.gaps_count !== 1 ? "s" : ""}`,
      icon: TrendingUp,
      color: "text-success-600",
      bg: "bg-success-50",
    },
    {
      label: "Faturamento hoje",
      value: `R$ ${data.revenue.today.toFixed(2)}`,
      sub: `Projetado: R$ ${data.revenue.projected.toFixed(2)}`,
      icon: DollarSign,
      color: "text-success-600",
      bg: "bg-success-50",
    },
    {
      label: "Faltas na semana",
      value: String(data.week_no_shows),
      sub: `${data.at_risk_clients} cliente${data.at_risk_clients !== 1 ? "s" : ""} em risco`,
      icon: UserX,
      color: "text-danger-600",
      bg: "bg-danger-50",
    },
  ];

  const severityColors = {
    info: "border-l-primary-400 bg-primary-50",
    warning: "border-l-warning-400 bg-warning-50",
    danger: "border-l-danger-400 bg-danger-50",
  };

  const severityIcons = {
    info: <Clock size={16} className="text-primary-500" />,
    warning: <AlertTriangle size={16} className="text-warning-600" />,
    danger: <AlertTriangle size={16} className="text-danger-600" />,
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <span className="text-xs text-gray-400">
          {new Date(data.date + "T12:00:00").toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-8 h-8 ${kpi.bg} rounded-lg flex items-center justify-center`}
                >
                  <Icon size={16} className={kpi.color} />
                </div>
                <span className="text-xs text-gray-500">{kpi.label}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{kpi.value}</p>
              <p className="text-xs text-gray-400 mt-1">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Next Appointment */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Próximo agendamento
          </h2>
          {data.next_appointment ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {data.next_appointment.client}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {data.next_appointment.service} com{" "}
                  {data.next_appointment.professional}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-primary-600">
                  {data.next_appointment.time}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <CalendarOff size={16} />
              <p className="text-sm">Nenhum agendamento próximo</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Ações rápidas
          </h2>
          <div className="space-y-2">
            <Link
              href="/agenda"
              className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-primary-500" />
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
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-warning-500" />
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
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-danger-500" />
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
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Alertas</h2>
          <div className="space-y-2">
            {alerts.map((alert, i) => (
              <div
                key={`${alert.type}-${i}`}
                className={`border-l-4 rounded-r-lg p-3 ${severityColors[alert.severity]}`}
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5">{severityIcons[alert.severity]}</div>
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
                        className="inline-block text-xs text-primary-600 font-medium mt-1 hover:underline"
                      >
                        {alert.action.label}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today breakdown */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          Resumo de hoje
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: "Pendentes", value: data.appointments.pending, color: "bg-warning-100 text-warning-700" },
            { label: "Confirmados", value: data.appointments.confirmed, color: "bg-success-100 text-success-700" },
            { label: "Concluídos", value: data.appointments.completed, color: "bg-primary-100 text-primary-700" },
            { label: "Faltas", value: data.appointments.no_show, color: "bg-danger-100 text-danger-700" },
            { label: "Cancelados", value: data.appointments.cancelled, color: "bg-gray-100 text-gray-600" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-xl font-bold text-gray-800">{item.value}</p>
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium mt-1 ${item.color}`}
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
