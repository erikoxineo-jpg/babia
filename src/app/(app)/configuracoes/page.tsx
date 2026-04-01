"use client";

import { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Save,
  Building2,
  Clock,
  Bell,
  ShieldAlert,
  Check,
  Camera,
  Trash2,
  Scissors,
} from "lucide-react";

interface TenantData {
  id: string;
  name: string;
  slug: string;
  plan: string;
  phone: string;
  whatsapp: string | null;
  email: string;
  address: string | null;
  city: string | null;
  state: string | null;
  logoUrl: string | null;
  settings: {
    bookingAdvanceDays: number;
    cancellationPolicyHours: number;
    confirmationEnabled: boolean;
    reminderHoursBefore: number;
    inactiveDaysThreshold: number;
    workingDays: number[];
  } | null;
  stats: {
    totalProfessionals: number;
    totalClients: number;
    totalServices: number;
  };
}

const WEEKDAYS = [
  { value: 0, short: "Dom" },
  { value: 1, short: "Seg" },
  { value: 2, short: "Ter" },
  { value: 3, short: "Qua" },
  { value: 4, short: "Qui" },
  { value: 5, short: "Sex" },
  { value: 6, short: "Sáb" },
];

export default function ConfiguracoesPage() {
  const [data, setData] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states — tenant data
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  // Form states — settings
  const [bookingAdvanceDays, setBookingAdvanceDays] = useState(30);
  const [cancellationPolicyHours, setCancellationPolicyHours] = useState(2);
  const [confirmationEnabled, setConfirmationEnabled] = useState(true);
  const [reminderHoursBefore, setReminderHoursBefore] = useState(2);
  const [inactiveDaysThreshold, setInactiveDaysThreshold] = useState(45);
  const [workingDays, setWorkingDays] = useState<number[]>([1, 2, 3, 4, 5, 6]);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/tenant");
        const json = await res.json();
        if (json.success) {
          const d = json.data as TenantData;
          setData(d);
          setLogoUrl(d.logoUrl);
          setName(d.name);
          setPhone(d.phone);
          setWhatsapp(d.whatsapp ?? "");
          setEmail(d.email);
          setAddress(d.address ?? "");
          setCity(d.city ?? "");
          setState(d.state ?? "");
          if (d.settings) {
            setBookingAdvanceDays(d.settings.bookingAdvanceDays);
            setCancellationPolicyHours(d.settings.cancellationPolicyHours);
            setConfirmationEnabled(d.settings.confirmationEnabled);
            setReminderHoursBefore(d.settings.reminderHoursBefore);
            setInactiveDaysThreshold(d.settings.inactiveDaysThreshold);
            setWorkingDays(d.settings.workingDays as number[]);
          }
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function showSuccess(section: string) {
    setSuccess(section);
    setTimeout(() => setSuccess(null), 2000);
  }

  async function saveTenantData() {
    setSaving("tenant");
    try {
      const res = await fetch("/api/tenant", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, whatsapp, email, address, city, state }),
      });
      if (res.ok) showSuccess("tenant");
    } catch {
      // silent
    } finally {
      setSaving(null);
    }
  }

  async function saveSettings() {
    setSaving("settings");
    try {
      const res = await fetch("/api/tenant/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingAdvanceDays,
          cancellationPolicyHours,
          confirmationEnabled,
          reminderHoursBefore,
          inactiveDaysThreshold,
          workingDays,
        }),
      });
      if (res.ok) showSuccess("settings");
    } catch {
      // silent
    } finally {
      setSaving(null);
    }
  }

  function toggleDay(day: number) {
    setWorkingDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLogoError(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setLogoError("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Arquivo muito grande. Máximo 2 MB.");
      return;
    }

    setLogoUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/tenant/logo", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (res.ok && json.success) {
        setLogoUrl(json.data.logoUrl);
        showSuccess("logo");
      } else {
        setLogoError(json.error || "Erro ao fazer upload.");
      }
    } catch {
      setLogoError("Erro ao fazer upload.");
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleLogoRemove() {
    setLogoError(null);
    setLogoUploading(true);
    try {
      const res = await fetch("/api/tenant/logo", { method: "DELETE" });
      if (res.ok) {
        setLogoUrl(null);
        showSuccess("logo");
      }
    } catch {
      setLogoError("Erro ao remover logo.");
    } finally {
      setLogoUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-sm text-gray-400">
        Erro ao carregar configurações.
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h1>

      {/* Logo da Barbearia */}
      <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Camera size={18} className="text-primary-500" />
          <h2 className="text-sm font-semibold text-gray-700">
            Logo da barbearia
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-primary-500/20">
            {logoUploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : logoUrl ? (
              <img
                src={logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Scissors className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                {success === "logo" ? (
                  <Check size={12} />
                ) : (
                  <Camera size={12} />
                )}
                {success === "logo"
                  ? "Salvo!"
                  : logoUrl
                    ? "Alterar foto"
                    : "Enviar foto"}
              </button>

              {logoUrl && !logoUploading && (
                <button
                  onClick={handleLogoRemove}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-red-300 text-red-500 text-xs font-medium rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={12} />
                  Remover
                </button>
              )}
            </div>

            <p className="text-xs text-gray-400">
              JPG, PNG ou WebP. Máx 2 MB.
            </p>

            {logoError && (
              <p className="text-xs text-red-500">{logoError}</p>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleLogoUpload}
          className="hidden"
        />
      </section>

      {/* Dados da Barbearia */}
      <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={18} className="text-primary-500" />
          <h2 className="text-sm font-semibold text-gray-700">
            Dados da barbearia
          </h2>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Telefone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                WhatsApp
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="Mesmo que telefone se vazio"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Endereço
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Cidade
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Estado
              </label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                maxLength={2}
                placeholder="SP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 uppercase"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-gray-400">
              Slug: <strong>{data.slug}</strong>
            </span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-400">
              Plano: <strong>{data.plan}</strong>
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={saveTenantData}
            disabled={saving === "tenant"}
            className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {saving === "tenant" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : success === "tenant" ? (
              <Check size={14} />
            ) : (
              <Save size={14} />
            )}
            {success === "tenant" ? "Salvo!" : "Salvar dados"}
          </button>
        </div>
      </section>

      {/* Horários de Funcionamento */}
      <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-primary-500" />
          <h2 className="text-sm font-semibold text-gray-700">
            Horários e funcionamento
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-2 block">
              Dias de funcionamento
            </label>
            <div className="flex gap-1.5">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    workingDays.includes(day.value)
                      ? "bg-primary-500 text-white"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Antecedência máx. para agendamento
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={bookingAdvanceDays}
                  onChange={(e) =>
                    setBookingAdvanceDays(Number(e.target.value))
                  }
                  min={1}
                  max={90}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-xs text-gray-400">dias</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Threshold de inatividade
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={inactiveDaysThreshold}
                  onChange={(e) =>
                    setInactiveDaysThreshold(Number(e.target.value))
                  }
                  min={7}
                  max={365}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-xs text-gray-400">dias sem visita</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notificações */}
      <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Bell size={18} className="text-primary-500" />
          <h2 className="text-sm font-semibold text-gray-700">Notificações</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Confirmação automática</p>
              <p className="text-xs text-gray-400">
                Enviar confirmação após agendamento
              </p>
            </div>
            <button
              onClick={() => setConfirmationEnabled(!confirmationEnabled)}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                confirmationEnabled ? "bg-primary-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${
                  confirmationEnabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Lembrete antes do horário
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={reminderHoursBefore}
                onChange={(e) =>
                  setReminderHoursBefore(Number(e.target.value))
                }
                min={1}
                max={48}
                className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <span className="text-xs text-gray-400">horas antes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Políticas */}
      <section className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={18} className="text-primary-500" />
          <h2 className="text-sm font-semibold text-gray-700">
            Política de cancelamento e no-show
          </h2>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">
            Cancelamento permitido até
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={cancellationPolicyHours}
              onChange={(e) =>
                setCancellationPolicyHours(Number(e.target.value))
              }
              min={0}
              max={72}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <span className="text-xs text-gray-400">
              horas antes do horário (0 = sem política)
            </span>
          </div>
        </div>
      </section>

      {/* Save settings button */}
      <div className="flex justify-end mb-8">
        <button
          onClick={saveSettings}
          disabled={saving === "settings"}
          className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {saving === "settings" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : success === "settings" ? (
            <Check size={14} />
          ) : (
            <Save size={14} />
          )}
          {success === "settings" ? "Salvo!" : "Salvar configurações"}
        </button>
      </div>

      {/* Stats */}
      <div className="border-t border-gray-200 pt-4">
        <p className="text-xs text-gray-400 mb-2">Estatísticas do sistema</p>
        <div className="flex gap-6">
          <span className="text-xs text-gray-500">
            {data.stats.totalProfessionals} profissional{data.stats.totalProfessionals !== 1 ? "is" : ""}
          </span>
          <span className="text-xs text-gray-500">
            {data.stats.totalClients} cliente{data.stats.totalClients !== 1 ? "s" : ""}
          </span>
          <span className="text-xs text-gray-500">
            {data.stats.totalServices} serviço{data.stats.totalServices !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
