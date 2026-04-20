"use server";
import { getDatabaseWithConnection } from "@/lib/actions/database";
import { Client } from "pg";
import mysql from "mysql2/promise";
import { RowDataPacket } from "mysql2";

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
    (RowDataPacket & {
      TABLE_NAME: string;
      COLUMN_NAME: string;
    })[]
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



async function getRelationships(db: {
  dbType: string;
  connectionUrl: string;
}): Promise<string[]> {
  // ---------------- POSTGRESQL ----------------
  if (db.dbType === "POSTGRESQL") {
    const client = new Client({ connectionString: db.connectionUrl });
    await client.connect();

    const res = await client.query<{
      table_name: string;
      column_name: string;
      foreign_table_name: string;
      foreign_column_name: string;
    }>(`
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY';
    `);

    await client.end();

    return res.rows.map(
      (r) =>
        `"${r.table_name}"."${r.column_name}" → "${r.foreign_table_name}"."${r.foreign_column_name}"`
    );
  }

  // ---------------- MYSQL ----------------
  if (db.dbType === "MYSQL") {
    const conn = await mysql.createConnection(db.connectionUrl);

    const [rows] = await conn.query<
      (RowDataPacket & {
        TABLE_NAME: string;
        COLUMN_NAME: string;
        REFERENCED_TABLE_NAME: string;
        REFERENCED_COLUMN_NAME: string;
      })[]
    >(`
      SELECT
        TABLE_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE
        TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME IS NOT NULL;
    `);

    await conn.end();

    return rows.map(
      (r) =>
        `"${r.TABLE_NAME}"."${r.COLUMN_NAME}" → "${r.REFERENCED_TABLE_NAME}"."${r.REFERENCED_COLUMN_NAME}"`
    );
  }

  return [];
}

const relationshipCache = new Map<string, string[]>();

export async function getCachedRelationships(
  dbId: string,
  db: { dbType: string; connectionUrl: string }
) {
  if (relationshipCache.has(dbId)) {
    return relationshipCache.get(dbId)!;
  }

  const rels = await getRelationships(db);
  relationshipCache.set(dbId, rels);

  return rels;
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
    /* ---------------- 🔒 SAFETY LAYER ---------------- */

    const cleaned = sql.trim();

    // ✅ Only allow SELECT
    if (!/^select[\s\S]*$/i.test(cleaned)) {
      return { error: "Only SELECT queries are allowed" };
    }
    // ❌ Block dangerous keywords
    const forbidden = [
      "insert",
      "delete",
      "drop",
      "alter",
      "truncate",
    ];

    const lower = cleaned.toLowerCase();

    for (const word of forbidden) {
      if (lower.includes(word)) {
        return { error: `Forbidden keyword detected: ${word}` };
      }
    }

    /* ---------------- LIMIT ENFORCEMENT ---------------- */

    let finalSQL = cleaned;

    if (!/limit\s+\d+/i.test(finalSQL)) {
      finalSQL += " LIMIT 10";
    }

    /* ---------------- EXECUTION ---------------- */

    // ✅ POSTGRESQL
    if (db.dbType === "POSTGRESQL") {
      const client = new Client({ connectionString: db.connectionUrl });
      await client.connect();

      const schema = await getCachedSchema(dbId, db);
      const safeSQL = sanitizeSQL(finalSQL, schema);

      console.log("SAFE SQL:", safeSQL);

      const res = await client.query<Record<string, unknown>>(safeSQL);

      await client.end();

      return { rows: res.rows };
    }

    // ✅ MYSQL
    if (db.dbType === "MYSQL") {
      const conn = await mysql.createConnection(db.connectionUrl);

      const [rows] = await conn.query<Record<string, unknown>[]>(
        finalSQL
      );

      await conn.end();

      return { rows };
    }

    return { rows: [] };
  } catch (err: any) {
    return { error: err.message };
  }
}