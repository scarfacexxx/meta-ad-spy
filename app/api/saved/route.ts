import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`SELECT * FROM saved_searches ORDER BY created_at DESC`;
    return NextResponse.json({ searches: rows });
  } catch {
    return NextResponse.json({ searches: [], error: "Erro ao buscar." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, page_id, type } = await req.json();
    if (!name) {
      return NextResponse.json({ error: "Nome obrigatório." }, { status: 400 });
    }
    const { rows } = await sql`
      INSERT INTO saved_searches (name, page_id, type)
      VALUES (${name}, ${page_id ?? null}, ${type ?? "keyword"})
      RETURNING *
    `;
    return NextResponse.json({ search: rows[0] });
  } catch {
    return NextResponse.json({ error: "Erro ao salvar." }, { status: 500 });
  }
}
