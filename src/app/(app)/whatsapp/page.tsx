"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Smartphone,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Send,
  Wifi,
  WifiOff,
  AlertTriangle,
} from "lucide-react";

type Status = "loading" | "connected" | "qr" | "expired" | "connecting" | "error";

export default function WhatsAppPage() {
  const [status, setStatus] = useState<Status>("loading");
  const [qrBase64, setQrBase64] = useState<string | null>(null);
  const [testPhone, setTestPhone] = useState("");
  const [sending, setSending] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);
  const [resetting, setResetting] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/qr-connect", { cache: "no-store" });
      const data = await res.json();

      if (data.status === "connected") {
        setStatus("connected");
        setQrBase64(null);
        // Stop polling when connected
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (data.status === "qr" && data.base64) {
        setStatus("qr");
        setQrBase64(data.base64);
      } else if (data.status === "expired") {
        setStatus("expired");
        setQrBase64(null);
      } else if (data.status === "connecting") {
        setStatus("connecting");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    checkStatus();
    // Poll every 5 seconds when not connected
    intervalRef.current = setInterval(checkStatus, 5000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [checkStatus]);

  async function handleReset() {
    setResetting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/qr-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      });
      const data = await res.json();
      if (data.base64) {
        setStatus("qr");
        setQrBase64(data.base64);
      } else {
        setStatus("connecting");
      }
      // Restart polling
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(checkStatus, 5000);
    } catch {
      setStatus("error");
    } finally {
      setResetting(false);
    }
  }

  async function handleTest() {
    if (!testPhone.trim()) return;
    setSending(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/qr-connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test", phone: testPhone.replace(/\D/g, "") }),
      });
      const data = await res.json();
      setTestResult(data.status === "sent" ? "success" : "error");
    } catch {
      setTestResult("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">WhatsApp</h1>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
              status === "connected"
                ? "bg-success-100 text-success-700"
                : "bg-warning-100 text-warning-700"
            }`}
          >
            {status === "connected" ? "Conectado" : "Desconectado"}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-0.5">
          Conecte seu WhatsApp para enviar notificações automáticas
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 transition-colors">
        {status === "loading" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Verificando conexão...</p>
          </div>
        )}

        {status === "connected" && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-success-50 dark:bg-success-900/30 rounded-full flex items-center justify-center mb-4">
              <Wifi className="w-8 h-8 text-success-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
              WhatsApp Conectado!
            </h2>
            <p className="text-sm text-gray-400 text-center max-w-sm">
              As notificações de agendamento, confirmação e lembrete serão enviadas automaticamente.
            </p>

            {/* Test message */}
            <div className="mt-6 w-full max-w-sm">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                Enviar mensagem de teste
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                  placeholder="11940657878"
                  className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={handleTest}
                  disabled={sending || !testPhone.trim()}
                  className="px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Testar
                </button>
              </div>
              {testResult === "success" && (
                <p className="text-xs text-success-600 mt-2 flex items-center gap-1">
                  <CheckCircle2 size={12} /> Mensagem enviada!
                </p>
              )}
              {testResult === "error" && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> Erro ao enviar. Verifique o número.
                </p>
              )}
            </div>

            {/* Reconnect button */}
            <button
              onClick={handleReset}
              disabled={resetting}
              className="mt-4 px-4 py-2 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={12} />
              Reconectar com outro número
            </button>
          </div>
        )}

        {status === "qr" && qrBase64 && (
          <div className="flex flex-col items-center py-4">
            <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mb-4">
              <Smartphone className="w-6 h-6 text-primary-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
              Escaneie o QR Code
            </h2>
            <p className="text-sm text-gray-400 text-center max-w-sm mb-4">
              Abra o WhatsApp Business &gt; <strong>Aparelhos conectados</strong> &gt;{" "}
              <strong>Conectar um aparelho</strong>
            </p>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrBase64} alt="QR Code WhatsApp" className="w-64 h-64" />
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Loader2 size={14} className="text-primary-500 animate-spin" />
              <p className="text-xs text-gray-400">Aguardando leitura... atualiza automaticamente</p>
            </div>
          </div>
        )}

        {(status === "expired" || status === "connecting") && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 bg-warning-50 dark:bg-warning-900/30 rounded-full flex items-center justify-center mb-4">
              <WifiOff className="w-8 h-8 text-warning-500" />
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">
              {status === "expired" ? "QR Code expirado" : "Aguardando conexão"}
            </h2>
            <p className="text-sm text-gray-400 text-center max-w-sm mb-4">
              {status === "expired"
                ? "O QR code expirou. Clique abaixo para gerar um novo."
                : "A conexão está sendo estabelecida. Se não conectar, gere um novo QR code."}
            </p>
            <button
              onClick={handleReset}
              disabled={resetting}
              className="px-6 py-3 bg-primary-500 text-white rounded-2xl text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {resetting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Gerar novo QR Code
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-8">
            <AlertTriangle className="w-8 h-8 text-gray-400 mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Erro ao verificar conexão.
            </p>
            <button
              onClick={checkStatus}
              className="px-4 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-2xl transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-soft dark:shadow-none border border-gray-100 dark:border-gray-700 p-6 transition-colors">
        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
          O que a BabIA envia automaticamente?
        </h3>
        <div className="space-y-2.5">
          {[
            { label: "Confirmação", desc: "Quando um cliente agenda pelo link público" },
            { label: "Notificação", desc: "O profissional recebe aviso de novo agendamento" },
            { label: "Lembrete 24h", desc: "Lembrete um dia antes do horário" },
            { label: "Lembrete 4h", desc: "Lembrete 4 horas antes do horário" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3">
              <CheckCircle2 size={16} className="text-success-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
