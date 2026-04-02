"use client";

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  Plus,
  Loader2,
  Users,
  X,
  Check,
} from "lucide-react";

interface PlanItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  durationDays: number;
  totalSessions: number;
  isActive: boolean;
  activeClients: number;
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PlanosPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [totalSessions, setTotalSessions] = useState("4");

  const fetchPlans = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/plans");
      const json = await res.json();
      if (json.success) setPlans(json.data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function handleCreate() {
    if (!name.trim() || !price) return;
    setCreating(true);
    try {
      const res = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description: description || undefined,
          price: parseFloat(price),
          durationDays: parseInt(durationDays),
          totalSessions: parseInt(totalSessions),
        }),
      });
      if (res.ok) {
        setShowNew(false);
        setName("");
        setDescription("");
        setPrice("");
        setDurationDays("30");
        setTotalSessions("4");
        fetchPlans();
      }
    } catch {
      // silent
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(plan: PlanItem) {
    await fetch(`/api/plans/${plan.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !plan.isActive }),
    });
    fetchPlans();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 dark:text-gray-100">Planos</h1>
          <p className="text-sm text-gray-400 mt-0.5">Pacotes para fidelizar clientes</p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-4 py-3 bg-primary-500 text-white text-sm font-medium rounded-2xl hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          Novo plano
        </button>
      </div>

      {/* New plan drawer */}
      {showNew && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowNew(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto transition-colors">
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-heading font-semibold text-gray-800 dark:text-gray-100">Novo plano</h2>
                <button onClick={() => setShowNew(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Plano Mensal Premium"
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Descrição</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600 resize-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Preço (R$)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      step="0.01"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Duração (dias)</label>
                    <input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Sessões</label>
                    <input
                      type="number"
                      value={totalSessions}
                      onChange={(e) => setTotalSessions(e.target.value)}
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl text-sm dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-600"
                    />
                  </div>
                </div>

                {price && totalSessions && (
                  <div className="bg-success-50 rounded-2xl p-3">
                    <p className="text-xs text-success-700">
                      Valor por sessão: {formatCurrency(parseFloat(price) / parseInt(totalSessions || "1"))}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCreate}
                  disabled={creating || !name.trim() || !price}
                  className="w-full py-3.5 bg-primary-500 text-white text-sm font-medium rounded-2xl hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {creating ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Criar plano
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Plans list */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm text-gray-500">Erro ao carregar planos.</p>
          <button onClick={fetchPlans} className="mt-3 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-2xl transition-colors">
            Tentar novamente
          </button>
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
            <CreditCard className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">Nenhum plano cadastrado.</p>
          <p className="text-xs text-gray-400 mt-1">Crie planos para fidelizar seus clientes!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white dark:bg-gray-800 rounded-3xl border shadow-soft dark:shadow-none p-6 transition-colors ${
                plan.isActive ? "border-gray-100 dark:border-gray-700" : "border-gray-100 dark:border-gray-700 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{plan.description}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleActive(plan)}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    plan.isActive
                      ? "text-success-600 bg-success-50 hover:bg-success-100"
                      : "text-gray-400 bg-gray-50 hover:bg-gray-100"
                  }`}
                  title={plan.isActive ? "Desativar" : "Ativar"}
                >
                  <Check size={16} />
                </button>
              </div>

              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {formatCurrency(plan.price)}
                </span>
                <span className="text-xs text-gray-400">/ {plan.durationDays} dias</span>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-gray-50">
                <span className="text-gray-400">
                  {plan.totalSessions} sessões
                  <span className="text-gray-200 mx-1">|</span>
                  {formatCurrency(plan.price / plan.totalSessions)}/sessão
                </span>
                <span className="flex items-center gap-1 text-gray-400">
                  <Users size={10} /> {plan.activeClients} ativo{plan.activeClients !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
