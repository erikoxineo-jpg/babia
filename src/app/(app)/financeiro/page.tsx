"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  Loader2,
  CreditCard,
  Banknote,
  Smartphone,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Scissors,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface SummaryData {
  revenue: number;
  completedCount: number;
  averageTicket: number;
  comparisonRevenue: number;
  paymentMethods: { method: string; total: number; count: number }[];
  dailyRevenue: { date: string; total: number }[];
  topServices: { name: string; revenue: number; count: number }[];
}

interface TransactionItem {
  id: string;
  type: string;
  amount: number;
  paymentMethod: string;
  date: string;
  createdAt: string;
  client: { id: string; name: string };
  serviceName: string | null;
  professionalName: string | null;
}

interface TransactionMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

const PERIODS = [
  { key: "today", label: "Hoje" },
  { key: "week", label: "Semana" },
  { key: "month", label: "Mês" },
] as const;

type Period = (typeof PERIODS)[number]["key"];

const PERIOD_COMPARISON: Record<Period, string> = {
  today: "ontem",
  week: "semana anterior",
  month: "mês anterior",
};

const PAYMENT_LABELS: Record<string, string> = {
  pix: "Pix",
  cash: "Dinheiro",
  credit_card: "Crédito",
  debit_card: "Débito",
  plan_session: "Pacote",
  not_registered: "Não registrado",
};

const PAYMENT_ICONS: Record<string, typeof DollarSign> = {
  pix: Smartphone,
  cash: Banknote,
  credit_card: CreditCard,
  debit_card: CreditCard,
  plan_session: Wallet,
  not_registered: Receipt,
};

const PAYMENT_COLORS: Record<string, string> = {
  pix: "bg-primary-500",
  cash: "bg-success-500",
  credit_card: "bg-primary-500",
  debit_card: "bg-primary-400",
  plan_session: "bg-primary-500",
  not_registered: "bg-gray-300",
};

