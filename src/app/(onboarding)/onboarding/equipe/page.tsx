"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Stepper } from "@/components/onboarding/Stepper";
import { ProfessionalForm } from "@/components/onboarding/ProfessionalForm";
import { ProfessionalCard } from "@/components/onboarding/ProfessionalCard";
import { User, Users, Loader2 } from "lucide-react";

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
      setError("Erro de conexao.");
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
      setError("Erro de conexao.");
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Stepper currentStep={4} />

      {error && (
        <div className="bg-secondary-50 border border-secondary-200 text-secondary-600 text-sm px-4 py-3 rounded-2xl mb-6">
          {error}
        </div>
      )}

      {phase === "choice" && (
        <>
          <div className="space-y-1 mb-8">
            <h2 className="text-xl font-bold text-gray-800">Como voce trabalha?</h2>
            <p className="text-sm text-gray-400">
              Isso define como o sistema vai funcionar para voce.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={handleSoloChoice}
              disabled={saving}
              className="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-soft transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-16 h-16 rounded-2xl bg-secondary-500 flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">Trabalho sozinho</p>
                <p className="text-xs text-gray-400">
                  Configuracao simplificada
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPhase("team")}
              disabled={saving}
              className="flex flex-col items-center gap-4 p-8 rounded-3xl border-2 border-gray-100 hover:border-primary-300 hover:shadow-soft transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="font-bold text-gray-800 mb-1">Tenho equipe</p>
                <p className="text-xs text-gray-400">Adicionar outros profissionais</p>
              </div>
            </button>
          </div>

          <button
            type="button"
            onClick={() => router.push("/onboarding/servicos")}
            className="px-5 py-3 border-2 border-gray-100 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Voltar
          </button>
        </>
      )}

      {phase === "team" && (
        <>
          <div className="space-y-1 mb-8">
            <h2 className="text-xl font-bold text-gray-800">Sua equipe</h2>
            <p className="text-sm text-gray-400">
              Voce ja esta adicionado. Adicione outros profissionais se houver. Este passo e opcional.
            </p>
          </div>

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

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setPhase("choice")}
                className="px-5 py-3 border-2 border-gray-100 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-secondary-500 text-white py-3 px-4 rounded-2xl text-sm font-semibold hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Salvando..." : "Continuar"}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
