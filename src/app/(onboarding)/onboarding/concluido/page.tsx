"use client";

import { useEffect, useState } from "react";
import { Stepper } from "@/components/onboarding/Stepper";
import { Check, ExternalLink, Lightbulb } from "lucide-react";

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
        setError("Erro de conexão.");
        setLoading(false);
      });
  }, []);

  function goToDashboard() {
    window.location.href = "/dashboard";
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-gray-400 text-sm">Finalizando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <Stepper currentStep={5} />
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="bg-error-50 border border-error-200 text-error-700 text-sm px-4 py-2 rounded-md">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Stepper currentStep={5} />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-success-600" />
        </div>

        <h2 className="text-xl font-heading font-bold text-gray-800 mb-2">
          Tudo pronto!
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {summary?.tenantName} está configurada e pronta para receber agendamentos.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-primary-600">
              {summary?.servicesCount}
            </p>
            <p className="text-xs text-gray-500">serviços cadastrados</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-2xl font-bold text-primary-600">
              {summary?.professionalsCount}
            </p>
            <p className="text-xs text-gray-500">profissionais</p>
          </div>
        </div>

        <div className="bg-secondary-50 border border-secondary-200 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-2">
            <ExternalLink className="w-4 h-4 text-secondary-600 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-secondary-800">
                Seu link de agendamento
              </p>
              <p className="text-sm text-secondary-600 mt-0.5 break-all">
                {window.location.origin}/agendar/{summary?.slug}
              </p>
              <p className="text-xs text-secondary-500 mt-1">
                Compartilhe com seus clientes para receber agendamentos online.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-gray-500 mt-0.5 shrink-0" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-700">Próximos passos</p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>Cadastre seus primeiros clientes</li>
                <li>Configure notificações por WhatsApp</li>
                <li>Ajuste valores e horários no menu Configurações</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={goToDashboard}
          className="w-full bg-primary-500 text-white py-2.5 px-4 rounded-md text-sm font-semibold hover:bg-primary-600 transition-colors"
        >
          Ir para o Dashboard
        </button>
      </div>
    </div>
  );
}
