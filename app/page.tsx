"use client";

import { useState } from "react";
import AdCard from "@/components/AdCard";
import SearchForm from "@/components/SearchForm";
import type { AdResult } from "@/app/api/ads/route";

export default function Home() {
  const [ads, setAds] = useState<AdResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

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

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <SearchForm onSearch={handleSearch} loading={loading} />

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
            Nenhum ad encontrado. Tente outros termos ou verifique o token.
          </div>
        )}

        {ads.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-200">
                {ads.length} ads encontrados{" "}
                <span className="text-gray-500 text-sm font-normal">
                  — ordenados por score
                </span>
              </h2>
              <span className="text-xs text-gray-600 bg-gray-800 px-2 py-1 rounded">
                Score = longevidade + ativo + plataformas + variações
              </span>
            </div>
            <div className="grid gap-4">
              {ads.map((ad, i) => (
                <AdCard key={ad.id ?? String(i)} ad={ad} rank={i + 1} />
              ))}
            </div>
          </div>
        )}

        {!searched && (
          <div className="text-center py-16 space-y-3">
            <div className="text-5xl">🎯</div>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Pesquise por nome de página ou palavras-chave. Os ads são
              ranqueados pelos que mais performam com base em longevidade,
              atividade, plataformas e variações de copy.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
