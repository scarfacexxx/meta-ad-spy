// This route is no longer used — the app now works without Meta API
// Kept as placeholder for future API integration
import { NextResponse } from "next/server";

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
  score: number;
  days_running: number;
  is_active: boolean;
  variations_count: number;
}

export async function GET() {
  return NextResponse.json({
    error: "API desabilitada. Use a Ad Library manualmente e salve os ads pelo app.",
  });
}
