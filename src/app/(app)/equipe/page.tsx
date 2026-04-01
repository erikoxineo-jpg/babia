"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCheck, Loader2, Phone, Briefcase } from "lucide-react";

interface ProfessionalItem {
  id: string;
  name: string;
  phone: string | null;
  specialty: string | null;
  isActive: boolean;
  services: { id: string; name: string }[];
}

export default function EquipePage() {
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProfessionals = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/equipe");
      const json = await res.json();
      if (json.success) setProfessionals(json.data ?? []);
    } catch {
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800">Equipe</h1>
          {professionals.length > 0 && (
            <span className="text-sm text-gray-400">
              ({professionals.length})
            </span>
          )}
        </div>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-16">
          <UserCheck className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            Nenhum profissional cadastrado.
          </p>
          <p className="text-xs text-gray-300 mt-1">
            Adicione profissionais no onboarding para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className={`bg-white rounded-lg border p-4 ${
                pro.isActive ? "border-gray-200" : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-xs font-semibold shrink-0">
                      {pro.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-800 truncate">
                          {pro.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            pro.isActive
                              ? "bg-success-100 text-success-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {pro.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        {pro.specialty && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Briefcase size={10} />
                            {pro.specialty}
                          </span>
                        )}
                        {pro.phone && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Phone size={10} />
                            {pro.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Serviços vinculados */}
                  {pro.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-gray-100">
                      {pro.services.map((s) => (
                        <span
                          key={s.id}
                          className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-medium"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
