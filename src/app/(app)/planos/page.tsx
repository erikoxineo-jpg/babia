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

export default function PlanosPage() {
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [totalSessions, setTotalSessions] = useState("4");

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/plans");
      const json = await res.json();
      if (json.success) setPlans(json.data);
    } catch {
      // silent
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
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Planos</h1>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          Novo plano
        </button>
      </div>

      {/* New plan drawer */}
      {showNew && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowNew(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-xl z-50 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Novo plano</h2>
                <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Plano Mensal Premium"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Preço (R$)</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Duração (dias)</label>
                    <input
                      type="number"
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Sessões</label>
                    <input
                      type="number"
                      value={totalSessions}
                      onChange={(e) => setTotalSessions(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                {price && totalSessions && (
                  <div className="bg-success-50 rounded-lg p-3">
                    <p className="text-xs text-success-700">
                      Valor por sessão: R$ {(parseFloat(price) / parseInt(totalSessions || "1")).toFixed(2)}
                    </p>
                  </div>
                )}

                <button
                  onClick={handleCreate}
                  disabled={creating || !name.trim() || !price}
                  className="w-full py-2.5 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
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
      ) : plans.length === 0 ? (
        <div className="text-center py-16">
          <CreditCard className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Nenhum plano cadastrado.</p>
          <p className="text-xs text-gray-300 mt-1">Crie planos para fidelizar seus clientes!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg border p-4 ${
                plan.isActive ? "border-gray-200" : "border-gray-100 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{plan.description}</p>
                  )}
                </div>
                <button
                  onClick={() => toggleActive(plan)}
                  className={`p-1 rounded-md transition-colors ${
                    plan.isActive
                      ? "text-success-600 hover:bg-success-50"
                      : "text-gray-400 hover:bg-gray-100"
                  }`}
                  title={plan.isActive ? "Desativar" : "Ativar"}
                >
                  <Check size={16} />
                </button>
              </div>

              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-2xl font-bold text-gray-800">
                  R$ {plan.price.toFixed(2)}
                </span>
                <span className="text-xs text-gray-400">/ {plan.durationDays} dias</span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {plan.totalSessions} sessões
                  <span className="text-gray-300 mx-1">|</span>
                  R$ {(plan.price / plan.totalSessions).toFixed(2)}/sessão
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
