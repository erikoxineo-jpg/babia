"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Plus, Loader2 } from "lucide-react";

interface ClientResult {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

interface ClientSearchProps {
  value: ClientResult | null;
  onChange: (client: ClientResult | null) => void;
}

export function ClientSearch({ value, onChange }: ClientSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ClientResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSearch(q: string) {
    setQuery(q);
    if (value) onChange(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/clients/search?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setResults(data);
        setShowDropdown(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }

  function selectClient(client: ClientResult) {
    onChange(client);
    setQuery(client.name);
    setShowDropdown(false);
  }

  async function handleCreateClient() {
    if (!newName.trim() || !newPhone.trim()) return;

    setCreating(true);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), phone: newPhone.trim() }),
      });

      if (res.ok) {
        const client = await res.json();
        selectClient(client);
        setShowNewForm(false);
        setNewName("");
        setNewPhone("");
      }
    } catch {
      // silently fail
    } finally {
      setCreating(false);
    }
  }

  if (value) {
    return (
      <div className="flex items-center justify-between p-2 bg-primary-50 border border-primary-200 rounded-md">
        <div>
          <p className="text-sm font-medium text-gray-800">{value.name}</p>
          <p className="text-xs text-gray-500">{value.phone}</p>
        </div>
        <button
          onClick={() => {
            onChange(null);
            setQuery("");
          }}
          className="text-xs text-primary-600 hover:text-primary-800"
        >
          Trocar
        </button>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            onFocus={() => {
              if (results.length > 0) setShowDropdown(true);
            }}
          />
          {loading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
          )}
        </div>
        {!showNewForm && (
          <button
            type="button"
            onClick={() => {
              setShowDropdown(false);
              setShowNewForm(true);
              setNewName(query);
            }}
            className="px-3 py-2 bg-primary-500 text-white text-xs font-medium rounded-md hover:bg-primary-600 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus size={14} />
            Novo
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {results.map((client) => (
            <button
              key={client.id}
              onClick={() => selectClient(client)}
              className="w-full px-3 py-2 text-left hover:bg-gray-50 border-b border-gray-50 last:border-b-0"
            >
              <p className="text-sm font-medium text-gray-800">{client.name}</p>
              <p className="text-xs text-gray-500">{client.phone}</p>
            </button>
          ))}
          {results.length === 0 && !loading && query.trim().length >= 2 && (
            <div className="px-3 py-2 text-xs text-gray-400">
              Nenhum cliente encontrado.
            </div>
          )}
        </div>
      )}

      {showNewForm && (
        <div className="mt-2 p-3 border border-gray-200 rounded-md bg-gray-50 space-y-2">
          <p className="text-xs font-medium text-gray-600">Novo cliente</p>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Nome"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="Telefone"
            className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreateClient}
              disabled={creating || !newName.trim() || !newPhone.trim()}
              className="px-3 py-1.5 text-xs font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 disabled:opacity-50 transition-colors"
            >
              {creating ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
