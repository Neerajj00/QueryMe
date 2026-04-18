import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

// ✅ GET chat details and messages
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await context.params; // ✅ FIX

    if (!chatId) {
      return new Response("Chat ID is required", { status: 400 });
    }

    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!chat) {
      return new Response("Chat not found", { status: 404 });
    }

    return Response.json({
      id: chat.id,
      databaseId: chat.databaseId,
      messages: chat.messages,
    });
  } catch (err: any) {
    console.error("Get chat error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Something went wrong" }),
      { status: 500 }
    );
  }
}