const PAYMENT_DOT_COLORS: Record<string, string> = {
  pix: "bg-primary-500",
  cash: "bg-success-500",
  credit_card: "bg-primary-500",
  debit_card: "bg-primary-400",
  plan_session: "bg-primary-500",
  not_registered: "bg-gray-300",
};

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FinanceiroPage() {
  const [period, setPeriod] = useState<Period>("month");
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [txMeta, setTxMeta] = useState<TransactionMeta | null>(null);
  const [txPage, setTxPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(false);
  const [error, setError] = useState(false);

  const loadSummary = useCallback(async (p: Period) => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/financial/summary?period=${p}`);
      const json = await res.json();
      if (json.success) setSummary(json.data);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTransactions = useCallback(async (p: Period, page: number) => {
    setTxLoading(true);
    try {
      const res = await fetch(`/api/financial/transactions?period=${p}&page=${page}`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
        setTxMeta(json.meta);
      }
    } catch {
      // silent
    } finally {
      setTxLoading(false);
    }
  }, []);

  useEffect(() => {
    setTxPage(1);
    loadSummary(period);
    loadTransactions(period, 1);
  }, [period, loadSummary, loadTransactions]);

  useEffect(() => {
    if (txPage > 1) loadTransactions(period, txPage);
  }, [txPage, period, loadTransactions]);

  const growthPct =
    summary && summary.comparisonRevenue > 0
      ? ((summary.revenue - summary.comparisonRevenue) / summary.comparisonRevenue) * 100
      : null;

  const maxMethodTotal =
    summary && summary.paymentMethods.length > 0
      ? Math.max(...summary.paymentMethods.map((m) => m.total))
      : 0;

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="text-center py-20">
        <DollarSign className="w-6 h-6 text-gray-300 mx-auto mb-3" />
        <p className="text-sm text-gray-500">Erro ao carregar dados financeiros.</p>
        <button onClick={() => loadSummary(period)} className="mt-3 px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-2xl transition-colors">
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 dark:text-gray-100">Financeiro</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Acompanhe a receita do seu negócio
        </p>
      </div>

      {/* Period selector — pills */}
      <div className="inline-flex bg-gray-100 dark:bg-gray-800 rounded-full p-1 gap-1">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              period === p.key
                ? "bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {summary && (
        <>
          {/* Hero revenue card */}
          <div className="bg-gray-900 rounded-3xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Receita total</p>
                <p className="text-3xl font-bold mt-1 tracking-tight">
                  {formatCurrency(summary.revenue)}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  {growthPct !== null ? (
                    <>
                      <span
                        className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                          growthPct >= 0
                            ? "bg-white/20 text-white"
                            : "bg-white/20 text-white"
                        }`}
                      >
                        {growthPct >= 0 ? (
                          <ArrowUpRight size={12} />
                        ) : (
                          <ArrowDownRight size={12} />
                        )}
                        {growthPct >= 0 ? "+" : ""}
                        {growthPct.toFixed(1)}%
                      </span>
                      <span className="text-xs text-gray-400">
                        vs {PERIOD_COMPARISON[period]}
                      </span>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">
                      Sem dados do período anterior
                    </span>
                  )}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                <DollarSign size={28} className="text-white/80" />
              </div>
            </div>
          </div>

          {/* KPI Cards row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Atendimentos */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-primary-50 rounded-xl flex items-center justify-center">
                  <BarChart3 size={16} className="text-primary-500" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {summary.completedCount}
              </p>
              <p className="text-xs text-gray-400 mt-1">Atendimentos</p>
            </div>

            {/* Ticket médio */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-success-50 rounded-xl flex items-center justify-center">
                  <Receipt size={16} className="text-success-600" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {formatCurrency(summary.averageTicket)}
              </p>
              <p className="text-xs text-gray-400 mt-1">Ticket médio</p>
            </div>

            {/* Crescimento */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    growthPct !== null && growthPct >= 0 ? "bg-primary-50" : "bg-gray-100"
                  }`}
                >
                  {growthPct !== null && growthPct >= 0 ? (
                    <TrendingUp size={16} className="text-success-600" />
                  ) : (
                    <TrendingDown size={16} className="text-gray-600" />
                  )}
                </div>
              </div>
              <p
                className={`text-2xl font-bold ${
                  growthPct !== null && growthPct >= 0
                    ? "text-success-600"
                    : "text-gray-600"
                }`}
              >
                {growthPct !== null
                  ? `${growthPct >= 0 ? "+" : ""}${growthPct.toFixed(1)}%`
                  : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Crescimento</p>
            </div>
          </div>

          {/* Payment methods + Top services */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Payment methods */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 transition-colors">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">
                Formas de pagamento
              </h2>
              {summary.paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {summary.paymentMethods.map((pm) => {
                    const Icon = PAYMENT_ICONS[pm.method] || Receipt;
                    const barWidth =
                      maxMethodTotal > 0
                        ? Math.max((pm.total / maxMethodTotal) * 100, 6)
                        : 0;
                    const pct =
                      summary.revenue > 0
                        ? ((pm.total / summary.revenue) * 100).toFixed(0)
                        : "0";
                    return (
                      <div key={pm.method} className="group">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                              <Icon size={16} className="text-gray-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                {PAYMENT_LABELS[pm.method] || pm.method}
                              </p>
                              <p className="text-xs text-gray-400">
                                {pm.count} transaç{pm.count !== 1 ? "ões" : "ão"} ({pct}%)
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                            {formatCurrency(pm.total)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 ml-12" style={{ width: "calc(100% - 48px)" }}>
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              PAYMENT_COLORS[pm.method] || "bg-gray-300"
                            }`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">
                  Nenhum registro no período
                </p>
              )}
            </div>

            {/* Top services */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 transition-colors">
              <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-5">
                Top serviços
              </h2>
              {summary.topServices.length > 0 ? (
                <div className="space-y-1">
                  {summary.topServices.map((svc, i) => (
                    <div
                      key={svc.name}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                            i === 0
                              ? "bg-primary-50 text-primary-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {svc.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {svc.count} atendimento{svc.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-gray-800 dark:text-gray-200">
                        {formatCurrency(svc.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-6">
                  Nenhum serviço concluído no período
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Transactions list */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">
            Últimas transações
          </h2>
          {txMeta && txMeta.total > 0 && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
              {txMeta.total}
            </span>
          )}
        </div>

        {txLoading && transactions.length === 0 ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
          </div>
        ) : transactions.length > 0 ? (
          <>
            <div className="space-y-1">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        tx.type === "service"
                          ? "bg-primary-50"
                          : "bg-gray-50"
                      }`}
                    >
                      {tx.type === "service" ? (
                        <Scissors size={18} className="text-primary-500" />
                      ) : (
                        <Receipt size={18} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                        {tx.client.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {tx.serviceName || "Transação manual"}
                        {tx.professionalName && (
                          <span className="text-gray-300"> &middot; {tx.professionalName}</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-success-600">
                      +{formatCurrency(tx.amount)}
                    </p>
                    <div className="flex items-center justify-end gap-1.5 mt-0.5">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          PAYMENT_DOT_COLORS[tx.paymentMethod] || "bg-gray-300"
                        }`}
                      />
                      <span className="text-xs text-gray-400">
                        {PAYMENT_LABELS[tx.paymentMethod] || tx.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {txMeta && txMeta.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                  disabled={txPage <= 1}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} className="text-gray-600" />
                </button>
                <span className="text-sm text-gray-500 min-w-[60px] text-center">
                  {txMeta.page} de {txMeta.totalPages}
                </span>
                <button
                  onClick={() =>
                    setTxPage((p) => Math.min(txMeta.totalPages, p + 1))
                  }
                  disabled={txPage >= txMeta.totalPages}
                  className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} className="text-gray-600" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-3xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <Receipt size={24} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-500">
              Nenhuma transação no período
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Transações são criadas ao concluir agendamentos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
