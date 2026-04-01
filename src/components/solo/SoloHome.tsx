"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  Copy,
  Check,
  ExternalLink,
  Scissors,
  Settings,
  LogOut,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { BabiaAvatar } from "@/components/shared/BabiaAvatar";

interface TenantData {
  name: string;
  slug: string;
  logoUrl: string | null;
  stats: {
    totalServices: number;
  };
}

export function SoloHome() {
  const [data, setData] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/tenant")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function copyLink() {
    if (!data) return;
    const url = `${window.location.origin}/agendar/${data.slug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-sm text-gray-400">
        Erro ao carregar dados.
      </div>
    );
  }

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/agendar/${data.slug}`;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Avatar */}
        <div className="flex justify-center">
          <BabiaAvatar size="lg" />
        </div>

        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Tudo certo, {data.name}!
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            A Babia cuida do resto.
          </p>
        </div>

        {/* Booking link card */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft">
          <p className="text-xs text-gray-400 mb-1">Sua página está no ar!</p>
          <p className="text-sm font-medium text-primary-600 truncate mb-4">
            {bookingUrl}
          </p>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-3 bg-primary-500 text-white text-sm font-medium rounded-2xl hover:bg-primary-600 transition-colors"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copiar link
                </>
              )}
            </button>
            <a
              href={bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-3 py-3 border border-gray-100 rounded-2xl text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Stats */}
        <p className="text-sm text-gray-400">
          {data.stats.totalServices} serviço{data.stats.totalServices !== 1 ? "s" : ""} cadastrado{data.stats.totalServices !== 1 ? "s" : ""}
        </p>

        {/* Action links */}
        <div className="space-y-2">
          <Link
            href="/servicos"
            className="flex items-center justify-between w-full px-5 py-3.5 bg-white rounded-3xl border border-gray-100 text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-soft"
          >
            <span className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
                <Scissors size={14} className="text-primary-500" />
              </div>
              Editar serviços
            </span>
            <ChevronRight size={14} className="text-gray-300" />
          </Link>

          <Link
            href="/configuracoes"
            className="flex items-center justify-between w-full px-5 py-3.5 bg-white rounded-3xl border border-gray-100 text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-soft"
          >
            <span className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
                <Settings size={14} className="text-primary-500" />
              </div>
              Editar dados e logo
            </span>
            <ChevronRight size={14} className="text-gray-300" />
          </Link>
        </div>

        {/* Full panel CTA */}
        <Link
          href="/agenda"
          className="block w-full px-5 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-3xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm"
        >
          Acessar painel completo
        </Link>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center justify-center gap-1.5 mx-auto text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </div>
  );
}
