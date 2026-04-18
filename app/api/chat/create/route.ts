import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/actions/user";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { chatId, databaseId, title } = await req.json();

    if (!chatId || !databaseId || !title) {
      return new Response("Missing fields", { status: 400 });
    }

    // ✅ Create Chat record in database
    const chat = await prisma.chat.create({
      data: {
        id: chatId, // Use the chatId from frontend
        userId: user.id,
        databaseId,
        title,
      },
    });

    return Response.json(chat);
  } catch (err: any) {
    console.error("Create chat error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
}