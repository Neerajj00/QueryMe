"use server";
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

export async function getCachedSchema(
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


/* ---------------- RUN QUERY ---------------- */

type RunQueryResult = { rows: Record<string, unknown>[] } | { error: string };


// 🔥 sanitize SQL (PostgreSQL only)
function sanitizeSQL(
  sql: string,
  schema: { table: string; columns: string[] }[]
) {

  const parts = sql.split(/('.*?')/); // avoid string literals

  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith("'")) continue;

    for (const t of schema) {
      const table = t.table;

      // ✅ replace table only if NOT already quoted
      parts[i] = parts[i].replace(
        new RegExp(`(?<!")\\b${table}\\b(?!")`, "g"),
        `"${table}"`
      );

      for (const col of t.columns) {
        // ✅ replace column only if NOT already quoted
        parts[i] = parts[i].replace(
          new RegExp(`(?<!")\\b${col}\\b(?!")`, "g"),
          `"${col}"`
        );
      }
    }
  }

  return parts.join("");
}

export async function runQuery(
  dbId: string,
  sql: string
): Promise<RunQueryResult> {
  console.log(`Running query on DB ${dbId}:`, sql);

  const db = await getDatabaseWithConnection(dbId);

  try {
    // ✅ POSTGRESQL
    if (db.dbType === "POSTGRESQL") {
      const client = new Client({ connectionString: db.connectionUrl });
      await client.connect();

      // 🔥 get schema + sanitize SQL
      const schema = await getCachedSchema(dbId, db);
      const safeSQL = sanitizeSQL(sql, schema);

      console.log("SAFE SQL:", safeSQL);

      const res = await client.query<Record<string, unknown>>(safeSQL);

      await client.end();

      return { rows: res.rows };
    }

    // ✅ MYSQL (no sanitize needed)
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