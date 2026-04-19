"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { nanoid } from "nanoid";
import { useChatStore } from "@/store/chatStore";
import ChatUi from "@/components/chat-ui/ChatUi";
import { saveMessage } from "@/lib/actions/chat";
import { runQuery } from "@/lib/actions/query";

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
    }
    // 🔥 VALIDATE AFTER STREAM COMPLETE
    const cleanSQL = aiText.trim();

    const isValid =
      cleanSQL === "INVALID_QUERY"
        ? false
        : cleanSQL.toLowerCase().startsWith("select");

    updateLastMessage(chatId, {
      generatedSQL: isValid ? cleanSQL : "INVALID_QUERY",
    });  
      

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


  // 🔥 RUN QUERY (BLOCK INVALID)
  const handleQueryRun = async (messageId: string, sql: string) => {
    const { chats, updateMessage } = useChatStore.getState();

    const chat = chats[chatId];
    if (!chat) return;

    const dbId = chat.dbId;

    try {
      // 🚫 BLOCK INVALID QUERY
      if (
        sql === "INVALID_QUERY" ||
        !sql.toLowerCase().startsWith("select")
      ) {
        updateMessage(chatId, messageId, {
          result: { error: "Invalid or unrelated query" },
        });
        return;
      }

      const result = await runQuery(dbId, sql);

      updateMessage(chatId, messageId, {
        result,
      });
    } catch (err: any) {
      console.error(err);

      updateMessage(chatId, messageId, {
        result: {
          error: err?.message || "Query failed",
        },
      });
    }
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
      const { chats } = useChatStore.getState();
      const existingChat = chats[chatId];
  
      // ✅ prevent overwrite
      if (existingChat && existingChat.messages.length > 0) return;
  
      const res = await fetch(`/api/chat/${chatId}`);
      const data = await res.json();
  
      const { createChatIfNotExists, setMessages } =
        useChatStore.getState();
  
      createChatIfNotExists(chatId, data.databaseId);
      setMessages(chatId, data.messages);
    }
  
    loadChat();
  }, [chatId]);
 
  return (
    <ChatUi messages={messages} onSend={handleSend} onRunQuery={handleQueryRun} />
  );
}