"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\D/g, "") }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao enviar código.");
        setLoading(false);
        return;
      }

      setSent(true);
      // Redirecionar para página de redefinição após 2s
      setTimeout(() => {
        router.push(`/redefinir-senha?phone=${encodeURIComponent(phone.replace(/\D/g, ""))}`);
      }, 2000);
    } catch {
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">
          Bab<span className="text-primary-500">IA</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Recuperar senha</p>
      </div>

      {sent ? (
        <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 text-center space-y-3">
          <p className="text-sm text-gray-600">
            Se o telefone estiver cadastrado, você receberá um código de 6 dígitos via WhatsApp.
          </p>
          <p className="text-xs text-gray-400">Redirecionando...</p>
        </div>
      ) : (
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
            Informe o telefone cadastrado e enviaremos um código via WhatsApp.
          </p>

          <div>
            <label htmlFor="phone" className="block text-xs text-gray-500 mb-1.5">
              Telefone / WhatsApp
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

          <button
            type="submit"
            disabled={loading || phone.replace(/\D/g, "").length < 10}
            className="w-full bg-primary-500 text-white py-3.5 px-4 rounded-2xl text-sm font-semibold hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {loading ? "Enviando..." : "Enviar código"}
          </button>
        </form>
      )}

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
