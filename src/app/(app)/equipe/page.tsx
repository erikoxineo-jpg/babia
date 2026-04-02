"use client";

import { useState, useEffect, useCallback } from "react";
import {
  UserCheck,
  Loader2,
  Phone,
  Briefcase,
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";

interface ServiceItem {
  id: string;
  name: string;
}

interface ProfessionalItem {
  id: string;
  name: string;
  phone: string | null;
  specialty: string | null;
  isActive: boolean;
  services: ServiceItem[];
}

export default function EquipePage() {
  const [professionals, setProfessionals] = useState<ProfessionalItem[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingPro, setEditingPro] = useState<ProfessionalItem | null>(null);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formSpecialty, setFormSpecialty] = useState("");
  const [formServiceIds, setFormServiceIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProfessionals = useCallback(async () => {
    setError(false);
    try {
      const res = await fetch("/api/onboarding/equipe");
      const json = await res.json();
      if (json.success) setProfessionals(json.data ?? []);
      else setError(true);
    } catch {
      setProfessionals([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch("/api/onboarding/servicos");
      const json = await res.json();
      if (json.success) setServices(json.data ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchProfessionals();
    fetchServices();
  }, [fetchProfessionals, fetchServices]);

  function openAdd() {
    setEditingPro(null);
    setFormName("");
    setFormPhone("");
    setFormSpecialty("");
    setFormServiceIds(services.map((s) => s.id)); // all selected by default
    setDrawerOpen(true);
  }

  function openEdit(pro: ProfessionalItem) {
    setEditingPro(pro);
    setFormName(pro.name);
    setFormPhone(pro.phone ?? "");
    setFormSpecialty(pro.specialty ?? "");
    setFormServiceIds(pro.services.map((s) => s.id));
    setDrawerOpen(true);
  }

  async function handleSave() {
    if (!formName.trim()) return;
    setSaving(true);

    try {
      if (editingPro) {
        // Edit
        const res = await fetch("/api/onboarding/equipe", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingPro.id,
            name: formName,
            phone: formPhone,
            specialty: formSpecialty,
            serviceIds: formServiceIds,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
      } else {
        // Create
        const res = await fetch("/api/onboarding/equipe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formName,
            phone: formPhone,
            specialty: formSpecialty,
            serviceIds: formServiceIds,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
      }

      setDrawerOpen(false);
      fetchProfessionals();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar profissional.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este profissional?")) return;
    setDeleting(id);

    try {
      const res = await fetch(`/api/onboarding/equipe?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      fetchProfessionals();
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir profissional.");
    } finally {
      setDeleting(null);
    }
  }

  function toggleService(id: string) {
    setFormServiceIds((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Equipe</h1>
            {professionals.length > 0 && (
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                {professionals.length}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-0.5">Profissionais do seu estabelecimento</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-2xl hover:bg-primary-600 transition-colors"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Adicionar</span>
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-16">
          <AlertTriangle className="w-6 h-6 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Erro ao carregar equipe.</p>
          <button
            onClick={fetchProfessionals}
            className="mt-3 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-2xl transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      ) : professionals.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-14 h-14 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-6 h-6 text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Nenhum profissional cadastrado.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Clique em &ldquo;Adicionar&rdquo; para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {professionals.map((pro) => (
            <div
              key={pro.id}
              className={`bg-white dark:bg-gray-800 rounded-3xl border shadow-soft dark:shadow-none p-6 transition-colors ${
                pro.isActive
                  ? "border-gray-100 dark:border-gray-700"
                  : "border-gray-100 dark:border-gray-700 opacity-60"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-sm font-bold shrink-0">
                  {pro.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {pro.name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium shrink-0 ${
                        pro.isActive
                          ? "bg-success-100 text-success-700"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                      }`}
                    >
                      {pro.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {pro.specialty && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Briefcase size={10} />
                        {pro.specialty}
                      </span>
                    )}
                    {pro.phone && (
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Phone size={10} />
                        {pro.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(pro)}
                    className="p-2 text-gray-400 hover:text-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  {/* Don't show delete for first professional (owner) */}
                  {professionals.indexOf(pro) > 0 && (
                    <button
                      onClick={() => handleDelete(pro.id)}
                      disabled={deleting === pro.id}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-xl transition-colors disabled:opacity-50"
                      title="Excluir"
                    >
                      {deleting === pro.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Services */}
              {pro.services.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gray-50 dark:border-gray-700">
                  {pro.services.map((s) => (
                    <span
                      key={s.id}
                      className="px-2.5 py-0.5 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-[10px] font-medium"
                    >
                      {s.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                {editingPro ? "Editar Profissional" : "Novo Profissional"}
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Nome do profissional"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Specialty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Especialidade
                </label>
                <input
                  type="text"
                  value={formSpecialty}
                  onChange={(e) => setFormSpecialty(e.target.value)}
                  placeholder="Ex: Barbeiro, Cabeleireiro"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Serviços
                </label>
                {services.length === 0 ? (
                  <p className="text-xs text-gray-400">Nenhum serviço cadastrado.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {services.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleService(s.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          formServiceIds.includes(s.id)
                            ? "bg-primary-500 text-white"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                className="w-full py-3 bg-primary-500 text-white text-sm font-semibold rounded-2xl hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {saving && <Loader2 size={16} className="animate-spin" />}
                {editingPro ? "Salvar Alterações" : "Adicionar Profissional"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
