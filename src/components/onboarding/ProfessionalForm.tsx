"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

interface ProfessionalFormProps {
  services: { id: string; name: string }[];
  onAdd: (data: { name: string; phone: string; serviceIds: string[] }) => void;
}

export function ProfessionalForm({ services, onAdd }: ProfessionalFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      phone: phone.trim(),
      serviceIds: selectedServices,
    });

    setName("");
    setPhone("");
    setSelectedServices([]);
  }

  function toggleService(id: string) {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 rounded-lg border border-dashed border-gray-300 bg-gray-50 space-y-3"
    >
      <p className="text-sm font-medium text-gray-700">Adicionar profissional</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Telefone (opcional)"
          className="sm:w-40 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {services.length > 0 && (
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Serviços que realiza:</p>
          <div className="flex flex-wrap gap-1.5">
            {services.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleService(s.id)}
                className={`
                  px-2.5 py-1 rounded-full text-xs font-medium transition-colors
                  ${selectedServices.includes(s.id)
                    ? "bg-primary-500 text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }
                `}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!name.trim()}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white rounded-md text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Adicionar
      </button>
    </form>
  );
}
