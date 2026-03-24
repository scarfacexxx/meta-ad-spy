import { NextRequest, NextResponse } from "next/server";
import { differenceInDays, parseISO } from "date-fns";

const META_API_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}/ads_archive`;

export interface AdResult {
  id: string;
  page_id: string;
  page_name: string;
  ad_creative_bodies?: string[];
  ad_creative_link_captions?: string[];
  ad_creative_link_descriptions?: string[];
  ad_creative_link_titles?: string[];
  ad_delivery_start_time?: string;
  ad_delivery_stop_time?: string;
  ad_snapshot_url: string;
  currency?: string;
  publisher_platforms?: string[];
  languages?: string[];
  impressions?: { lower_bound: string; upper_bound: string };
  spend?: { lower_bound: string; upper_bound: string };
  // computed
  score: number;
  days_running: number;
  is_active: boolean;
  variations_count: number;
}

function computeScore(ad: Omit<AdResult, "score">): number {
  let score = 0;

  // Longevidade: até 60 pontos (1 ponto por dia, cap 60)
  score += Math.min(ad.days_running, 60);

  // Ainda ativo: 20 pontos
  if (ad.is_active) score += 20;

  // Múltiplas plataformas: até 10 pontos
  const platforms = ad.publisher_platforms?.length ?? 1;
  score += Math.min(platforms * 3, 10);

  // Variações de copy: até 10 pontos
  const bodies = ad.ad_creative_bodies?.length ?? 1;
  score += Math.min(bodies * 2, 10);

  return score;
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("q") ?? "";
  const country = searchParams.get("country") ?? "BR";
  const activeOnly = searchParams.get("active") === "true";
  const token = searchParams.get("token") ?? process.env.META_ACCESS_TOKEN ?? "";
  const pageId = searchParams.get("page_id") ?? "";

  if (!token) {
    return NextResponse.json({ error: "Token de acesso não configurado." }, { status: 400 });
  }
  if (!query && !pageId) {
    return NextResponse.json({ error: "Informe um nome de página ou palavra-chave." }, { status: 400 });
  }

  const fields = [
    "id",
    "page_id",
    "page_name",
    "ad_creative_bodies",
    "ad_creative_link_captions",
    "ad_creative_link_descriptions",
    "ad_creative_link_titles",
    "ad_delivery_start_time",
    "ad_delivery_stop_time",
    "ad_snapshot_url",
    "publisher_platforms",
    "languages",
    "impressions",
    "spend",
    "currency",
  ].join(",");

  const params = new URLSearchParams({
    access_token: token,
    ad_reached_countries: country,
    ad_active_status: activeOnly ? "ACTIVE" : "ALL",
    fields,
    limit: "50",
  });

  if (pageId) {
    params.set("search_page_ids", pageId);
  } else {
    params.set("search_terms", query);
  }

  try {
    const resp = await fetch(`${BASE_URL}?${params.toString()}`, {
      next: { revalidate: 300 },
    });

    if (!resp.ok) {
      const err = await resp.json();
      return NextResponse.json({ error: err?.error?.message ?? "Erro na API do Meta." }, { status: resp.status });
    }

    const data = await resp.json();
    const rawAds: Record<string, unknown>[] = data.data ?? [];
    const now = new Date();

    const ads: AdResult[] = rawAds.map((ad) => {
      const start = ad.ad_delivery_start_time ? parseISO(ad.ad_delivery_start_time as string) : now;
      const stop = ad.ad_delivery_stop_time ? parseISO(ad.ad_delivery_stop_time as string) : null;
      const is_active = !stop || stop >= now;
      const days_running = differenceInDays(stop ?? now, start);
      const variations_count = (ad.ad_creative_bodies as string[] | undefined)?.length ?? 1;

      const partial = {
        ...(ad as object),
        days_running,
        is_active,
        variations_count,
        score: 0,
      } as unknown as Omit<AdResult, "score">;

      return { ...partial, score: computeScore(partial) };
    });

    // Ordenar por score desc
    ads.sort((a, b) => b.score - a.score);

    return NextResponse.json({ ads, total: ads.length, paging: data.paging });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Falha ao conectar com a API do Meta." }, { status: 500 });
  }
}
