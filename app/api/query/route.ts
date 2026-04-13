import { streamText } from "ai";
import { groq } from "@ai-sdk/groq";
import { NextResponse } from "next/server";
import { getDatabaseWithConnection } from "@/lib/actions/database";

/* 🔁 reuse your schema logic (simplified copy) */

async function getSchemaText(db: any) {
  if (db.dbType === "POSTGRESQL") {
    const { Client } = await import("pg");
    const client = new Client({ connectionString: db.connectionUrl });
    await client.connect();

    const res = await client.query(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `);

    await client.end();

    const map = new Map();

    for (const row of res.rows) {
      if (!map.has(row.table_name)) map.set(row.table_name, []);
      map.get(row.table_name).push(row.column_name);
    }

    return Array.from(map.entries())
      .map(([t, cols]) => `${t}(${cols.join(", ")})`)
      .join("\n");
  }

  if (db.dbType === "MYSQL") {
    const mysql = (await import("mysql2/promise")).default;
    const conn = await mysql.createConnection(db.connectionUrl);

    const [rows]: any = await conn.query(`
      SELECT TABLE_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
    `);

    await conn.end();

    const map = new Map();

    for (const row of rows) {
      if (!map.has(row.TABLE_NAME)) map.set(row.TABLE_NAME, []);
      map.get(row.TABLE_NAME).push(row.COLUMN_NAME);
    }

    return Array.from(map.entries())
      .map(([t, cols]) => `${t}(${cols.join(", ")})`)
      .join("\n");
  }

  return "";
}

export async function POST(req: Request) {
  const { dbId, prompt } = await req.json();

  const db = await getDatabaseWithConnection(dbId);
  const schemaText = await getSchemaText(db);

  const promptText = `
You are an expert SQL generator.

Database type: ${db.dbType}

Schema:
${schemaText}

User:
"${prompt}"

Rules:
- Only SQL
- No explanation
- No markdown
- LIMIT 10
- Only SELECT queries
`;

  const stream = await streamText({
    model: groq("llama-3.3-70b-versatile"),
    prompt: promptText,
  });

  return new Response(stream.toTextStream());
}