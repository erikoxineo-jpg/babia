"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phoneFromQuery = searchParams.get("phone") || "";

  const [phone, setPhone] = useState(phoneFromQuery);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    if (newPassword.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.replace(/\D/g, ""),
          code: code.trim(),
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao redefinir senha.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 text-center space-y-4">
          <CheckCircle size={48} className="text-green-500 mx-auto" />
          <h2 className="text-lg font-semibold text-gray-800">Senha redefinida!</h2>
          <p className="text-sm text-gray-500">
            Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bab<span className="text-primary-500">IA</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Redefinir senha</p>
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

        <p className="text-sm text-gray-500">
          Insira o código recebido via WhatsApp e sua nova senha.
        </p>

        {!phoneFromQuery && (
          <div>
            <label htmlFor="phone" className="block text-xs text-gray-500 mb-1.5">
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
              placeholder="(11) 99999-9999"
            />
          </div>
        )}

        <div>
          <label htmlFor="code" className="block text-xs text-gray-500 mb-1.5">
            Código de 6 dígitos
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-center tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
            placeholder="000000"
          />
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-xs text-gray-500 mb-1.5">
            Nova senha
          </label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
            placeholder="••••••"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs text-gray-500 mb-1.5">
            Confirmar senha
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white"
            placeholder="••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading || code.length !== 6 || newPassword.length < 6}
          className="w-full bg-primary-500 text-white py-3.5 px-4 rounded-2xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Redefinindo..." : "Redefinir senha"}
        </button>
      </form>

      <div className="text-center mt-5">
        <Link
          href="/login"
          className="text-sm text-gray-400 hover:text-primary-500 inline-flex items-center gap-1"
        >
          <ArrowLeft size={14} />
          Voltar ao login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm text-center text-sm text-gray-400">Carregando...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
