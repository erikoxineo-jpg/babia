"use client";

import { Trash2, User } from "lucide-react";

interface ProfessionalCardProps {
  name: string;
  phone?: string;
  serviceNames: string[];
  isOwner?: boolean;
  onRemove?: () => void;
}

export function ProfessionalCard({
  name,
  phone,
  serviceNames,
  isOwner,
  onRemove,
}: ProfessionalCardProps) {
  return (
    <div className="flex items-start justify-between p-4 rounded-2xl border-2 border-gray-100 bg-white">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-secondary-500 text-white flex items-center justify-center shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-800">{name}</p>
            {isOwner && (
              <span className="text-[10px] bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full font-medium">
                Voce
              </span>
            )}
          </div>
          {phone && (
            <p className="text-xs text-gray-400 mt-0.5">{phone}</p>
          )}
          {serviceNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {serviceNames.map((s) => (
                <span
                  key={s}
                  className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {!isOwner && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-secondary-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
