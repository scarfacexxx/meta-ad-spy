"use client";

import { useState, useCallback, useEffect } from "react";
import SavedSearches from "@/components/SavedSearches";

type Tab = "library" | "favorites" | "add";

interface SavedAd {
  id: number;
  page_name: string;
  ad_url: string | null;
  body: string | null;
  title: string | null;
  screenshot_url: string | null;
  tags: string;
  notes: string;
  hook_type: string | null;
  ad_type: string | null;
  platforms: string;
  created_at: string;
}

const HOOK_TYPES = [
  "Pergunta",
  "Dor/Problema",
  "Prova Social",
  "Urgência",
  "Curiosidade",
  "Antes/Depois",
  "Estatística",
  "Polêmica",
  "História",
  "Outro",
];

const AD_TYPES = [
  "Imagem",
  "Vídeo",
  "Carrossel",
  "Stories",
  "Reels",
  "Outro",
];

export default function Home() {
  const [tab, setTab] = useState<Tab>("library");
  const [favorites, setFavorites] = useState<SavedAd[]>([]);
  const [filterTag, setFilterTag] = useState<string>("");

  // Add form state
  const [form, setForm] = useState({
    page_name: "",
    ad_url: "",
    body: "",
    title: "",
    tags: "",
    notes: "",
    hook_type: "",
    ad_type: "",
    platforms: [] as string[],
  });
  const [saving, setSaving] = useState(false);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      setFavorites(data.ads ?? []);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  async function handleSaveAd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.page_name.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setForm({
        page_name: "",
        ad_url: "",
        body: "",
        title: "",
        tags: "",
        notes: "",
        hook_type: "",
        ad_type: "",
        platforms: [],
      });
      loadFavorites();
      setTab("favorites");
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveFavorite(id: number) {
    try {
      await fetch(`/api/favorites/${id}`, { method: "DELETE" });
      setFavorites((prev) => prev.filter((f) => f.id !== id));
    } catch {
      /* ignore */
    }
  }

  function handleOpenLibrary(search: { name: string; page_id: string | null }) {
    const baseUrl = "https://www.facebook.com/ads/library/";
    const params = new URLSearchParams({
      active_status: "active",
      ad_type: "all",
      country: "BR",
      media_type: "all",
    });
    if (search.page_id) {
      params.set("view_all_page_id", search.page_id);
    } else {
      params.set("q", search.name);
    }
    window.open(`${baseUrl}?${params.toString()}`, "_blank");
  }

  function togglePlatform(p: string) {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(p)
        ? prev.platforms.filter((x) => x !== p)
        : [...prev.platforms, p],
    }));
  }

  // Get all unique tags from favorites
  const allTags = Array.from(
    new Set(
      favorites
        .flatMap((f) => f.tags.split(",").map((t) => t.trim()))
        .filter(Boolean)
    )
  );

  const filteredFavorites = filterTag
    ? favorites.filter((f) =>
        f.tags
          .split(",")
          .map((t) => t.trim())
          .includes(filterTag)
      )
    : favorites;

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-blue-400">Meta</span> Ad Spy
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Monitore concorrentes e salve os melhores ads como inspiração
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Saved Searches — quick links to Ad Library */}
        <SavedSearches onSelect={handleOpenLibrary} />

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-800">
          <button
            onClick={() => setTab("library")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "library"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Ad Library
          </button>
          <button
            onClick={() => setTab("favorites")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "favorites"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Ads Salvos {favorites.length > 0 && `(${favorites.length})`}
          </button>
          <button
            onClick={() => setTab("add")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "add"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            + Salvar Ad
          </button>
        </div>

        {/* Ad Library tab */}
        {tab === "library" && (
          <div className="space-y-6">
            {/* Quick instructions */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold">🎯 Fluxo rápido</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="text-2xl">1️⃣</div>
                  <p className="text-gray-300 font-medium">Abra a Ad Library</p>
                  <p className="text-gray-500 text-xs">
                    Clique em um concorrente acima ou no botão abaixo
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="text-2xl">2️⃣</div>
                  <p className="text-gray-300 font-medium">Ache os melhores ads</p>
                  <p className="text-gray-500 text-xs">
                    Filtre por ativos e ordene por mais impressões
                  </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="text-2xl">3️⃣</div>
                  <p className="text-gray-300 font-medium">Salve aqui</p>
                  <p className="text-gray-500 text-xs">
                    Clique em &quot;+ Salvar Ad&quot; e cole a copy, URL e suas notas
                  </p>
                </div>
              </div>
            </div>

            {/* Open Ad Library button */}
            <a
              href="https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=BR&media_type=all"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl py-4 text-sm transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
              Abrir Meta Ad Library
            </a>

            {/* Quick save shortcut */}
            <button
              onClick={() => setTab("add")}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium rounded-xl py-3 text-sm transition-colors"
            >
              Achei um ad bom → Salvar agora
            </button>
          </div>
        )}

        {/* Add Ad tab */}
        {tab === "add" && (
          <form
            onSubmit={handleSaveAd}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold">Salvar novo ad</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Nome da Página *
                </label>
                <input
                  type="text"
                  value={form.page_name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, page_name: e.target.value }))
                  }
                  placeholder="Ex: Nike Brasil"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  URL do Ad (Ad Library ou snapshot)
                </label>
                <input
                  type="text"
                  value={form.ad_url}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ad_url: e.target.value }))
                  }
                  placeholder="https://www.facebook.com/ads/library/..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Título / Headline do Ad
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Ex: Transforme seu corpo em 30 dias"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Copy / Texto do Ad
              </label>
              <textarea
                value={form.body}
                onChange={(e) =>
                  setForm((p) => ({ ...p, body: e.target.value }))
                }
                placeholder="Cole a copy completa do ad aqui..."
                rows={4}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Tipo de Hook
                </label>
                <select
                  value={form.hook_type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, hook_type: e.target.value }))
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  {HOOK_TYPES.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  Tipo de Criativo
                </label>
                <select
                  value={form.ad_type}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ad_type: e.target.value }))
                  }
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  {AD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Platforms */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Plataformas
              </label>
              <div className="flex flex-wrap gap-2">
                {["Facebook", "Instagram", "Messenger", "Audience Network"].map(
                  (p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      className={`text-xs rounded-full px-3 py-1 border transition-colors ${
                        form.platforms.includes(p)
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Tags (separadas por vírgula)
              </label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) =>
                  setForm((p) => ({ ...p, tags: e.target.value }))
                }
                placeholder="Ex: hook forte, oferta, VSL, antes/depois"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">
                Notas pessoais
              </label>
              <textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Por que esse ad é bom? O que copiar? Ideias..."
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={saving || !form.page_name.trim()}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-lg py-2.5 text-sm transition-colors"
            >
              {saving ? "Salvando..." : "Salvar Ad"}
            </button>
          </form>
        )}

        {/* Favorites tab */}
        {tab === "favorites" && (
          <div className="space-y-4">
            {/* Tag filter */}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs text-gray-500">Filtrar:</span>
                <button
                  onClick={() => setFilterTag("")}
                  className={`text-xs rounded-full px-2.5 py-1 border transition-colors ${
                    !filterTag
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400"
                  }`}
                >
                  Todos
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilterTag(tag)}
                    className={`text-xs rounded-full px-2.5 py-1 border transition-colors ${
                      filterTag === tag
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-gray-800 border-gray-700 text-gray-400"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {filteredFavorites.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                {favorites.length === 0
                  ? 'Nenhum ad salvo. Clique em "+ Salvar Ad" para começar.'
                  : "Nenhum ad com essa tag."}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFavorites.map((ad) => (
                  <div
                    key={ad.id}
                    className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-2">
                        {/* Header */}
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white text-sm">
                            {ad.page_name}
                          </span>
                          {ad.hook_type && (
                            <span className="text-xs bg-purple-900 text-purple-300 rounded-full px-2 py-0.5">
                              {ad.hook_type}
                            </span>
                          )}
                          {ad.ad_type && (
                            <span className="text-xs bg-cyan-900 text-cyan-300 rounded-full px-2 py-0.5">
                              {ad.ad_type}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        {ad.title && (
                          <p className="text-white font-medium text-sm">
                            {ad.title}
                          </p>
                        )}

                        {/* Body */}
                        {ad.body && (
                          <p className="text-gray-400 text-sm whitespace-pre-line line-clamp-4">
                            {ad.body}
                          </p>
                        )}

                        {/* Notes */}
                        {ad.notes && (
                          <div className="bg-gray-800 rounded-lg px-3 py-2 text-xs text-yellow-300">
                            💡 {ad.notes}
                          </div>
                        )}

                        {/* Tags */}
                        {ad.tags && (
                          <div className="flex flex-wrap gap-1.5">
                            {ad.tags.split(",").map((tag) => (
                              <span
                                key={tag}
                                className="text-xs bg-gray-800 text-gray-400 rounded-full px-2 py-0.5"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Platforms */}
                        {ad.platforms && (
                          <div className="flex flex-wrap gap-1.5">
                            {ad.platforms.split(",").map((p) => (
                              <span
                                key={p}
                                className="text-xs bg-blue-900/40 text-blue-300 rounded-full px-2 py-0.5"
                              >
                                {p.trim()}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Date + link */}
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span>
                            {new Date(ad.created_at).toLocaleDateString("pt-BR")}
                          </span>
                          {ad.ad_url && (
                            <a
                              href={ad.ad_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 hover:underline"
                            >
                              Ver ad original →
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemoveFavorite(ad.id)}
                        className="text-gray-700 hover:text-red-400 transition-colors text-sm p-1"
                        title="Remover"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
