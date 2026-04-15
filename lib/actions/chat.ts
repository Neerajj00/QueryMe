"use server";

import { getUser } from "./user";
import { prisma } from "../prisma";

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
