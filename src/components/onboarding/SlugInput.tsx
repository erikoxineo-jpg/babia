"use client";

import { useState, useEffect, useRef } from "react";
import { Check, X, Loader2 } from "lucide-react";

interface SlugInputProps {
  value: string;
  onChange: (slug: string) => void;
  currentTenantSlug?: string;
}

export function SlugInput({ value, onChange, currentTenantSlug }: SlugInputProps) {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!value || value.length < 3) {
      setStatus("idle");
      return;
    }

    if (value === currentTenantSlug) {
      setStatus("available");
      return;
    }

    setStatus("checking");

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/slug/check?slug=${encodeURIComponent(value)}`);
        const data = await res.json();
        setStatus(data.available ? "available" : "taken");
      } catch {
        setStatus("idle");
      }
    }, 500);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [value, currentTenantSlug]);

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Link de agendamento
      </label>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500 shrink-0">babia.com.br/</span>
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            className={`
              w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2
              ${status === "taken"
                ? "border-error-300 focus:ring-error-500 focus:border-error-500"
                : status === "available"
                  ? "border-success-300 focus:ring-success-500 focus:border-success-500"
                  : "border-gray-300 focus:ring-primary-500 focus:border-primary-500"
              }
            `}
            placeholder="minha-barbearia"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {status === "checking" && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
            {status === "available" && <Check className="w-4 h-4 text-success-500" />}
            {status === "taken" && <X className="w-4 h-4 text-error-500" />}
          </div>
        </div>
      </div>
      {status === "taken" && (
        <p className="text-xs text-error-600 mt-1">Este link já está em uso.</p>
      )}
    </div>
  );
}
