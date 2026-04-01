"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2, Check, Scissors } from "lucide-react";

interface LogoUploadProps {
  logoUrl: string | null;
  onUploadComplete: (url: string) => void;
  onRemove: () => void;
}

export function LogoUpload({ logoUrl, onUploadComplete, onRemove }: LogoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function showSuccess() {
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Formato inválido. Use JPG, PNG ou WebP.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 2 MB.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/tenant/logo", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (res.ok && json.success) {
        onUploadComplete(json.data.logoUrl);
        showSuccess();
      } else {
        setError(json.error || "Erro ao fazer upload.");
      }
    } catch {
      setError("Erro ao fazer upload.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleRemove() {
    setError(null);
    setUploading(true);
    try {
      const res = await fetch("/api/tenant/logo", { method: "DELETE" });
      if (res.ok) {
        onRemove();
        showSuccess();
      }
    } catch {
      setError("Erro ao remover logo.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shrink-0 overflow-hidden shadow-lg shadow-primary-500/20">
          {uploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : logoUrl ? (
            <img
              src={logoUrl}
              alt="Logo"
              className="w-full h-full object-cover"
            />
          ) : (
            <Scissors className="w-6 h-6 text-white" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {success ? (
                <Check size={12} />
              ) : (
                <Camera size={12} />
              )}
              {success
                ? "Salvo!"
                : logoUrl
                  ? "Alterar foto"
                  : "Enviar foto"}
            </button>

            {logoUrl && !uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 text-gray-500 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Trash2 size={12} />
                Remover
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400">
            JPG, PNG ou WebP. Máx 2 MB.
          </p>

          {error && (
            <p className="text-xs text-gray-500">{error}</p>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleUpload}
        className="hidden"
      />
    </div>
  );
}
