"use client";

import { DollarSign, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function FinanceiroPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
      </div>

      {/* Coming soon */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
          <DollarSign className="w-8 h-8 text-primary-500" />
        </div>

        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Em breve
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
          Módulo financeiro será disponibilizado em breve.
          Controle de receitas, despesas, comissões e relatórios financeiros completos.
        </p>

        <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 max-w-sm mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={14} className="text-primary-500" />
            <span className="text-xs font-medium text-gray-700">
              Enquanto isso...
            </span>
          </div>
          <p className="text-xs text-gray-500">
            Acompanhe seu faturamento e métricas pelo{" "}
            <Link
              href="/"
              className="text-primary-500 font-medium hover:text-primary-600 transition-colors"
            >
              Dashboard
            </Link>
            . Lá você encontra o resumo de receita, agendamentos e indicadores do seu negócio.
          </p>
        </div>
      </div>
    </div>
  );
}
