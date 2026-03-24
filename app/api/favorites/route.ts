import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM saved_ads ORDER BY created_at DESC`;
    return NextResponse.json({ ads: rows });
  } catch {
    return NextResponse.json({ ads: [], error: "Erro ao buscar favoritos." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ad_id, page_name, body, title, snapshot_url, score, days_running, platforms } =
      await req.json();

    const platformsStr = Array.isArray(platforms) ? platforms.join(",") : platforms ?? "";

    const { rows } = await sql`
      INSERT INTO saved_ads (ad_id, page_name, body, title, snapshot_url, score, days_running, platforms)
      VALUES (${ad_id}, ${page_name}, ${body ?? null}, ${title ?? null}, ${snapshot_url}, ${score ?? 0}, ${days_running ?? 0}, ${platformsStr})
      RETURNING *
    `;
    return NextResponse.json({ ad: rows[0] });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar ad." }, { status: 500 });
  }
}
