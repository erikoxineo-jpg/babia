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

export function ServiceCard({ service, onToggle, onRemove, onChange }: ServiceCardProps) {
  const [editing, setEditing] = useState(false);

  if (service.isTemplate) {
    return (
      <div
        className={`
          rounded-lg border transition-colors
          ${service.selected
            ? "bg-primary-50 border-primary-300"
            : "bg-white border-gray-200 hover:border-gray-300"
          }
        `}
      >
        <div
          onClick={onToggle}
          className="flex items-center justify-between p-3 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={service.selected ?? false}
              onChange={onToggle}
              className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
              onClick={(e) => e.stopPropagation()}
            />
            <div>
              <p className="text-sm font-medium text-gray-800">{service.name}</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" /> {service.durationMinutes}min
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <DollarSign className="w-3 h-3" /> R$ {service.price.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {service.category}
            </span>
            {service.selected && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(!editing);
                }}
                className="p-1 text-gray-400 hover:text-primary-500 transition-colors"
                title="Editar"
              >
                {editing ? <Check className="w-4 h-4" /> : <Pencil className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>

        {editing && service.selected && (
          <div
            className="flex flex-col sm:flex-row gap-2 px-3 pb-3 pt-1 border-t border-primary-200"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="text"
              value={service.name}
              onChange={(e) => onChange?.({ ...service, name: e.target.value })}
              placeholder="Nome"
              className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-16 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
    <div className="flex flex-col sm:flex-row gap-2 p-3 rounded-lg border border-gray-200 bg-white">
      <input
        type="text"
        value={service.name}
        onChange={(e) => onChange?.({ ...service, name: e.target.value })}
        placeholder="Nome do serviço"
        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="w-16 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
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
            className="w-20 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            min={0}
            step={5}
          />
        </div>
        <input
          type="text"
          value={service.category}
          onChange={(e) => onChange?.({ ...service, category: e.target.value })}
          placeholder="Categoria"
          className="w-24 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-gray-400 hover:text-error-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
