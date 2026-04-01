"use client";

import { useState, useEffect, useCallback } from "react";
import { Scissors, Loader2, Clock, Tag } from "lucide-react";
import Link from "next/link";

interface ServiceItem {
  id: string;
  name: string;
  durationMinutes: number;
  price: number;
  category: string | null;
  isActive: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  corte: "Corte",
  barba: "Barba",
  combo: "Combo",
  tratamento: "Tratamento",
  coloracao: "Coloracao",
  outros: "Outros",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ServicosPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/servicos");
      const json = await res.json();
      if (json.success) setServices(json.data ?? []);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
            {services.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                {services.length}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Catálogo de serviços oferecidos</p>
        </div>
        <Link
          href="/onboarding/servicos"
          className="flex items-center gap-1.5 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
        >
          <Scissors size={16} />
          Gerenciar serviços
        </Link>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <Scissors className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            Nenhum serviço cadastrado.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Configure seus serviços no onboarding.
          </p>
          <Link
            href="/onboarding/servicos"
            className="inline-block mt-4 px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
          >
            Configurar serviços
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-2xl border shadow-sm p-5 ${
                service.isActive ? "border-gray-100" : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {service.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                        service.isActive
                          ? "bg-success-100 text-success-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {service.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  {service.category && (
                    <div className="flex items-center gap-1 mt-1">
                      <Tag size={10} className="text-gray-400" />
                      <span className="text-xs text-gray-400">
                        {CATEGORY_LABELS[service.category] ?? service.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400 flex items-center gap-1.5">
                  <Clock size={12} className="text-gray-300" />
                  {service.durationMinutes} min
                </span>
                <span className="text-base font-bold text-gray-800">
                  {formatCurrency(service.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
