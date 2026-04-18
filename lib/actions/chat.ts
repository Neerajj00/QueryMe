"use server";

import { getUser } from "./user";
import { prisma } from "../prisma";
import { auth } from "@clerk/nextjs/server";

export async function getChatHistory() {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return prisma.chat.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { database: true },
  });
}



export async function saveMessage({
  chatId,
  role,
  content,
  generatedSQL,
}: {
  chatId: string;
  role: "user" | "assistant";
  content?: string;
  generatedSQL?: string;
}) {

  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  return prisma.message.create({
    data: {
      chatId,
      role,
      content: content || "",
      generatedSQL,
    },
  });
}