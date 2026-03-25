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
    const { page_name, ad_url, body, title, screenshot_url, tags, notes, hook_type, ad_type, platforms } =
      await req.json();

    if (!page_name) {
      return NextResponse.json({ error: "Nome da página é obrigatório." }, { status: 400 });
    }

    const tagsStr = Array.isArray(tags) ? tags.join(",") : tags ?? "";
    const platformsStr = Array.isArray(platforms) ? platforms.join(",") : platforms ?? "";

    const { rows } = await sql`
      INSERT INTO saved_ads (page_name, ad_url, body, title, screenshot_url, tags, notes, hook_type, ad_type, platforms)
      VALUES (${page_name}, ${ad_url ?? null}, ${body ?? null}, ${title ?? null}, ${screenshot_url ?? null}, ${tagsStr}, ${notes ?? ""}, ${hook_type ?? null}, ${ad_type ?? null}, ${platformsStr})
      RETURNING *
    `;
    return NextResponse.json({ ad: rows[0] });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao salvar ad." }, { status: 500 });
  }
}
