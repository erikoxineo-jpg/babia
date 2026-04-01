"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, Users, Loader2, Phone, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ClientItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: "active" | "at_risk" | "inactive";
  totalVisits: number;
  totalSpent: number;
  lastVisit: string | null;
}

interface Meta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  active: { label: "Ativo", className: "bg-success-100 text-success-700" },
  at_risk: { label: "Em risco", className: "bg-warning-100 text-warning-700" },
  inactive: { label: "Inativo", className: "bg-gray-100 text-gray-600" },
};

const FILTERS = [
  { value: "all", label: "Todos" },
  { value: "active", label: "Ativos" },
  { value: "at_risk", label: "Em risco" },
  { value: "inactive", label: "Inativos" },
];

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ClientesPage() {
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("page", String(page));
      params.set("sort", "name");

      const res = await fetch(`/api/clients?${params}`);
      const json = await res.json();
      setClients(json.data ?? []);
      setMeta(json.meta ?? null);
    } catch {
      setClients([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, page]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          {meta && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {meta.total}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-0.5">Gerencie sua base de clientes</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-3xl text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
      </div>

      {/* Filters */}
      <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              statusFilter === f.value
                ? "bg-white text-primary-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            {debouncedSearch
              ? `Nenhum resultado para "${debouncedSearch}"`
              : "Nenhum cliente encontrado."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => {
            const badge = STATUS_BADGES[client.status] ?? STATUS_BADGES.active;
            return (
              <Link
                key={client.id}
                href={`/clientes/${client.id}`}
                className="block bg-white rounded-3xl border border-gray-100 shadow-soft p-5 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xs font-bold text-primary-600 shrink-0">
                      {client.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {client.name}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${badge.className}`}>
                          {badge.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Phone size={10} /> {client.phone}
                        </span>
                        {client.lastVisit && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Calendar size={10} />
                            {new Date(client.lastVisit + "T12:00:00").toLocaleDateString("pt-BR")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-bold text-gray-800">
                      {client.totalVisits} <span className="text-xs font-normal text-gray-400">visitas</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(client.totalSpent)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <span className="text-sm text-gray-500 min-w-[60px] text-center">
            {page} de {meta.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
            disabled={page >= meta.totalPages}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      )}
    </div>
  );
}
