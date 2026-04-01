"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Stepper } from "@/components/onboarding/Stepper";
import { ServiceCard } from "@/components/onboarding/ServiceCard";
import { SERVICE_TEMPLATES, type ServiceTemplate } from "@/lib/onboarding";

interface ServiceItem extends ServiceTemplate {
  isTemplate?: boolean;
  selected?: boolean;
}

export default function ServicosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [templates, setTemplates] = useState<ServiceItem[]>(
    SERVICE_TEMPLATES.map((t) => ({ ...t, isTemplate: true, selected: true }))
  );
  const [custom, setCustom] = useState<ServiceItem[]>([]);

  useEffect(() => {
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.services && data.services.length > 0) {
          const existingNames = new Set(
            data.services.map((s: { name: string }) => s.name)
          );

          setTemplates(
            SERVICE_TEMPLATES.map((t) => ({
              ...t,
              isTemplate: true,
              selected: existingNames.has(t.name),
            }))
          );

          const templateNames = new Set(
            SERVICE_TEMPLATES.map((t) => t.name)
          );
          const customServices = data.services
            .filter((s: { name: string }) => !templateNames.has(s.name))
            .map((s: { name: string; durationMinutes: number; price: number; category: string }) => ({
              name: s.name,
              durationMinutes: s.durationMinutes,
              price: Number(s.price),
              category: s.category || "Outro",
            }));
          setCustom(customServices);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleTemplate(index: number) {
    setTemplates((prev) =>
      prev.map((t, i) => (i === index ? { ...t, selected: !t.selected } : t))
    );
  }

  function updateTemplate(index: number, service: ServiceItem) {
    setTemplates((prev) => prev.map((t, i) => (i === index ? { ...service, isTemplate: true, selected: true } : t)));
  }

  function addCustom() {
    setCustom((prev) => [
      ...prev,
      { name: "", durationMinutes: 30, price: 0, category: "Outro" },
    ]);
  }

  function updateCustom(index: number, service: ServiceItem) {
    setCustom((prev) => prev.map((s, i) => (i === index ? service : s)));
  }

  function removeCustom(index: number) {
    setCustom((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const selected = templates
      .filter((t) => t.selected)
      .map(({ name, durationMinutes, price, category }) => ({
        name,
        durationMinutes,
        price,
        category,
      }));

    const validCustom = custom.filter((c) => c.name.trim());
    const allServices = [...selected, ...validCustom];

    if (allServices.length === 0) {
      setError("Adicione pelo menos 1 servico.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/onboarding/servicos", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: allServices }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar.");
        setSaving(false);
        return;
      }

      router.push("/onboarding/equipe");
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
      <Stepper currentStep={3} />

      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-bold text-gray-800">Servicos oferecidos</h2>
        <p className="text-sm text-gray-400">
          Selecione os servicos e personalize precos. Voce pode adicionar mais depois.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-gray-50 border border-gray-200 text-gray-600 text-sm px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Servicos populares</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {templates.map((t, index) => (
              <ServiceCard
                key={index}
                service={t}
                onToggle={() => toggleTemplate(index)}
                onChange={(s) => updateTemplate(index, s as ServiceItem)}
              />
            ))}
          </div>
        </div>

        {custom.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Personalizados</p>
            {custom.map((c, index) => (
              <ServiceCard
                key={index}
                service={c}
                onChange={(s) => updateCustom(index, s as ServiceItem)}
                onRemove={() => removeCustom(index)}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addCustom}
          className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar servico personalizado
        </button>

        <div className="flex gap-3 pt-3">
          <button
            type="button"
            onClick={() => router.push("/onboarding/horarios")}
            className="px-5 py-3 border-2 border-gray-100 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Voltar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-primary-500 text-white py-3 px-4 rounded-2xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
}
