"use client";

import { useParams } from "next/navigation";
import { useChatStore } from "@/store/chatStore";
import ChatUi from "@/components/chat-ui/ChatUi";
import { sendMessage } from "@/lib/chat";

export default function ChatPageClient() {
  const params = useParams();
  const chatId = params?.chatId as string;

  const chat = useChatStore((s) => s.chats[chatId]);
  const messages = chat?.messages ?? [];

  console.log("chatId", chatId);
  console.log("chat", chat);

  const handleSend = async (text: string) => {
    console.log("SENDING MESSAGE", text);
    if (!text.trim()) return;

    await sendMessage({
      chatId,
      text,
    });
  };

  return (
    <ChatUi
      messages={messages}
      onSend={handleSend}
      onRunQuery={() => {}}
    />
  );
}