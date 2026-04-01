"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

const inputClass = "w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white";

export default function CadastroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    barbershopName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao criar conta.");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Conta criada, mas erro ao fazer login. Tente na página de login.");
        setLoading(false);
        return;
      }

      router.push("/onboarding/barbearia");
    } catch {
      setError("Erro de conexão. Tente novamente.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bab<span className="text-primary-500">IA</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Crie sua conta e comece agora</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 space-y-4"
      >
        {error && (
          <div className="bg-gray-100 border border-gray-200 text-gray-600 text-sm px-4 py-2.5 rounded-2xl">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="barbershopName" className="block text-xs text-gray-500 mb-1.5">
            Nome do estabelecimento
          </label>
          <input
            id="barbershopName"
            type="text"
            required
            value={form.barbershopName}
            onChange={(e) => update("barbershopName", e.target.value)}
            className={inputClass}
            placeholder="Ex: Studio Maria, Barbearia do João"
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-xs text-gray-500 mb-1.5">
            Seu nome
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
            placeholder="João Silva"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs text-gray-500 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
            placeholder="seu@email.com"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-xs text-gray-500 mb-1.5">
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs text-gray-500 mb-1.5">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className={inputClass}
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 text-white py-3.5 px-4 rounded-2xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Criando conta..." : "Criar conta"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-5">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary-500 hover:text-primary-600 font-medium">
          Fazer login
        </Link>
      </p>
    </div>
  );
}
