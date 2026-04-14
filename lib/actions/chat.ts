"use server";

import { getUser } from "./user";
import { prisma } from "../prisma";

export async function createChat(firstMessage: string, databaseId?: string) {
  const user = await getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const chat = await prisma.chat.create({
    data: {
      userId: user.id,
      databaseId,
      title: firstMessage.slice(0, 50),

      messages: {
        create: {
          role: "USER",
          content: firstMessage,
        },
      },
    },
  });

  return chat.id;
}

export async function saveMessage({
  chatId,
  role,
  content,
  generatedSQL,
  result,
}: {
  chatId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  generatedSQL?: string;
  result?: any;
}) {
  await prisma.message.create({
    data: {
      chatId,
      role,
      content,
      generatedSQL,
      result,
    },
  });
}

export async function getMessagesByChatId(chatId: string) {
  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((m) => ({
    id: m.id,
    role: m.role.toLowerCase(),
    content: m.content,
    generatedSQL: m.generatedSQL || undefined,
    result: m.result || undefined,
  }));
}


export async function getChatHistory() {
    const user = await getUser();
    if(!user){
        throw new Error("Unauthorized");
    }
    return prisma.chat.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { database: true },
    });
  }