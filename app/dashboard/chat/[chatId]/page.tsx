import ChatClient from "./ChatClient";
import { Message } from "@/types";

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ chatId: string }>;
  searchParams: Promise<{ first?: string }>;
}) {
  const { chatId } = await params;
  const { first } = await searchParams;

  const messages: Message[] = first
    ? [
        {
          id: crypto.randomUUID(),
          role: "user",
          content: first,
          createdAt: new Date(),
        },
      ]
    : [];

  return <ChatClient chatId={chatId} initialMessages={messages} />;
}