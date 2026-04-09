"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ChatUi from "./ChatUi";
import { Message } from "@/types";
import EmptyUi from "./EmptyUi";

export default function ChatClient({
  chatId,
  initialMessages,
  username
}: {
  chatId: string | null;
  initialMessages: Message[];
  username: string;
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  function handleSend(text: string) {
    // 🔥 FIRST MESSAGE
    if (!chatId) {
      const newChatId = crypto.randomUUID();

      router.push(
        `/dashboard/chat/${newChatId}?first=${encodeURIComponent(text)}`
      );
      return;
    }

    // 🔥 EXISTING CHAT
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // fake assistant reply
    setTimeout(() => {
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Fake AI response",
        createdAt: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 500);
  }

  if (messages.length === 0) {
    return <EmptyUi onSend={handleSend} username = {username} />;
  }

  return <ChatUi messages={messages} onSend={handleSend} />;
}