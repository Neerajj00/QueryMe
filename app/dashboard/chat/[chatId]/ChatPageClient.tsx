"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { nanoid } from "nanoid";
import { Message, useChatStore } from "@/store/chatStore";
import ChatUi from "@/components/chat-ui/ChatUi";
import { saveMessage } from "@/lib/actions/chat";
import { runQuery } from "@/lib/actions/query";
import { Loader } from "lucide-react";

export default function ChatPageClient() {
  const [isSending, setIsSending] = useState(false);

  const params = useParams();
  const chatId = Array.isArray(params.chatId)
    ? params.chatId[0]
    : params.chatId!;

  const chat = useChatStore((s) => s.chats[chatId]);
  const messages:Message[] = chat?.messages ?? [];

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
    if (!text.trim() || isSending) return; // 🔥 BLOCK
  
    setIsSending(true);
  
    try {
      const { addMessage } = useChatStore.getState();
  
      const userMessageId = nanoid();
  
      // user message
      addMessage(chatId, {
        id: userMessageId,
        role: "user",
        content: text,
      });
  
      await saveMessage({
        chatId,
        role: "user",
        content: text,
      });
  
      await generateAIResponse(chatId, text);
    } finally {
      setIsSending(false); // 🔥 release lock
    }
  };


  // to run SQL query when user clicks the run button next to generated SQL
  const handleQueryRun = async (messageId: string, sql: string) => {
    const { chats, updateMessage } = useChatStore.getState();
  
    const chat = chats[chatId];
    if (!chat) return;
  
    const dbId = chat.dbId;
  
    try {
      // 🔥 run query (server action)
      const result = await runQuery(
        dbId,
        sql,
      );
      console.log("result",result)
      // ✅ update message with result
      updateMessage(chatId, messageId, {
        result,
      });
    } catch (err: any) {
      console.error(err);
  
      // ❌ handle error
      updateMessage(chatId, messageId, {
        result: {
          error: err?.message || "Query failed",
        },
      });
    }
  };


  // to handle the case when user sends the first message from EmptyUI and lands on this page,
  // we need to save that message to DB and then generate AI response
  useEffect(() => {
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



  
  
  // to load chat messages on page load or when chatId changes
  const [loadingChat, setLoadingChat] = useState(false);
  useEffect(() => {
    let isMounted = true; // 🔥 prevents state update after unmount
  
    async function loadChat() {
      setLoadingChat(true);
  
      try {
        const res = await fetch(`/api/chat/${chatId}`);
        const data = await res.json();
  
        if (!isMounted) return;
  
        const { createChatIfNotExists, setMessages } =
          useChatStore.getState();
  
        createChatIfNotExists(chatId, data.databaseId);
  
        // ✅ Replace messages (correct)
        setMessages(chatId, data.messages);
      } catch (err) {
        console.error("Failed to load chat:", err);
      } finally {
        if (isMounted) setLoadingChat(false);
      }
    }
  
    loadChat();
  
    return () => {
      isMounted = false; // 🔥 cleanup
    };
  }, [chatId]);

  // centrally aligned loader
  if(loadingChat) {
    return <Loader className="animate-spin mx-auto mt-10" />
  }

 
  return (
    <ChatUi messages={messages} onSend={handleSend} onRunQuery={handleQueryRun} isSending={isSending} />
  );
}
