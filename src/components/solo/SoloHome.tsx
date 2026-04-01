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
    const url = `${window.location.origin}/b/${data.slug}`;
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

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/b/${data.slug}`;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6 text-center">
        {/* Avatar */}
        <div className="flex justify-center">
          <BabiaAvatar size="lg" />
        </div>

        {/* Greeting */}
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Tudo certo, {data.name}!
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            A Babia cuida do resto.
          </p>
        </div>

        {/* Booking link card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-1">Sua página está no ar!</p>
          <p className="text-sm font-medium text-primary-600 truncate mb-3">
            {bookingUrl}
          </p>
          <div className="flex gap-2">
            <button
              onClick={copyLink}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors"
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
              className="flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Stats */}
        <p className="text-sm text-gray-500">
          {data.stats.totalServices} serviço{data.stats.totalServices !== 1 ? "s" : ""} cadastrado{data.stats.totalServices !== 1 ? "s" : ""}
        </p>

        {/* Action links */}
        <div className="space-y-2">
          <Link
            href="/servicos"
            className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Scissors size={16} className="text-primary-500" />
              Editar serviços
            </span>
            <ChevronRight size={14} className="text-gray-400" />
          </Link>

          <Link
            href="/configuracoes"
            className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <span className="flex items-center gap-2">
              <Settings size={16} className="text-primary-500" />
              Editar dados e logo
            </span>
            <ChevronRight size={14} className="text-gray-400" />
          </Link>
        </div>

        {/* Full panel CTA */}
        <Link
          href="/agenda"
          className="block w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm"
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
