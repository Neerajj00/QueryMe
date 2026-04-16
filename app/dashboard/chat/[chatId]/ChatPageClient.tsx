"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { nanoid } from "nanoid";
import { useChatStore } from "@/store/chatStore";
import ChatUi from "@/components/chat-ui/ChatUi";

export default function ChatPageClient() {
  const params = useParams();
  const chatId = Array.isArray(params.chatId)
    ? params.chatId[0]
    : params.chatId!;

  const chat = useChatStore((s) => s.chats[chatId]);
  const messages = chat?.messages ?? [];

  async function generateAIResponse(chatId: string, text: string) {
    const { chats, addMessage, updateLastMessage } = useChatStore.getState();
  
    const chat = chats[chatId];
    if (!chat) return;
  
    const dbId = chat.dbId;
  
    // ✅ assistant placeholder
    addMessage(chatId, {
      id: nanoid(),
      role: "assistant",
      generatedSQL: "",
    });
  
    const res = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({ dbId, message: text }),
    });
  
    if (!res.body) return;
  
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
  
    let aiText = "";
  
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
  
      const chunk = decoder.decode(value);
      aiText += chunk;
  
      updateLastMessage(chatId, {
        generatedSQL: aiText,
      });
    }
  }
  const handleSend = async (text: string) => {
    if (!text.trim()) return;
  
    const { addMessage } = useChatStore.getState();
  
    // ✅ UI responsibility
    addMessage(chatId, {
      id: nanoid(),
      role: "user",
      content: text,
    });
  
    // ✅ AI responsibility
    await generateAIResponse(chatId, text);
  };


  useEffect(() => {
    const { chats } = useChatStore.getState();
    const chat = chats[chatId];
  
    if (!chat) return;
  
    if (chat.messages.length === 1) {
      const firstMessage = chat.messages[0];
  
      if (firstMessage.role === "user") {
        generateAIResponse(chatId, firstMessage.content || "");
      }
    }
  }, [chatId]);
 
  return (
    <ChatUi messages={messages} onSend={handleSend} onRunQuery={() => {}} />
  );
}
