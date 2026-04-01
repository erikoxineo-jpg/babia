"use client";

import { useState } from "react";
import { Trash2, Clock, DollarSign, Pencil, Check } from "lucide-react";

interface ServiceItem {
  name: string;
  durationMinutes: number;
  price: number;
  category: string;
  isTemplate?: boolean;
  selected?: boolean;
}

interface ServiceCardProps {
  service: ServiceItem;
  onToggle?: () => void;
  onRemove?: () => void;
  onChange?: (service: ServiceItem) => void;
}

const inputClass =
  "px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-secondary-300 focus:border-secondary-300 focus:bg-white transition-colors";

export function ServiceCard({ service, onToggle, onRemove, onChange }: ServiceCardProps) {
  const [editing, setEditing] = useState(false);

  if (service.isTemplate) {
    return (
      <div
        className={`
          rounded-2xl border-2 transition-all
          ${service.selected
            ? "bg-white border-secondary-200 shadow-sm"
            : "bg-white border-gray-100 hover:border-gray-200"
          }
        `}
      >
        <div
          onClick={onToggle}
          className="flex items-center justify-between p-4 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                service.selected
                  ? "bg-secondary-500 border-secondary-500"
                  : "border-gray-300 bg-white"
              }`}
              onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
            >
              {service.selected && <Check className="w-3 h-3 text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{service.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" /> {service.durationMinutes}min
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <DollarSign className="w-3 h-3" /> R$ {service.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-medium">
              {service.category}
            </span>
            {service.selected && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(!editing);
                }}
                className="p-1.5 text-gray-400 hover:text-secondary-500 transition-colors rounded-lg hover:bg-gray-50"
                title="Editar"
              >
                {editing ? <Check className="w-4 h-4" /> : <Pencil className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {editing && service.selected && (
          <div
            className="flex flex-col sm:flex-row gap-2 px-4 pb-4 pt-2 border-t border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={service.name}
              onChange={(e) => onChange?.({ ...service, name: e.target.value })}
              placeholder="Nome"
              className={`flex-1 ${inputClass}`}
            />
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <input
                  type="number"
                  value={service.durationMinutes}
                  onChange={(e) =>
                    onChange?.({ ...service, durationMinutes: parseInt(e.target.value) || 0 })
                  }
                  className={`w-16 ${inputClass}`}
                  min={5}
                  step={5}
                />
                <span className="text-xs text-gray-400">min</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-400">R$</span>
                <input
                  type="number"
                  value={service.price}
                  onChange={(e) =>
                    onChange?.({ ...service, price: parseFloat(e.target.value) || 0 })
                  }
                  className={`w-20 ${inputClass}`}
                  min={0}
                  step={5}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 p-4 rounded-2xl border-2 border-gray-100 bg-white">
      <input
        type="text"
        value={service.name}
        onChange={(e) => onChange?.({ ...service, name: e.target.value })}
        placeholder="Nome do servico"
        className={`flex-1 ${inputClass}`}
      />
      <div className="flex gap-2 items-center">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-gray-400" />
          <input
            type="number"
            value={service.durationMinutes}
            onChange={(e) =>
              onChange?.({ ...service, durationMinutes: parseInt(e.target.value) || 0 })
            }
            className={`w-16 ${inputClass}`}
            min={5}
            step={5}
          />
          <span className="text-xs text-gray-400">min</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400">R$</span>
          <input
            type="number"
            value={service.price}
            onChange={(e) =>
              onChange?.({ ...service, price: parseFloat(e.target.value) || 0 })
            }
            className={`w-20 ${inputClass}`}
            min={0}
            step={5}
          />
        </div>
        <input
          type="text"
          value={service.category}
          onChange={(e) => onChange?.({ ...service, category: e.target.value })}
          placeholder="Categoria"
          className={`w-24 ${inputClass}`}
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-secondary-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
