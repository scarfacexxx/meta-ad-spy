"use client";

import { useState } from "react";

interface Props {
  onSearch: (params: {
    q: string;
    country: string;
    active: boolean;
    page_id: string;
  }) => void;
  loading: boolean;
}

const COUNTRIES = [
  { code: "BR", label: "Brasil" },
  { code: "US", label: "Estados Unidos" },
  { code: "PT", label: "Portugal" },
  { code: "AR", label: "Argentina" },
  { code: "MX", label: "México" },
];

export default function SearchForm({ onSearch, loading }: Props) {
  const [q, setQ] = useState("");
  const [pageId, setPageId] = useState("");
  const [country, setCountry] = useState("BR");
  const [active, setActive] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch({ q, country, active, page_id: pageId });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
    >
      {/* Busca */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            Nome da Página / Palavra-chave
          </label>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ex: Nike, academia, suplementos..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            ID da Página (opcional, mais preciso)
          </label>
          <input
            type="text"
            value={pageId}
            onChange={(e) => setPageId(e.target.value)}
            placeholder="Ex: 123456789"
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1">
            País
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 cursor-pointer mt-4">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="w-4 h-4 rounded accent-blue-500"
          />
          <span className="text-sm text-gray-300">Somente ads ativos</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || (!q && !pageId)}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
      >
        {loading ? "Buscando..." : "Buscar Ads"}
      </button>
    </form>
  );
}
