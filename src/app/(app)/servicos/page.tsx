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
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Serviços</h1>
          {services.length > 0 && (
            <span className="text-sm text-gray-400">({services.length})</span>
          )}
        </div>
        <Link
          href="/onboarding/servicos"
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Scissors size={16} />
          Gerenciar serviços
        </Link>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-16">
          <Scissors className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            Nenhum serviço cadastrado.
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Configure seus serviços no onboarding.
          </p>
          <Link
            href="/onboarding/servicos"
            className="inline-block mt-4 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
          >
            Configurar serviços
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white rounded-lg border p-4 ${
                service.isActive ? "border-gray-200" : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {service.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
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
                      <span className="text-xs text-gray-500">
                        {CATEGORY_LABELS[service.category] ?? service.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock size={12} className="text-gray-400" />
                  {service.durationMinutes} min
                </span>
                <span className="text-sm font-semibold text-gray-800">
                  R$ {service.price.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
