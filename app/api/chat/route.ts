import { getDatabaseWithConnection } from "@/lib/actions/database";
import { getCachedRelationships, getCachedSchema } from "@/lib/actions/query";
import { prisma } from "@/lib/prisma";
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { NextRequest } from "next/server";

// ✅ POST endpoint to handle user message and generate SQL
export async function POST(req: NextRequest) {
  try {
    const { dbId, message, chatId } = await req.json();

    if (!dbId || !message || !chatId) {
      return new Response("Missing fields", { status: 400 });
    }

    // ✅ Get DB connection
    const db = await getDatabaseWithConnection(dbId);

    // ✅ Get schema
    const schema = await getCachedSchema(dbId, db);

    const schemaText = schema
      .map((t) => `${t.table}(${t.columns.join(", ")})`)
      .join("\n");


    const relationships = await getCachedRelationships(dbId, db);

    const relationshipText =
      relationships.length > 0
        ? relationships.join("\n")
        : "No explicit relationships found.";





    // ✅ Build prompt
    const prompt = `
    You are an expert SQL generator.
    
    Database: ${db.dbType}
    
    Schema:
    ${schemaText}
    
    Relationships:
    ${relationshipText}
    
    User request:
    "${message}"
    
    Rules:
    - Return ONLY one SQL query or INVALID_QUERY.
    - No markdown or explanation.
    - Only SELECT queries.
    - Always use LIMIT 10.
    - For PostgreSQL, use double quotes around table and column names.
    - Use only tables and columns from the provided schema.
    - Singular/plural names and obvious natural-language variations are allowed.
    - Use JOINs when multiple tables are needed.
    - Use only the relationships provided. Do not invent relationships.
    - Return INVALID_QUERY for random, vague, unrelated, or unmappable requests.
    - Metadata requests like "show all tables" are allowed.
    - For PostgreSQL "show all tables", query information_schema.tables.
    
    Examples:
    
    "show all users"
    → SELECT * FROM "User" LIMIT 10;
    
    "show chats with user names"
    → SELECT "Chat".*, "User"."name"
       FROM "Chat"
       JOIN "User" ON "Chat"."userId" = "User"."id"
       LIMIT 10;
    
    "show all tables"
    → SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = 'public'
       LIMIT 10;
    
    "what is the capital of India"
    → INVALID_QUERY;
    
    "asdasd"
    → INVALID_QUERY;
    `;

console.log("Prompt for AI:", prompt);

    // ✅ Stream AI response
    const result = streamText({
      model: groq("openai/gpt-oss-120b"),
      prompt,
    });
    result.text.then((text) => {
      console.log("AI RAW OUTPUT:", JSON.stringify(text));
    });

    // ✅ Save ASSISTANT message AFTER stream completes
    result.text.then(async (finalSQL) => {
      try {
        await prisma.message.create({
          data: {
            chatId,
            role: "assistant",
            content: "", // No text content for assistant
            generatedSQL: finalSQL.trim(),
          },
        });
      } catch (err) {
        console.error("Failed to save AI message:", err);
      }
    });

    // ✅ Return stream to frontend
    return result.toTextStreamResponse();
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong" }),
      { status: 500 }
    );
  }
}
