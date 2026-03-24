import type { AdResult } from "@/app/api/ads/route";

interface Props {
  ad: AdResult;
  rank: number;
}

const PLATFORM_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  audience_network: "Audience Network",
  messenger: "Messenger",
};

const PLATFORM_COLORS: Record<string, string> = {
  facebook: "bg-blue-900 text-blue-300",
  instagram: "bg-pink-900 text-pink-300",
  audience_network: "bg-purple-900 text-purple-300",
  messenger: "bg-cyan-900 text-cyan-300",
};

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 70
      ? "bg-green-900 text-green-300 border-green-700"
      : score >= 40
      ? "bg-yellow-900 text-yellow-300 border-yellow-700"
      : "bg-gray-800 text-gray-400 border-gray-600";

  return (
    <div className={`border rounded-lg px-3 py-1.5 text-center min-w-[64px] ${color}`}>
      <div className="text-xs font-medium opacity-70">Score</div>
      <div className="text-xl font-bold">{score}</div>
    </div>
  );
}

export default function AdCard({ ad, rank }: Props) {
  const body = ad.ad_creative_bodies?.[0];
  const title = ad.ad_creative_link_titles?.[0];
  const description = ad.ad_creative_link_descriptions?.[0];

  const startDate = ad.ad_delivery_start_time
    ? new Date(ad.ad_delivery_start_time).toLocaleDateString("pt-BR")
    : null;
  const stopDate = ad.ad_delivery_stop_time
    ? new Date(ad.ad_delivery_stop_time).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-600 transition-colors">
      <div className="flex gap-4">
        {/* Rank + Score */}
        <div className="flex flex-col items-center gap-2 min-w-[64px]">
          <div className="text-gray-600 text-xs font-mono">#{rank}</div>
          <ScoreBadge score={ad.score} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-semibold text-white text-sm">
                {ad.page_name}
              </span>
              {ad.page_id && (
                <span className="text-gray-600 text-xs ml-2">ID: {ad.page_id}</span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {ad.is_active && (
                <span className="flex items-center gap-1 text-xs bg-green-900/50 text-green-400 border border-green-800 rounded-full px-2 py-0.5">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Ativo
                </span>
              )}
            </div>
          </div>

          {/* Copy */}
          {title && (
            <p className="text-white font-medium text-sm">{title}</p>
          )}
          {body && (
            <p className="text-gray-400 text-sm line-clamp-3">{body}</p>
          )}
          {description && !body && (
            <p className="text-gray-400 text-sm line-clamp-2">{description}</p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-3 text-xs text-gray-500">
            {ad.days_running > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {ad.days_running} dias no ar
              </span>
            )}
            {startDate && (
              <span>
                {startDate}
                {stopDate ? ` — ${stopDate}` : " — hoje"}
              </span>
            )}
            {ad.variations_count > 1 && (
              <span className="text-purple-400">
                {ad.variations_count} variações de copy
              </span>
            )}
          </div>

          {/* Platforms */}
          {ad.publisher_platforms && ad.publisher_platforms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {ad.publisher_platforms.map((p) => (
                <span
                  key={p}
                  className={`text-xs rounded-full px-2 py-0.5 ${
                    PLATFORM_COLORS[p] ?? "bg-gray-800 text-gray-400"
                  }`}
                >
                  {PLATFORM_LABELS[p] ?? p}
                </span>
              ))}
            </div>
          )}

          {/* Link */}
          {ad.ad_snapshot_url && (
            <a
              href={ad.ad_snapshot_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 hover:underline"
            >
              Ver criativo completo
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
