import { NextRequest, NextResponse } from "next/server";

/**
 * Scrapes the Meta Ad Library page and extracts ad info from the HTML.
 * Accepts a URL like:
 * - https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&view_all_page_id=XXXXX
 * - https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=KEYWORD
 */
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || !url.includes("facebook.com/ads/library")) {
      return NextResponse.json(
        { error: "Cole uma URL válida da Meta Ad Library." },
        { status: 400 }
      );
    }

    // Extract info from URL params
    const parsed = new URL(url);
    const pageId = parsed.searchParams.get("view_all_page_id");
    const query = parsed.searchParams.get("q");
    const country = parsed.searchParams.get("country") ?? "BR";

    // Fetch the Ad Library page
    const resp = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Erro ao acessar a Ad Library (${resp.status})` },
        { status: 500 }
      );
    }

    const html = await resp.text();

    // Extract page name from meta tags or page content
    const pageName = extractPageName(html, query);

    // Extract ad cards data from the HTML
    const ads = extractAdsFromHtml(html);

    return NextResponse.json({
      page_name: pageName,
      page_id: pageId,
      query,
      country,
      ads,
      total: ads.length,
    });
  } catch (e) {
    console.error("Scrape error:", e);
    return NextResponse.json(
      { error: "Falha ao extrair dados da Ad Library." },
      { status: 500 }
    );
  }
}

function extractPageName(html: string, query: string | null): string {
  // Try og:title
  const ogMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/);
  if (ogMatch) return ogMatch[1].replace(/ \| Facebook.*$/, "").replace(/ - Ad Library.*$/, "");

  // Try title tag
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (titleMatch) return titleMatch[1].replace(/ \| Facebook.*$/, "").replace(/ - Ad Library.*$/, "");

  return query ?? "Desconhecido";
}

interface ScrapedAd {
  body: string | null;
  title: string | null;
  started: string | null;
  status: string | null;
  platforms: string[];
  snapshot_url: string | null;
}

function extractAdsFromHtml(html: string): ScrapedAd[] {
  const ads: ScrapedAd[] = [];

  // Extract ad creative bodies - look for common patterns in Ad Library HTML
  // The Ad Library uses React and renders dynamically, so HTML scraping is limited.
  // We extract what we can from the server-rendered HTML.

  // Look for "Started running on" dates
  const dateMatches = html.matchAll(/Started running on[^<]*(\w+ \d+, \d{4})/gi);
  const dates = [...dateMatches].map((m) => m[1]);

  // Look for ad text content in specific divs
  const bodyMatches = html.matchAll(/<div[^>]*class="[^"]*_7jyr[^"]*"[^>]*>([\s\S]*?)<\/div>/gi);
  const bodies = [...bodyMatches].map((m) => m[1].replace(/<[^>]+>/g, "").trim());

  // Look for snapshot URLs
  const snapshotMatches = html.matchAll(/https:\/\/www\.facebook\.com\/ads\/archive\/render_ad\/\?[^"'\s]+/gi);
  const snapshots = [...snapshotMatches].map((m) => m[0]);

  // Combine into ad objects
  const maxLen = Math.max(bodies.length, dates.length, snapshots.length, 1);
  for (let i = 0; i < maxLen && i < 50; i++) {
    ads.push({
      body: bodies[i] ?? null,
      title: null,
      started: dates[i] ?? null,
      status: null,
      platforms: [],
      snapshot_url: snapshots[i] ?? null,
    });
  }

  // If nothing was found from patterns, try a simpler approach
  if (ads.length === 0 || (ads.length === 1 && !ads[0].body && !ads[0].snapshot_url)) {
    return [];
  }

  return ads.filter((a) => a.body || a.snapshot_url);
}
