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
        ad_id VARCHAR(255),
        page_name VARCHAR(255),
        body TEXT,
        title VARCHAR(500),
        snapshot_url TEXT,
        score INTEGER DEFAULT 0,
        days_running INTEGER DEFAULT 0,
        platforms TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;

    return NextResponse.json({ message: "Tabelas criadas com sucesso." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro ao criar tabelas." }, { status: 500 });
  }
}
