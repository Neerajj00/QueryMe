import {Client} from "pg";
import mysql from "mysql2/promise";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../prisma";

import { DatabaseType } from "@prisma/client";
import { revalidatePath } from "next/cache";


export async function addDatabase(formData: FormData){
    const { userId } = await auth();
    if(!userId)throw new Error("Unauthorized");

    const name = formData.get("name") as string;
    const dbType = formData.get("dbType") as DatabaseType;

    let connectionString = formData.get("connectionUrl") as string;
    if(!connectionString){
        const host = formData.get("host") as string;
        const port = formData.get("port") as string;
        const user = formData.get("username") as string;
        const password = formData.get("password") as string;
        const db = formData.get("database") as string;
        const ssl = formData.get("ssl");

        if(!host || !port || !user || !password) throw new Error("Missing required fields");

        if(dbType === "POSTGRESQL"){
            connectionString = `postgresql://${user}:${password}@${host}:${port}/${db}?sslmode=${ ssl ? "require" : "disable"}`
            }

        if (dbType === "MYSQL") {
            connectionString = `mysql://${user}:${password}@${host}:${port}/${db}`
            }
    }

    await prisma.databaseConnection.create({
        data: {
          userId,
          name,
          dbType,
          connectionString,
        },
      })

      revalidatePath("/dashboard/databases");
    }

// Test database connection
export async function testConnection(connectionString : string, dbType: string){
    if(dbType === "postgres"){
        const pgClient = new Client(connectionString);
        try {
            await pgClient.connect();
            await pgClient.end();
            return true;
        } catch (err) {
            console.error("Connection failed:", err);
            return false;
        }
    }
    else if(dbType === "mysql"){
        // Implement MySQL connection test
        try{
            const connection = await mysql.createConnection(connectionString);
            await connection.end();
            return true;
        }catch(err){
            console.error("Connection failed:", err);
            return false;
        }
    }
}