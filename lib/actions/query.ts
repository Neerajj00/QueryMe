"use server";

import { ai } from "@/lib/gemini";
import { getDatabaseWithConnection } from "@/lib/actions/database";
import { Client } from "pg";
import mysql from "mysql2/promise";

/* ---------------- TYPES ---------------- */

type TableSchema = {
  table: string;
  columns: string[];
};

/* ---------------- SCHEMA ---------------- */

async function getFullSchema(db: {
  dbType: string;
  connectionUrl: string;
}): Promise<TableSchema[]> {
  if (db.dbType === "POSTGRESQL") {
    const client = new Client({ connectionString: db.connectionUrl });
    await client.connect();

    const res = await client.query<{
      table_name: string;
      column_name: string;
    }>(`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `);

    await client.end();

    const map = new Map<string, string[]>();

    for (const row of res.rows) {
      if (!map.has(row.table_name)) {
        map.set(row.table_name, []);
      }
      map.get(row.table_name)!.push(row.column_name);
    }

    return Array.from(map.entries()).map(([table, columns]) => ({
      table,
      columns,
    }));
  }

  if (db.dbType === "MYSQL") {
    const conn = await mysql.createConnection(db.connectionUrl);

    const [rows] = await conn.query<
      {
        TABLE_NAME: string;
        COLUMN_NAME: string;
      }[]
    >(`
      SELECT TABLE_NAME, COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
    `);

    await conn.end();

    const map = new Map<string, string[]>();

    for (const row of rows) {
      if (!map.has(row.TABLE_NAME)) {
        map.set(row.TABLE_NAME, []);
      }
      map.get(row.TABLE_NAME)!.push(row.COLUMN_NAME);
    }

    return Array.from(map.entries()).map(([table, columns]) => ({
      table,
      columns,
    }));
  }

  return [];
}

/* ---------------- CACHE ---------------- */

const schemaCache = new Map<string, TableSchema[]>();

async function getCachedSchema(
  dbId: string,
  db: { dbType: string; connectionUrl: string }
) {
  if (schemaCache.has(dbId)) {
    return schemaCache.get(dbId)!;
  }

  const schema = await getFullSchema(db);
  schemaCache.set(dbId, schema);

  return schema;
}

/* ---------------- FORMAT ---------------- */

function formatSchema(schema: TableSchema[]) {
  return schema.map((t) => `${t.table}(${t.columns.join(", ")})`).join("\n");
}

/* ---------------- GENERATE SQL ---------------- */

export async function generateQuery(
  dbId: string,
  prompt: string
): Promise<{ generatedSQL: string }> {
  const db = await getDatabaseWithConnection(dbId);

  const schema = await getCachedSchema(dbId, db);
  const schemaText = formatSchema(schema);
  
  const promptText = `
  You are an expert SQL generator.

  Database type: ${db.dbType}

  Database schema:
  ${schemaText}

  User question:
  "${prompt}"

  Rules:
  - Only return SQL
  - No explanation
  - No markdown
  - Use LIMIT 10 when returning rows
  - If user asks about database metadata (tables, columns), use system tables:
    - PostgreSQL → information_schema.tables
    - MySQL → SHOW TABLES

  SQL:
  `;

  console.log("===== GEMINI PROMPT =====");
  console.log(promptText);
  console.log("========================");

  const res = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: promptText,
  });

  let sql = res.text ?? "";

  sql = sql
    .replace(/```sql/g, "")
    .replace(/```/g, "")
    .trim();

  /* 🔐 SAFETY */
  if (/drop|delete|truncate|update/i.test(sql)) {
    throw new Error("Unsafe query generated");
  }

  if (!sql.toLowerCase().startsWith("select")) {
    throw new Error("Only SELECT queries allowed");
  }

  return { generatedSQL: sql };
}

/* ---------------- RUN QUERY ---------------- */

type RunQueryResult = { rows: Record<string, unknown>[] } | { error: string };

export async function runQuery(
  dbId: string,
  sql: string
): Promise<RunQueryResult> {
  const db = await getDatabaseWithConnection(dbId);

  try {
    if (db.dbType === "POSTGRESQL") {
      const client = new Client({ connectionString: db.connectionUrl });
      await client.connect();

      const res = await client.query<Record<string, unknown>>(sql);

      await client.end();

      return { rows: res.rows };
    }

    if (db.dbType === "MYSQL") {
      const conn = await mysql.createConnection(db.connectionUrl);

      const [rows] = await conn.query<Record<string, unknown>[]>(sql);

      await conn.end();

      return { rows };
    }

    return { rows: [] };
  } catch (err: any) {
    return { error: err.message };
  }
}
