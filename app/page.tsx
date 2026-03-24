"use client";

import { useState, useCallback, useEffect } from "react";
import AdCard from "@/components/AdCard";
import SearchForm from "@/components/SearchForm";
import SavedSearches from "@/components/SavedSearches";
import type { AdResult } from "@/app/api/ads/route";

type Tab = "search" | "favorites";

interface SavedAd {
  id: number;
  ad_id: string;
  page_name: string;
  body: string | null;
  title: string | null;
  snapshot_url: string;
  score: number;
  days_running: number;
  platforms: string;
}

export default function Home() {
  const [ads, setAds] = useState<AdResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [tab, setTab] = useState<Tab>("search");
  const [favorites, setFavorites] = useState<SavedAd[]>([]);
  const [savedAdIds, setSavedAdIds] = useState<Set<string>>(new Set());
  const [prefill, setPrefill] = useState<{ q?: string; page_id?: string } | null>(null);

  const loadFavorites = useCallback(async () => {
    try {
      const res = await fetch("/api/favorites");
      const data = await res.json();
      const favs: SavedAd[] = data.ads ?? [];
      setFavorites(favs);
      setSavedAdIds(new Set(favs.map((f) => f.ad_id)));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  async function handleSearch(params: {
    q: string;
    country: string;
    active: boolean;
    page_id: string;
  }) {
    setLoading(true);
    setError(null);
    setAds([]);
    setSearched(true);
    setTab("search");

    const qs = new URLSearchParams({
      q: params.q,
      country: params.country,
      active: String(params.active),
      page_id: params.page_id,
    });

    try {
      const res = await fetch(`/api/ads?${qs}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro desconhecido");
      } else {
        setAds(data.ads);
      }
    } catch {
      setError("Falha ao buscar ads.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveAd(ad: AdResult) {
    try {
      await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ad_id: ad.id,
          page_name: ad.page_name,
          body: ad.ad_creative_bodies?.[0] ?? null,
          title: ad.ad_creative_link_titles?.[0] ?? null,
          snapshot_url: ad.ad_snapshot_url,
          score: ad.score,
          days_running: ad.days_running,
          platforms: ad.publisher_platforms,
        }),
      });
      loadFavorites();
    } catch {
      /* ignore */
    }
  }

  async function handleUnsaveAd(ad: AdResult) {
    const fav = favorites.find((f) => f.ad_id === ad.id);
    if (!fav) return;
    try {
      await fetch(`/api/favorites/${fav.id}`, { method: "DELETE" });
      loadFavorites();
    } catch {
      /* ignore */
    }
  }

  async function handleRemoveFavorite(savedAd: SavedAd) {
    try {
      await fetch(`/api/favorites/${savedAd.id}`, { method: "DELETE" });
      loadFavorites();
    } catch {
      /* ignore */
    }
  }

  function handleSelectSavedSearch(search: { name: string; page_id: string | null }) {
    setPrefill({
      q: search.page_id ? undefined : search.name,
      page_id: search.page_id ?? undefined,
    });
    // Auto-search
    handleSearch({
      q: search.page_id ? "" : search.name,
      country: "BR",
      active: false,
      page_id: search.page_id ?? "",
    });
  }

  function savedAdToAdResult(s: SavedAd): AdResult {
    return {
      id: s.ad_id,
      page_id: "",
      page_name: s.page_name,
      ad_creative_bodies: s.body ? [s.body] : undefined,
      ad_creative_link_titles: s.title ? [s.title] : undefined,
      ad_snapshot_url: s.snapshot_url,
      score: s.score,
      days_running: s.days_running,
      is_active: false,
      variations_count: 1,
      publisher_platforms: s.platforms ? s.platforms.split(",") : undefined,
    };
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-white">
            <span className="text-blue-400">Meta</span> Ad Spy
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Encontre os melhores ads dos seus concorrentes e inspirações
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Saved searches */}
        <SavedSearches onSelect={handleSelectSavedSearch} />

        {/* Search form */}
        <SearchForm onSearch={handleSearch} loading={loading} prefill={prefill} />

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-800">
          <button
            onClick={() => setTab("search")}
            className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
              tab === "search"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Resultados {ads.length > 0 && `(${ads.length})`}
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
        </div>

        {/* Search tab */}
        {tab === "search" && (
          <>
            {error && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {loading && (
              <div className="flex items-center justify-center py-16">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="ml-3 text-gray-400">Buscando ads...</span>
              </div>
            )}

            {!loading && searched && ads.length === 0 && !error && (
              <div className="text-center py-16 text-gray-500">
                Nenhum ad encontrado. Tente outros termos.
              </div>
            )}

            {ads.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">
                    Score = longevidade + ativo + plataformas + variações
                  </span>
                </div>
                <div className="grid gap-4">
                  {ads.map((ad, i) => (
                    <AdCard
                      key={ad.id ?? String(i)}
                      ad={ad}
                      rank={i + 1}
                      isSaved={savedAdIds.has(ad.id)}
                      onSave={handleSaveAd}
                      onUnsave={handleUnsaveAd}
                    />
                  ))}
                </div>
              </div>
            )}

            {!searched && !loading && (
              <div className="text-center py-16 space-y-3">
                <div className="text-5xl">🎯</div>
                <p className="text-gray-400 text-sm max-w-md mx-auto">
                  Pesquise por nome, ID, URL do Facebook ou URL da Ad Library.
                  Os ads são ranqueados por performance.
                </p>
              </div>
            )}
          </>
        )}

        {/* Favorites tab */}
        {tab === "favorites" && (
          <>
            {favorites.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                Nenhum ad salvo ainda. Busque ads e clique no coração para salvar.
              </div>
            ) : (
              <div className="grid gap-4">
                {favorites.map((fav, i) => {
                  const ad = savedAdToAdResult(fav);
                  return (
                    <AdCard
                      key={fav.id}
                      ad={ad}
                      rank={i + 1}
                      isSaved={true}
                      onUnsave={() => handleRemoveFavorite(fav)}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
