"use server";

import { Client } from "pg";
import mysql from "mysql2/promise";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";
import { DatabaseType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

/* -------------------- 🔐 Encryption Utils -------------------- */


const SECRET_KEY = process.env.DB_SECRET_KEY || "dev-secret-key";

/* ✅ ALWAYS 32 bytes */
function getKey() {
  return crypto.createHash("sha256").update(SECRET_KEY).digest();
}
function encrypt(text: string) {
    const iv = crypto.randomBytes(16);
  
    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      getKey(), // ✅ fixed
      iv
    );
  
    let encrypted = cipher.update(text, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);
  
    return iv.toString("hex") + ":" + encrypted.toString("hex");
  }

  function decrypt(text: string) {
    const [ivHex, encryptedHex] = text.split(":");
  
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(encryptedHex, "hex");
  
    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      getKey(), // ✅ fixed
      iv
    );
  
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
  
    return decrypted.toString("utf8");
  }

/* -------------------- 🧪 Test Connection -------------------- */

export async function testConnection(
  connectionString: string,
  dbType: DatabaseType
) {
  try {
    if (dbType === DatabaseType.POSTGRESQL) {
      const client = new Client({ connectionString });
      await client.connect();
      await client.end();
      return true;
    }

    if (dbType === DatabaseType.MYSQL) {
      const connection = await mysql.createConnection(connectionString);
      await connection.end();
      return true;
    }

    return false;
  } catch (err) {
    console.error("Connection failed:", err);
    return false;
  }
}

/* -------------------- ➕ Add Database -------------------- */

export async function addDatabase(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!dbUser) throw new Error("Unauthorized");

  /* ---------- 🧹 Validation ---------- */

  const name = formData.get("name") as string;
  const dbType = formData.get("dbType") as DatabaseType;

  if (!name?.trim()) throw new Error("Database name required");
  if (!dbType) throw new Error("Database type required");

  let connectionString = formData.get("connectionUrl") as string;

  if (!connectionString) {
    const host = formData.get("host") as string;
    const port = formData.get("port") as string;
    const user = formData.get("username") as string;
    const password = formData.get("password") as string;
    const db = formData.get("database") as string;
    const ssl = formData.get("ssl");

    if (!host || !port || !user || !password) {
      throw new Error("Missing required fields");
    }

    if (dbType === DatabaseType.POSTGRESQL) {
      connectionString = `postgresql://${user}:${password}@${host}:${port}/${db}?sslmode=${
        ssl ? "require" : "disable"
      }`;
    }

    if (dbType === DatabaseType.MYSQL) {
      connectionString = `mysql://${user}:${password}@${host}:${port}/${db}`;
    }
  }

  /* ---------- 🧪 Test Connection BEFORE saving ---------- */

  const isValid = await testConnection(connectionString, dbType);
  if (!isValid) throw new Error("Invalid database connection");

  /* ---------- 🔐 Encrypt before storing ---------- */

  const encryptedConnectionString = encrypt(connectionString);

  /* ---------- 💾 Save ---------- */

  await prisma.databaseConnection.create({
    data: {
      userId: dbUser.id,
      name,
      dbType,
      connectionString: encryptedConnectionString,
    },
  });

  revalidatePath("/dashboard/databases");
}

/* -------------------- 📥 Get Databases -------------------- */

export async function getDatabases() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!dbUser) throw new Error("Unauthorized");

  const databases = await prisma.databaseConnection.findMany({
    where: { userId: dbUser.id },
    orderBy: { createdAt: "desc" },
  });

  return databases;
}

/* -------------------- 🔓 Optional: Get Decrypted String -------------------- */

export async function getDatabaseWithConnection(id: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  const db = await prisma.databaseConnection.findFirst({
    where: {
      id,
      userId: dbUser?.id, // 🔒 important security check
    },
  });

  if (!db) throw new Error("Database not found");

  return {
    ...db,
    connectionUrl: decrypt(db.connectionString), // 👈 add this
  };
}


export async function updateDatabase(id: string, formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!dbUser) throw new Error("Unauthorized");

  /* ---------- 🧹 Validation ---------- */

  const name = formData.get("name") as string;
  const dbType = formData.get("dbType") as DatabaseType;

  if (!name?.trim()) throw new Error("Database name required");
  if (!dbType) throw new Error("Database type required");

  let connectionString = formData.get("connectionUrl") as string;

  if (!connectionString) {
    const host = formData.get("host") as string;
    const port = formData.get("port") as string;
    const user = formData.get("username") as string;
    const password = formData.get("password") as string;
    const db = formData.get("database") as string;
    const ssl = formData.get("ssl");

    if (!host || !port || !user) {
      throw new Error("Missing required fields");
    }

    // ⚠️ IMPORTANT: allow empty password in edit
    if (dbType === DatabaseType.POSTGRESQL) {
      connectionString = `postgresql://${user}:${password || ""}@${host}:${port}/${db}?sslmode=${
        ssl ? "require" : "disable"
      }`;
    }

    if (dbType === DatabaseType.MYSQL) {
      connectionString = `mysql://${user}:${password || ""}@${host}:${port}/${db}`;
    }
  }

  /* ---------- 🧪 Test connection ---------- */

  const isValid = await testConnection(connectionString, dbType);
  if (!isValid) throw new Error("Invalid database connection");

  /* ---------- 🔐 Encrypt ---------- */

  const encryptedConnectionString = encrypt(connectionString);

  /* ---------- 🔒 Ownership check (IMPORTANT) ---------- */

  const existing = await prisma.databaseConnection.findUnique({
    where: { id },
  });

  if (!existing || existing.userId !== dbUser.id) {
    throw new Error("Unauthorized");
  }

  /* ---------- 💾 Update ---------- */

  await prisma.databaseConnection.update({
    where: { id },
    data: {
      name,
      dbType,
      connectionString: encryptedConnectionString,
    },
  });

  revalidatePath("/dashboard/databases");
}


export async function deleteDatabase(id: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });

  if (!dbUser) throw new Error("Unauthorized");

  const existing = await prisma.databaseConnection.findFirst({
    where: {
      id,
      userId: dbUser.id,
    },
  });

  if (!existing) throw new Error("Database not found");

  await prisma.databaseConnection.delete({
    where: { id },
  });

  revalidatePath("/dashboard/databases");
}