"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
      setError("Adicione pelo menos 1 serviço.");
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
      <Stepper currentStep={3} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-heading font-semibold text-gray-800 mb-1">Serviços oferecidos</h2>
        <p className="text-sm text-gray-500 mb-6">
          Selecione os serviços da sua barbearia. Você pode personalizar preços e adicionar novos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Serviços populares</p>
            {templates.map((t, index) => (
              <ServiceCard
                key={index}
                service={t}
                onToggle={() => toggleTemplate(index)}
                onChange={(s) => updateTemplate(index, s as ServiceItem)}
              />
            ))}
          </div>

          {custom.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Serviços personalizados</p>
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
            className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar serviço personalizado
          </button>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push("/onboarding/horarios")}
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
      </div>
    </div>
  );
}
