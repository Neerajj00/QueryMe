"use client";

import { useState } from "react";
import { Message } from "@/types";
import EmptyUi from "./EmptyUi";
import ChatUi from "./ChatUi";

type Database = {
  id: string;
  name: string;
  dbType: string;
};

export default function ChatClient({
  chatId,
  initialMessages,
  username,
  databases,
}: {
  chatId: string | null;
  initialMessages: Message[];
  username: string;
  databases?: Database[];
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  function handleSend(text: string, dbId: string) {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      createdAt: new Date(),
    };
  
    console.log("Query DB:", dbId); // 👈 now you know
  
    setMessages((prev) => [...prev, userMsg]);
  }
  
  // 🟢 NEW CHAT
  if (!chatId) {
    return (
      <EmptyUi
        username={username}
        onSend={handleSend}
        databases={databases || []}
      />
    );
  }

  // 🔵 EXISTING CHAT
  return <ChatUi messages={messages} onSend={handleSend} />;
}