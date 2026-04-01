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
    <div className="flex items-start justify-between p-3 rounded-lg border border-gray-200 bg-white">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
          <User className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-800">{name}</p>
            {isOwner && (
              <span className="text-xs bg-secondary-100 text-secondary-700 px-1.5 py-0.5 rounded">
                Você
              </span>
            )}
          </div>
          {phone && (
            <p className="text-xs text-gray-500 mt-0.5">{phone}</p>
          )}
          {serviceNames.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {serviceNames.map((s) => (
                <span
                  key={s}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
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
          className="p-1 text-gray-400 hover:text-error-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
