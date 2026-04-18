"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { nanoid } from "nanoid";
import { useChatStore } from "@/store/chatStore";
import ChatUi from "@/components/chat-ui/ChatUi";
import { saveMessage } from "@/lib/actions/chat";

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
      body: JSON.stringify({ dbId, message: text,chatId }),
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
    const userMessageId = nanoid();
  
    // ✅ STEP 1: Add user message to UI store (instant feedback)
    addMessage(chatId, {
      id: userMessageId,
      role: "user",
      content: text,
    });
  
    // ✅ STEP 2: Save user message to DATABASE
    await saveMessage({
      chatId,
      role: "user",
      content: text,
    });
  
    // ✅ STEP 3: Generate AI response (will be saved in API route)
    await generateAIResponse(chatId, text);
  };

  useEffect(() => {
    console.log("useeffect is running")
    const { chats } = useChatStore.getState();
    const chat = chats[chatId];
  
    if (!chat) return;
  
    // ✅ Check if this is the first message and it's a user message
    if (chat.messages.length === 1 && chat.messages[0].role === "user") {
      const firstMessage = chat.messages[0];
      
      // ✅ First, save the user message to DB (coming from EmptyUI)
      saveMessage({
        chatId,
        role: "user",
        content: firstMessage.content || "",
      }).then(() => {
        // ✅ Then generate AI response
        generateAIResponse(chatId, firstMessage.content || "");
      });
    }
  }, [chatId]);

  useEffect(() => {
    async function loadChat() {
      const res = await fetch(`/api/chat/${chatId}`);
      const data = await res.json();
  
      const { createChatIfNotExists, setMessages } =
        useChatStore.getState();
  
      createChatIfNotExists(chatId, data.databaseId);
  
      // ✅ Replace messages instead of appending
      setMessages(chatId, data.messages);
    }
  
    loadChat();
  }, [chatId]);
 
  return (
    <ChatUi messages={messages} onSend={handleSend} onRunQuery={()=>{}} />
  );
}
