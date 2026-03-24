"use client";

import { useState, useEffect, useCallback } from "react";

interface SavedSearch {
  id: number;
  name: string;
  page_id: string | null;
  type: string;
}

interface Props {
  onSelect: (search: SavedSearch) => void;
}

export default function SavedSearches({ onSelect }: Props) {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [pageId, setPageId] = useState("");
  const [type, setType] = useState<"page" | "keyword">("page");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/saved");
      const data = await res.json();
      setSearches(data.searches ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleAdd() {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, page_id: pageId || null, type }),
      });
      setName("");
      setPageId("");
      setShowAdd(false);
      load();
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove(id: number) {
    try {
      await fetch(`/api/saved/${id}`, { method: "DELETE" });
      setSearches((prev) => prev.filter((s) => s.id !== id));
    } catch {
      /* ignore */
    }
  }

  if (searches.length === 0 && !showAdd) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Nenhuma página monitorada.</span>
        <button
          onClick={() => setShowAdd(true)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          + Adicionar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium text-gray-300">Monitorando</h3>
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
        >
          +
        </button>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2">
        {searches.map((s) => (
          <div
            key={s.id}
            className="group flex items-center gap-1 bg-gray-800 border border-gray-700 rounded-full px-3 py-1.5 cursor-pointer hover:border-blue-500 transition-colors"
          >
            <button
              onClick={() => onSelect(s)}
              className="text-sm text-gray-200 hover:text-white"
            >
              {s.name}
            </button>
            {s.page_id && (
              <span className="text-xs text-gray-600">#{s.page_id}</span>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(s.id);
              }}
              className="ml-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs"
            >
              x
            </button>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => setType("page")}
              className={`text-xs px-3 py-1 rounded-full ${
                type === "page"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              Página
            </button>
            <button
              onClick={() => setType("keyword")}
              className={`text-xs px-3 py-1 rounded-full ${
                type === "keyword"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              Palavra-chave
            </button>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={
              type === "page"
                ? "Nome da página (ex: Nike Brasil)"
                : "Palavra-chave (ex: suplementos)"
            }
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
          />
          {type === "page" && (
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="ID da página ou URL (opcional, mais preciso)"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
            />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleAdd}
              disabled={saving || !name.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 text-white text-sm font-medium rounded-lg px-4 py-2"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="bg-gray-800 text-gray-400 text-sm rounded-lg px-4 py-2 hover:text-white"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
