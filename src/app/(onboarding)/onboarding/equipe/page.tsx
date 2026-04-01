"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/onboarding/Stepper";
import { ProfessionalForm } from "@/components/onboarding/ProfessionalForm";
import { ProfessionalCard } from "@/components/onboarding/ProfessionalCard";
import { User, Users, Sparkles } from "lucide-react";

interface NewProfessional {
  name: string;
  phone: string;
  serviceIds: string[];
}

interface ServiceOption {
  id: string;
  name: string;
}

type Phase = "choice" | "team";

export default function EquipePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerServices, setOwnerServices] = useState<string[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [professionals, setProfessionals] = useState<NewProfessional[]>([]);
  const [phase, setPhase] = useState<Phase>("choice");

  useEffect(() => {
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.services) {
          setServices(
            data.services.map((s: { id: string; name: string }) => ({
              id: s.id,
              name: s.name,
            }))
          );
        }

        const ownerPro = data.professionals?.find(
          (p: { user?: { role: string } }) => p.user?.role === "owner"
        );
        if (ownerPro) {
          setOwnerName(ownerPro.name);
          setOwnerServices(
            ownerPro.services?.map(
              (ps: { service: { name: string } }) => ps.service.name
            ) || []
          );
        }

        const others = data.professionals?.filter(
          (p: { user?: { role: string } | null }) => p.user?.role !== "owner" && !p.user
        );
        if (others && others.length > 0) {
          setProfessionals(
            others.map(
              (p: {
                name: string;
                phone?: string;
                services?: { serviceId: string }[];
              }) => ({
                name: p.name,
                phone: p.phone || "",
                serviceIds:
                  p.services?.map((ps: { serviceId: string }) => ps.serviceId) || [],
              })
            )
          );
          setPhase("team");
        }

        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function addProfessional(data: NewProfessional) {
    setProfessionals((prev) => [...prev, data]);
  }

  function removeProfessional(index: number) {
    setProfessionals((prev) => prev.filter((_, i) => i !== index));
  }

  function getServiceNames(ids: string[]): string[] {
    return ids
      .map((id) => services.find((s) => s.id === id)?.name)
      .filter(Boolean) as string[];
  }

  async function handleSoloChoice() {
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/onboarding/equipe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionals: [], mode: "solo" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar.");
        setSaving(false);
        return;
      }

      router.push("/onboarding/concluido");
    } catch {
      setError("Erro de conexão.");
      setSaving(false);
    }
  }

  async function handleTeamSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/onboarding/equipe", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionals, mode: "team" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar.");
        setSaving(false);
        return;
      }

      router.push("/onboarding/concluido");
    } catch {
      setError("Erro de conexão.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-gray-400 text-sm">Carregando...</div>
      </div>
    );
  }

  return (
    <div>
      <Stepper currentStep={4} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-2 rounded-md mb-4">
            {error}
          </div>
        )}

        {phase === "choice" && (
          <>
            <h2 className="text-lg font-heading font-semibold text-gray-800 mb-1">Como você trabalha?</h2>
            <p className="text-sm text-gray-500 mb-6">
              Isso define como o sistema vai funcionar para você.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <button
                type="button"
                onClick={handleSoloChoice}
                disabled={saving}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary-400 to-primary-500 flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Trabalho sozinho</p>
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Sparkles size={12} className="text-secondary-500" />
                    Configuração simplificada. A Babia cuida do resto.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPhase("team")}
                disabled={saving}
                className="flex flex-col items-center gap-3 p-6 rounded-xl border-2 border-gray-200 hover:border-primary-400 hover:bg-primary-50/50 transition-all text-center group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 mb-1">Tenho equipe</p>
                  <p className="text-xs text-gray-500">Adicionar outros profissionais</p>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.push("/onboarding/servicos")}
                className="px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
            </div>
          </>
        )}

        {phase === "team" && (
          <>
            <h2 className="text-lg font-heading font-semibold text-gray-800 mb-1">Sua equipe</h2>
            <p className="text-sm text-gray-500 mb-6">
              Você já está adicionado. Adicione outros profissionais se houver.
              Este passo é opcional.
            </p>

            <form onSubmit={handleTeamSubmit} className="space-y-4">
              <div className="space-y-2">
                <ProfessionalCard
                  name={ownerName}
                  serviceNames={ownerServices}
                  isOwner
                />
                {professionals.map((p, index) => (
                  <ProfessionalCard
                    key={index}
                    name={p.name}
                    phone={p.phone}
                    serviceNames={getServiceNames(p.serviceIds)}
                    onRemove={() => removeProfessional(index)}
                  />
                ))}
              </div>

              <ProfessionalForm services={services} onAdd={addProfessional} />

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setPhase("choice")}
                  className="px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-primary-500 text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "Salvando..." : "Continuar"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
