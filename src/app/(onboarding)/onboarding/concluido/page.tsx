"use client";

import { useEffect, useState } from "react";
import { Stepper } from "@/components/onboarding/Stepper";
import { ExternalLink, Lightbulb, Loader2 } from "lucide-react";

interface Summary {
  tenantName: string;
  slug: string;
  servicesCount: number;
  professionalsCount: number;
}

export default function ConcluidoPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/onboarding/concluir", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setSummary({
            tenantName: data.tenantName,
            slug: data.slug,
            servicesCount: data.servicesCount,
            professionalsCount: data.professionalsCount,
          });
        } else {
          setError(data.error || "Erro ao finalizar.");
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Erro de conexao.");
        setLoading(false);
      });
  }, []);

  function goToDashboard() {
    window.location.href = "/dashboard";
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Stepper currentStep={5} />
        <div className="bg-gray-50 border border-gray-200 text-gray-600 text-sm px-4 py-3 rounded-2xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Stepper currentStep={5} />

      <div className="text-center">
        <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-5 shadow-lg shadow-primary-500/20">
          <img
            src="/Babia Perfil.png"
            alt="BabIA"
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Tudo pronto!
        </h2>
        <p className="text-sm text-gray-400 mb-8">
          {summary?.tenantName} esta configurada e pronta para receber agendamentos.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-3xl font-bold text-primary-600">
              {summary?.servicesCount}
            </p>
            <p className="text-xs text-gray-400 mt-1">servicos</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-5">
            <p className="text-3xl font-bold text-primary-600">
              {summary?.professionalsCount}
            </p>
            <p className="text-xs text-gray-400 mt-1">profissionais</p>
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl p-5 mb-5 text-left">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-white">
                Seu link de agendamento
              </p>
              <p className="text-sm text-gray-400 mt-1 break-all">
                {window.location.origin}/agendar/{summary?.slug}
              </p>
              <p className="text-xs text-gray-500 mt-1.5">
                Compartilhe com seus clientes para receber agendamentos online.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-5 mb-8 text-left">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-4 h-4 text-primary-500 mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-gray-700">Proximos passos</p>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>Cadastre seus primeiros clientes</li>
                <li>Configure notificacoes por WhatsApp</li>
                <li>Ajuste valores e horarios no menu Configuracoes</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={goToDashboard}
          className="w-full bg-primary-500 text-white py-3.5 px-4 rounded-2xl text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          Ir para o Dashboard
        </button>
      </div>
    </div>
  );
}
