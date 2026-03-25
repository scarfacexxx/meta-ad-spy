"use client";

import { useState, useEffect } from "react";
import { parseSearchInput } from "@/lib/parseInput";

interface Props {
  onSearch: (params: {
    q: string;
    country: string;
    active: boolean;
    page_id: string;
  }) => void;
  loading: boolean;
  prefill?: { q?: string; page_id?: string } | null;
}

const COUNTRIES = [
  { code: "BR", label: "🇧🇷 Brasil" },
  { code: "US", label: "🇺🇸 EUA" },
  { code: "PT", label: "🇵🇹 Portugal" },
  { code: "AR", label: "🇦🇷 Argentina" },
  { code: "MX", label: "🇲🇽 México" },
  { code: "GB", label: "🇬🇧 Reino Unido" },
  { code: "DE", label: "🇩🇪 Alemanha" },
  { code: "ES", label: "🇪🇸 Espanha" },
  { code: "FR", label: "🇫🇷 França" },
  { code: "IT", label: "🇮🇹 Itália" },
  { code: "ALL", label: "🌎 Todos" },
];

export default function SearchForm({ onSearch, loading, prefill }: Props) {
  const [input, setInput] = useState("");
  const [country, setCountry] = useState("BR");
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (prefill) {
      setInput(prefill.page_id ?? prefill.q ?? "");
    }
  }, [prefill]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = parseSearchInput(input);
    onSearch({
      q: parsed.type === "keyword" ? parsed.value : "",
      country,
      active,
      page_id: parsed.type === "page_id" ? parsed.value : "",
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
    >
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Buscar por nome, ID, URL do Facebook ou URL da Ad Library
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ex: Nike, 123456789, facebook.com/nike, ou URL da Ad Library..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
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

        <label className="flex items-center gap-2 cursor-pointer">
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
        disabled={loading || !input.trim()}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
      >
        {loading ? "Buscando..." : "Buscar Ads"}
      </button>
    </form>
  );
}
