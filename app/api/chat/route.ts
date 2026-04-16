import { getDatabaseWithConnection } from "@/lib/actions/database";
import { getCachedSchema } from "@/lib/actions/query";
import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { dbId, message } = await req.json();

    // get db
    const db = await getDatabaseWithConnection(dbId);

    // get schema
    const schema = await getCachedSchema(dbId, db);

    const schemaText = schema
      .map((t) => `${t.table}(${t.columns.join(", ")})`)
      .join("\n");

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
                `;

    // 4️⃣ STREAMING 🔥
    const result = await streamText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
    });

    // 5️⃣ Return stream
    return result.toTextStreamResponse();
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
