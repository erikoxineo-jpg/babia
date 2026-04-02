"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bab<span className="text-primary-500">IA</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">
          Sua secretária de cuidados pessoais
        </p>
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
          <label htmlFor="email" className="block text-xs text-gray-500 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
            placeholder="seu@email.com"
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
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
            placeholder="••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary-500 text-white py-3.5 px-4 rounded-2xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <div className="text-center">
          <Link
            href="/esqueci-senha"
            className="text-xs text-gray-400 hover:text-primary-500 transition-colors"
          >
            Esqueci minha senha
          </Link>
        </div>
      </form>

      <p className="text-center text-sm text-gray-400 mt-5">
        Não tem conta?{" "}
        <Link href="/cadastro" className="text-primary-500 hover:text-primary-600 font-medium">
          Criar conta
        </Link>
      </p>
    </div>
  );
}
