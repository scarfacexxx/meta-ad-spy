import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS saved_searches (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        page_id VARCHAR(255),
        type VARCHAR(50) NOT NULL DEFAULT 'keyword',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS saved_ads (
        id SERIAL PRIMARY KEY,
        page_name VARCHAR(255) NOT NULL,
        ad_url TEXT,
        body TEXT,
        title VARCHAR(500),
        screenshot_url TEXT,
        tags TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        hook_type VARCHAR(100),
        ad_type VARCHAR(100),
        platforms TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    return NextResponse.json({ message: "Tabelas criadas com sucesso." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar tabelas." }, { status: 500 });
  }
}
