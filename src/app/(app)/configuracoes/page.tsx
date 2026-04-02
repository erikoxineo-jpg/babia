"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  Copy,
  Link2,
  ExternalLink,
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

const inputClass = "w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600";
const smallInputClass = "w-20 px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600";

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [data, setData] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
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
        router.refresh();
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
        router.refresh();
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
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Configurações</h1>
        <p className="text-sm text-gray-400 mt-0.5">Gerencie os dados do seu estabelecimento</p>
      </div>

      {/* Logo */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-soft dark:shadow-none p-6 transition-colors">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
            <Camera size={16} className="text-primary-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Logo da barbearia</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-primary-500/20">
            {logoUploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Scissors className="w-8 h-8 text-white" />
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
                className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white text-xs font-medium rounded-xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                {success === "logo" ? <Check size={12} /> : <Camera size={12} />}
                {success === "logo" ? "Salvo!" : logoUrl ? "Alterar foto" : "Enviar foto"}
              </button>

              {logoUrl && !logoUploading && (
                <button
                  onClick={handleLogoRemove}
                  className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 text-gray-500 text-xs font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Trash2 size={12} />
                  Remover
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400">JPG, PNG ou WebP. Máx 2 MB.</p>
            {logoError && <p className="text-xs text-gray-500">{logoError}</p>}
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

      {/* Tenant Data */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-soft dark:shadow-none p-6 transition-colors">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
            <Building2 size={16} className="text-primary-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Dados da barbearia</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Nome</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Telefone</label>
              <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">WhatsApp</label>
              <input type="text" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Mesmo que telefone se vazio" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">E-mail</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label className="text-xs text-gray-500 mb-1.5 block">Endereço</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Cidade</label>
              <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Estado</label>
              <input type="text" value={state} onChange={(e) => setState(e.target.value)} maxLength={2} placeholder="SP" className={`${inputClass} uppercase`} />
            </div>
          </div>

          {/* Booking Link */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Link2 size={14} className="text-primary-500" />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Link de Agendamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl text-xs text-gray-600 dark:text-gray-300 truncate border border-gray-200 dark:border-gray-600">
                {`${typeof window !== "undefined" ? window.location.origin : ""}/agendar/${data.slug}`}
              </div>
              <a
                href={`/agendar/${data.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 p-2 text-gray-400 hover:text-primary-500 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                title="Abrir link"
              >
                <ExternalLink size={14} />
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/agendar/${data.slug}`);
                  setCopiedLink(true);
                  setTimeout(() => setCopiedLink(false), 2000);
                }}
                className={`shrink-0 px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center gap-1 ${
                  copiedLink
                    ? "bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-400"
                    : "bg-primary-500 text-white hover:bg-primary-600"
                }`}
              >
                {copiedLink ? <Check size={12} /> : <Copy size={12} />}
                {copiedLink ? "Copiado!" : "Copiar"}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-gray-400">
              Plano: <strong>{data.plan}</strong>
            </span>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={saveTenantData}
            disabled={saving === "tenant"}
            className="flex items-center gap-1.5 px-5 py-3 bg-primary-500 text-white text-sm font-medium rounded-2xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {saving === "tenant" ? <Loader2 size={14} className="animate-spin" /> : success === "tenant" ? <Check size={14} /> : <Save size={14} />}
            {success === "tenant" ? "Salvo!" : "Salvar dados"}
          </button>
        </div>
      </section>

      {/* Working Hours */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-soft dark:shadow-none p-6 transition-colors">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
            <Clock size={16} className="text-primary-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Horários e funcionamento</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Dias de funcionamento</label>
            <div className="inline-flex bg-gray-100 dark:bg-gray-700 rounded-full p-1 gap-1">
              {WEEKDAYS.map((day) => (
                <button
                  key={day.value}
                  onClick={() => toggleDay(day.value)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    workingDays.includes(day.value)
                      ? "bg-white dark:bg-gray-600 text-primary-700 dark:text-primary-400 shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {day.short}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Antecedência máx. agendamento</label>
              <div className="flex items-center gap-2">
                <input type="number" value={bookingAdvanceDays} onChange={(e) => setBookingAdvanceDays(Number(e.target.value))} min={1} max={90} className={smallInputClass} />
                <span className="text-xs text-gray-400">dias</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Threshold de inatividade</label>
              <div className="flex items-center gap-2">
                <input type="number" value={inactiveDaysThreshold} onChange={(e) => setInactiveDaysThreshold(Number(e.target.value))} min={7} max={365} className={smallInputClass} />
                <span className="text-xs text-gray-400">dias sem visita</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Notifications */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-soft dark:shadow-none p-6 transition-colors">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
            <Bell size={16} className="text-primary-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Notificações</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">Confirmação automática</p>
              <p className="text-xs text-gray-400">Enviar confirmação após agendamento</p>
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
            <label className="text-xs text-gray-500 mb-1.5 block">Lembrete antes do horário</label>
            <div className="flex items-center gap-2">
              <input type="number" value={reminderHoursBefore} onChange={(e) => setReminderHoursBefore(Number(e.target.value))} min={1} max={48} className={smallInputClass} />
              <span className="text-xs text-gray-400">horas antes</span>
            </div>
          </div>
        </div>
      </section>

      {/* Cancellation Policy */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 shadow-soft dark:shadow-none p-6 transition-colors">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
            <ShieldAlert size={16} className="text-primary-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Política de cancelamento</h2>
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Cancelamento permitido até</label>
          <div className="flex items-center gap-2">
            <input type="number" value={cancellationPolicyHours} onChange={(e) => setCancellationPolicyHours(Number(e.target.value))} min={0} max={72} className={smallInputClass} />
            <span className="text-xs text-gray-400">horas antes do horário (0 = sem política)</span>
          </div>
        </div>
      </section>

      {/* Save settings button */}
      <div className="flex justify-end pb-4">
        <button
          onClick={saveSettings}
          disabled={saving === "settings"}
          className="flex items-center gap-1.5 px-5 py-3 bg-primary-500 text-white text-sm font-medium rounded-2xl hover:bg-primary-600 disabled:opacity-50 transition-colors"
        >
          {saving === "settings" ? <Loader2 size={14} className="animate-spin" /> : success === "settings" ? <Check size={14} /> : <Save size={14} />}
          {success === "settings" ? "Salvo!" : "Salvar configurações"}
        </button>
      </div>

      {/* Stats */}
      <div className="border-t border-gray-100 dark:border-gray-700 pt-4 pb-2">
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
