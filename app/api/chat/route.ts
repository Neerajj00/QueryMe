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

Database type: ${db.dbType}

Schema:
${schemaText}

Relationships:
${relationshipText}

User:
"${message}"

Rules:
- Return ONLY ONE SQL query OR the string INVALID_QUERY
- No explanation
- No markdown
- Only SELECT queries
- Always include LIMIT 10

STRICT RULES:
- Generate SQL ONLY if the user clearly asks about data in the database
- The request must explicitly relate to table names or columns in the schema

- If the input is:
  - random text (e.g. "asdasd")
  - vague (e.g. "something")
  - general knowledge (e.g. "what is galaxy")
  - not clearly mappable to schema

→ THEN return exactly:
INVALID_QUERY

- DO NOT assume random text is a name
- DO NOT guess mappings
- DO NOT invent columns or tables

- ALWAYS use JOINs when querying multiple tables
- ALWAYS follow the Relationships section when joining tables

- If no relationships are provided, assume columns ending with 'Id' are foreign keys

- If PostgreSQL:
  ALWAYS wrap table and column names in double quotes

Example valid:
"show all users"
→ SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 10;

Example invalid:
"asdasd"
→ INVALID_QUERY
`;

console.log("Prompt for AI:", prompt);

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
