"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Megaphone,
  Plus,
  Loader2,
  Send,
  Users,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  template: string;
  sentCount: number;
  recipientsCount: number;
  sentAt: string | null;
  createdAt: string;
}

interface WhatsAppLink {
  clientName: string;
  link: string | null;
}

interface SendResult {
  mode: "automatic" | "manual";
  sentCount?: number;
  failedCount?: number;
  recipientsCount?: number;
  whatsappLinks?: WhatsAppLink[];
}

const TEMPLATES = [
  {
    name: "Sentimos sua falta",
    type: "reactivation" as const,
    template:
      "Olá {{client_name}}! Sentimos sua falta na {{barbershop_name}}. Já faz {{last_visit_days}} dias desde sua última visita. Que tal agendar um horário? Temos novidades esperando por você!",
  },
  {
    name: "Promoção especial",
    type: "reactivation" as const,
    template:
      "Oi {{client_name}}! A {{barbershop_name}} preparou uma promoção especial para você. Agende agora e aproveite condições exclusivas para clientes VIP!",
  },
  {
    name: "Novidade no salão",
    type: "promotion" as const,
    template:
      "{{client_name}}, novidade na {{barbershop_name}}! Temos novos serviços e profissionais. Venha conhecer! Agende pelo nosso site.",
  },
  {
    name: "Convite de retorno",
    type: "reactivation" as const,
    template:
      "Fala {{client_name}}! Aqui é da {{barbershop_name}}. Faz tempo que você não aparece! Bora marcar um horário? Estamos com a agenda aberta.",
  },
  {
    name: "Preencher horários",
    type: "fill_slots" as const,
    template:
      "Oi {{client_name}}! Temos horários disponíveis hoje na {{barbershop_name}}. Aproveite e agende agora! Vai ser um prazer te atender.",
  },
];

const STATUS_BADGES: Record<string, { label: string; className: string }> = {
  draft: { label: "Rascunho", className: "bg-gray-100 text-gray-600" },
  sending: { label: "Enviando", className: "bg-warning-100 text-warning-700" },
  sent: { label: "Enviada", className: "bg-success-100 text-success-700" },
  completed: { label: "Concluída", className: "bg-primary-100 text-primary-700" },
};

