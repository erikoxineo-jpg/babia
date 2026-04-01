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
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
          {meta && (
            <span className="text-sm text-gray-400">({meta.total})</span>
          )}
        </div>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome ou telefone..."
          className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
        />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
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
                className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {client.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
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
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold text-gray-700">
                      {client.totalVisits} <span className="text-xs font-normal text-gray-400">visitas</span>
                    </p>
                    <p className="text-xs text-gray-400">
                      R$ {client.totalSpent.toFixed(2)}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Paginação */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">
            {(page - 1) * meta.perPage + 1}-{Math.min(page * meta.perPage, meta.total)} de {meta.total}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-gray-600 px-2">
              {page} / {meta.totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={page >= meta.totalPages}
              className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
