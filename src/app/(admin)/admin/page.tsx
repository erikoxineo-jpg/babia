"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  Loader2,
  Shield,
  Users,
  Calendar,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  AlertTriangle,
  Crown,
  LogOut,
  Lock,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string;
  plan: string;
  status: string;
  onboardingCompleted: boolean;
  createdAt: string;
  totalProfessionals: number;
  totalClients: number;
  totalAppointments: number;
}

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Solo",
  professional: "Equipe",
  premium: "Premium",
};

const PLAN_COLORS: Record<string, string> = {
  free: "bg-gray-100 text-gray-600",
  starter: "bg-blue-50 text-blue-700",
  professional: "bg-primary-50 text-primary-700",
  premium: "bg-yellow-50 text-yellow-700",
};

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Credenciais inválidas.");
      setLoading(false);
    }
    // If success, useSession will update and show the panel
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/babiaperfil3.png" alt="BabIA" className="w-20 h-20 rounded-full object-cover mx-auto mb-4 ring-2 ring-gray-700 shadow-lg" />
          <h1 className="text-xl font-bold text-white">Admin BabIA</h1>
          <p className="text-sm text-gray-500 mt-1">Acesso restrito</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Senha"
                required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/20 border border-red-800/30 rounded-xl px-4 py-2.5">
              <Lock size={14} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-gray-900 font-medium py-3 rounded-xl text-sm hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Shield size={16} />
                Entrar no Admin
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function AdminPanel() {
  const { data: session } = useSession();
  const [tenants, setTenants] = useState<TenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [updatingPlanId, setUpdatingPlanId] = useState<string | null>(null);

  const adminEmail = (session?.user as Record<string, unknown>)?.email as string;

  const fetchTenants = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/api/admin/tenants");
      if (res.status === 403) {
        setError("Acesso negado. Apenas super admin.");
        setLoading(false);
        return;
      }
      const json = await res.json();
      if (json.success) setTenants(json.data);
      else setError(json.error || "Erro ao carregar.");
    } catch {
      setError("Erro de conexao.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const toggleStatus = async (tenant: TenantItem) => {
    const newStatus = tenant.status === "active" ? "suspended" : "active";
    setTogglingId(tenant.id);
    try {
      const res = await fetch(`/api/admin/tenants/${tenant.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const json = await res.json();
      if (json.success) {
        setTenants((prev) =>
          prev.map((t) => (t.id === tenant.id ? { ...t, status: newStatus } : t))
        );
      }
    } catch {
      // silent
    } finally {
      setTogglingId(null);
    }
  };

  const updatePlan = async (tenantId: string, plan: string) => {
    setUpdatingPlanId(tenantId);
    try {
      const res = await fetch(`/api/admin/tenants/${tenantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const json = await res.json();
      if (json.success) {
        setTenants((prev) =>
          prev.map((t) => (t.id === tenantId ? { ...t, plan } : t))
        );
      }
    } catch {
      // silent
    } finally {
      setUpdatingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600">{error}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/admin" })}
            className="mt-4 px-4 py-2 text-sm bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
          >
            Sair e tentar outra conta
          </button>
        </div>
      </div>
    );
  }

  const activeCount = tenants.filter((t) => t.status === "active").length;
  const suspendedCount = tenants.filter((t) => t.status !== "active").length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/babiaperfil3.png" alt="BabIA" className="w-10 h-10 rounded-full object-cover ring-2 ring-primary-200" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Painel Admin</h1>
              <p className="text-xs text-gray-400">Controle de acesso dos clientes BabIA</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400 hidden sm:block">{adminEmail}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/admin" })}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Sair"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Users size={14} />
              <span className="text-xs">Total</span>
            </div>
            <span className="text-2xl font-bold text-gray-800">{tenants.length}</span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-green-500 mb-1">
              <UserCheck size={14} />
              <span className="text-xs">Ativos</span>
            </div>
            <span className="text-2xl font-bold text-green-600">{activeCount}</span>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <AlertTriangle size={14} />
              <span className="text-xs">Bloqueados</span>
            </div>
            <span className="text-2xl font-bold text-red-500">{suspendedCount}</span>
          </div>
        </div>

        {/* Tenant List */}
        {tenants.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Nenhum cliente cadastrado ainda.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tenants.map((tenant) => (
              <div
                key={tenant.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
                  tenant.status === "active"
                    ? "border-gray-100"
                    : "border-red-100 bg-red-50/30"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-800 truncate">
                        {tenant.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          tenant.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tenant.status === "active" ? "Ativo" : "Bloqueado"}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          PLAN_COLORS[tenant.plan] || PLAN_COLORS.free
                        }`}
                      >
                        <Crown size={8} className="inline mr-0.5 -mt-px" />
                        {PLAN_LABELS[tenant.plan] || tenant.plan}
                      </span>
                      {!tenant.onboardingCompleted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-50 text-yellow-700">
                          Onboarding pendente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-400">
                      <span>{tenant.email}</span>
                      <span>{tenant.phone}</span>
                    </div>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <UserCheck size={12} />
                        {tenant.totalProfessionals} prof.
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} />
                        {tenant.totalClients} clientes
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {tenant.totalAppointments} agend.
                      </span>
                      <span className="text-gray-300">
                        Desde{" "}
                        {new Date(tenant.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Plan selector */}
                    <select
                      value={tenant.plan}
                      onChange={(e) => updatePlan(tenant.id, e.target.value)}
                      disabled={updatingPlanId === tenant.id}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-300"
                    >
                      <option value="free">Free</option>
                      <option value="starter">Solo</option>
                      <option value="professional">Equipe</option>
                      <option value="premium">Premium</option>
                    </select>

                    {/* Toggle active/suspended */}
                    <button
                      onClick={() => toggleStatus(tenant)}
                      disabled={togglingId === tenant.id}
                      className={`p-1.5 rounded-lg transition-colors ${
                        tenant.status === "active"
                          ? "text-green-600 hover:bg-green-50"
                          : "text-red-500 hover:bg-red-50"
                      }`}
                      title={
                        tenant.status === "active"
                          ? "Bloquear acesso"
                          : "Liberar acesso"
                      }
                    >
                      {togglingId === tenant.id ? (
                        <Loader2 size={22} className="animate-spin" />
                      ) : tenant.status === "active" ? (
                        <ToggleRight size={22} />
                      ) : (
                        <ToggleLeft size={22} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <AdminLogin />;
  }

  return <AdminPanel />;
}
