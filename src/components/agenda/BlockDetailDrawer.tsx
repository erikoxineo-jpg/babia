"use client";

import { useState } from "react";
import { Loader2, Ban, Clock, Trash2 } from "lucide-react";
import { Drawer } from "./Drawer";
import type { ScheduleBlockData } from "@/types/agenda";

interface BlockDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  block: (ScheduleBlockData & { professionalName: string }) | null;
  onDeleted: () => void;
}

export function BlockDetailDrawer({
  open,
  onClose,
  block,
  onDeleted,
}: BlockDetailDrawerProps) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (!block) return;

    setDeleting(true);
    setError("");

    try {
      const res = await fetch(`/api/schedule-blocks/${block.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        onDeleted();
        onClose();
        setConfirmDelete(false);
      } else {
        const data = await res.json();
        setError(data.error ?? "Erro ao remover bloqueio.");
      }
    } catch {
      setError("Erro de conexão.");
    } finally {
      setDeleting(false);
    }
  }

  if (!block) return null;

  const isAllDay = block.startTime === "00:00" && block.endTime === "23:59";

  return (
    <Drawer open={open} onClose={() => { onClose(); setConfirmDelete(false); setError(""); }} title="Detalhes do Bloqueio">
      <div className="space-y-4">
        {/* Info */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Ban className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              {block.professionalName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {isAllDay ? "Dia inteiro" : `${block.startTime} - ${block.endTime}`}
            </span>
          </div>

          {block.reason && (
            <div>
              <span className="text-xs text-gray-500">Motivo</span>
              <p className="text-sm text-gray-700">{block.reason}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="p-2 bg-error-50 border border-error-200 rounded-md">
            <p className="text-xs text-error-600">{error}</p>
          </div>
        )}

        {/* Ações */}
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-2.5 bg-error-50 text-error-600 text-sm font-medium rounded-md hover:bg-error-100 transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Remover bloqueio
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 text-center">
              Tem certeza que deseja remover este bloqueio?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-error-500 text-white text-sm font-medium rounded-md hover:bg-error-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Removendo..." : "Confirmar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </Drawer>
  );
}