export default function CampanhasPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [sending, setSending] = useState<string | null>(null);
  const [links, setLinks] = useState<WhatsAppLink[] | null>(null);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);

  // New campaign form
  const [newName, setNewName] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [newType, setNewType] = useState<"reactivation" | "fill_slots" | "promotion">("reactivation");
  const [creating, setCreating] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/campaigns?status=all");
      const json = await res.json();
      if (json.success) setCampaigns(json.data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  async function handleCreate() {
    if (!newName.trim() || !newTemplate.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, type: newType, template: newTemplate }),
      });
      if (res.ok) {
        setShowNew(false);
        setNewName("");
        setNewTemplate("");
        fetchCampaigns();
      }
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  }

  async function handleSend(id: string) {
    setSending(id);
    try {
      const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        const data = json.data;
        if (data.mode === "automatic") {
          setSendResult(data);
        } else {
          setLinks(data.whatsappLinks ?? []);
        }
        fetchCampaigns();
      }
    } catch {
      // silent
    } finally {
      setSending(null);
    }
  }

  function selectTemplate(t: typeof TEMPLATES[number]) {
    setNewName(t.name);
    setNewTemplate(t.template);
    setNewType(t.type);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Campanhas</h1>
          <p className="text-sm text-gray-400 mt-0.5">Reative clientes e preencha horários</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-4 py-3 bg-primary-500 text-white text-sm font-medium rounded-2xl hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          Nova campanha
        </button>
      </div>

      {/* New campaign drawer */}
      {showNew && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowNew(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-heading font-semibold text-gray-800">Nova campanha</h2>
                <button onClick={() => setShowNew(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              {/* Templates */}
              <p className="text-xs text-gray-400 mb-2">Templates prontos</p>
              <div className="space-y-1.5 mb-5">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => selectTemplate(t)}
                    className={`w-full text-left p-3 rounded-2xl border transition-colors text-sm ${
                      newName === t.name
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-100 hover:border-gray-200"
                    }`}
                  >
                    <span className="font-medium text-gray-700">{t.name}</span>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{t.template}</p>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Nome da campanha</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Tipo</label>
                  <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
                    {([
                      { v: "reactivation", l: "Reativação" },
                      { v: "fill_slots", l: "Preencher vagos" },
                      { v: "promotion", l: "Promoção" },
                    ] as const).map((opt) => (
                      <button
                        key={opt.v}
                        onClick={() => setNewType(opt.v)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          newType === opt.v
                            ? "bg-white text-primary-700 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">
                    Mensagem (variáveis: {"{{client_name}}"}, {"{{barbershop_name}}"}, {"{{last_visit_days}}"})
                  </label>
                  <textarea
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white resize-none"
                  />
                </div>

                <button
                  onClick={handleCreate}
                  disabled={creating || !newName.trim() || !newTemplate.trim()}
                  className="w-full py-3.5 bg-primary-500 text-white text-sm font-medium rounded-2xl hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Criar campanha
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auto send result modal */}
      {sendResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setSendResult(null)} />
          <div className="bg-white rounded-3xl shadow-xl z-50 w-full max-w-sm mx-4 p-6 text-center">
            <div className="w-14 h-14 bg-success-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <Send className="w-6 h-6 text-success-600" />
            </div>
            <h2 className="text-lg font-heading font-bold text-gray-800 mb-1">Campanha enviada!</h2>
            <p className="text-sm text-gray-500 mb-4">
              Mensagens disparadas automaticamente via WhatsApp.
            </p>
            <div className="flex justify-center gap-6 mb-5">
              <div>
                <p className="text-2xl font-bold text-success-600">{sendResult.sentCount}</p>
                <p className="text-xs text-gray-400">enviadas</p>
              </div>
              {(sendResult.failedCount ?? 0) > 0 && (
                <div>
                  <p className="text-2xl font-bold text-gray-500">{sendResult.failedCount}</p>
                  <p className="text-xs text-gray-400">falhas</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSendResult(null)}
              className="w-full py-3.5 bg-primary-500 text-white text-sm font-medium rounded-2xl hover:bg-primary-600 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* WhatsApp Links modal */}
      {links && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setLinks(null)} />
          <div className="bg-white rounded-3xl shadow-xl z-50 w-full max-w-md max-h-[80vh] overflow-y-auto mx-4">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">
                  Links de WhatsApp ({links.length})
                </h2>
                <button onClick={() => setLinks(null)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X size={18} />
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-3">
                Clique em cada link para abrir o WhatsApp com a mensagem pronta.
              </p>
              <div className="space-y-1">
                {links.map((l, i) => (
                  <a
                    key={i}
                    href={l.link ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm text-gray-700">{l.clientName}</span>
                    <ExternalLink size={14} className="text-success-600" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Campaign list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">Erro ao carregar campanhas.</p>
          <button onClick={fetchCampaigns} className="mt-3 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-2xl transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <Megaphone className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">Nenhuma campanha criada.</p>
          <p className="text-xs text-gray-400 mt-1">Crie sua primeira campanha de reativação!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map((c) => {
            const badge = STATUS_BADGES[c.status] ?? STATUS_BADGES.draft;
            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-soft p-6"
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {c.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${badge.className}`}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Users size={10} /> {c.sentCount || c.recipientsCount} destinatário{c.sentCount !== 1 ? "s" : ""}
                      </span>
                      {c.sentAt && (
                        <span className="text-xs text-gray-400">
                          Enviada em {new Date(c.sentAt).toLocaleDateString("pt-BR")}
                        </span>
                      )}
                    </div>
                  </div>

                  {c.status === "draft" && (
                    <button
                      onClick={() => handleSend(c.id)}
                      disabled={sending === c.id}
                      className="flex items-center gap-1.5 px-4 py-2 bg-success-500 text-white text-xs font-medium rounded-2xl hover:bg-success-600 disabled:opacity-50 transition-colors ml-3"
                    >
                      {sending === c.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Send size={12} />
                      )}
                      Disparar
                    </button>
                  )}

                  {c.status === "sent" && (
                    <div className="flex items-center gap-1 text-xs text-success-600 ml-3">
                      <ChevronRight size={14} />
                      {c.sentCount} enviado{c.sentCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
