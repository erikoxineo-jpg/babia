"use client";

interface Professional {
  id: string;
  name: string;
}

interface ProfessionalFilterProps {
  professionals: Professional[];
  selected: string | null;
  onChange: (id: string | null) => void;
}

export function ProfessionalFilter({
  professionals,
  selected,
  onChange,
}: ProfessionalFilterProps) {
  return (
    <>
      {/* Desktop: chips */}
      <div className="hidden sm:flex items-center gap-2 flex-wrap">
        <button
          onClick={() => onChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            selected === null
              ? "bg-primary-500 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Todos
        </button>
        {professionals.map((p) => (
          <button
            key={p.id}
            onClick={() => onChange(p.id === selected ? null : p.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selected === p.id
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Mobile: select */}
      <div className="sm:hidden">
        <select
          value={selected ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Todos os profissionais</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
