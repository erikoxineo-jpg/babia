"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Stepper } from "@/components/onboarding/Stepper";
import { SlugInput } from "@/components/onboarding/SlugInput";
import { LogoUpload } from "@/components/shared/LogoUpload";
import { slugify } from "@/lib/onboarding";

const inputClass =
  "w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary-300 focus:border-secondary-300 focus:bg-white transition-colors";

export default function BarbeariaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    address: "",
    city: "",
    state: "",
    slug: "",
  });
  const [originalSlug, setOriginalSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((data) => {
        if (data.tenant) {
          setForm({
            name: data.tenant.name || "",
            phone: data.tenant.phone || "",
            whatsapp: data.tenant.whatsapp || "",
            address: data.tenant.address || "",
            city: data.tenant.city || "",
            state: data.tenant.state || "",
            slug: data.tenant.slug || "",
          });
          setOriginalSlug(data.tenant.slug || "");
          setLogoUrl(data.tenant.logoUrl || null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function update(field: string, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "name" && prev.slug === slugify(prev.name)) {
        next.slug = slugify(value);
      }
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/onboarding/barbearia", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao salvar.");
        setSaving(false);
        return;
      }

      router.push("/onboarding/horarios");
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
      <Stepper currentStep={1} />

      <div className="space-y-1 mb-8">
        <h2 className="text-xl font-bold text-gray-800">Dados do estabelecimento</h2>
        <p className="text-sm text-gray-400">
          Informacoes basicas sobre o seu negocio.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-secondary-50 border border-secondary-200 text-secondary-600 text-sm px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Nome do estabelecimento *
          </label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
            placeholder="Ex: Studio Maria, Barbearia do Joao"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Telefone *
            </label>
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className={inputClass}
              placeholder="(11) 99999-9999"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              WhatsApp *
            </label>
            <input
              type="tel"
              required
              value={form.whatsapp}
              onChange={(e) => update("whatsapp", e.target.value)}
              className={inputClass}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <SlugInput
          value={form.slug}
          onChange={(slug) => setForm((prev) => ({ ...prev, slug }))}
          currentTenantSlug={originalSlug}
        />

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Logo ou foto (opcional)
          </label>
          <LogoUpload
            logoUrl={logoUrl}
            onUploadComplete={(url) => setLogoUrl(url)}
            onRemove={() => setLogoUrl(null)}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">
            Endereco
          </label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => update("address", e.target.value)}
            className={inputClass}
            placeholder="Rua, numero"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Cidade
            </label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              Estado
            </label>
            <input
              type="text"
              maxLength={2}
              value={form.state}
              onChange={(e) => update("state", e.target.value.toUpperCase())}
              className={inputClass}
              placeholder="SP"
            />
          </div>
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-secondary-500 text-white py-3.5 px-4 rounded-2xl text-sm font-semibold hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Salvando..." : "Continuar"}
          </button>
        </div>
      </form>
    </div>
  );
}
