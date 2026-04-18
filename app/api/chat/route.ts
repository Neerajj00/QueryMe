import { getDatabaseWithConnection } from "@/lib/actions/database";
import { getCachedSchema } from "@/lib/actions/query";
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

    // ✅ Build prompt
    const prompt = `
You are an expert SQL generator.

Database type: ${db.dbType}

Schema:
${schemaText}

User:
"${message}"

Rules:
- Only SQL
- No explanation
- No markdown
- LIMIT 10
- Only SELECT queries

IMPORTANT:
- if it is PostgreSQL
- ALWAYS wrap table names and column names in double quotes
- Especially for camelCase names

Example:
SELECT * FROM "User" ORDER BY "createdAt" DESC;
`;

    // ✅ Stream AI response
    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
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
