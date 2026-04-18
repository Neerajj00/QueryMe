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
  const messages: Message[] = chat?.messages ?? [];

  // 🔥 GENERATE AI RESPONSE (FIXED)
  async function generateAIResponse(chatId: string, text: string) {
    const { chats, addMessage, updateLastMessage } =
      useChatStore.getState();

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
      body: JSON.stringify({ dbId, message: text, chatId }),
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let aiText = "";

    // 🔥 stream full response
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
    if (!text.trim() || isSending) return;

    setIsSending(true);

    try {
      const { addMessage } = useChatStore.getState();

      const userMessageId = nanoid();

      // ✅ user message
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
      setIsSending(false);
    }
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

  // 🔥 HANDLE FIRST MESSAGE
  useEffect(() => {
    const { chats } = useChatStore.getState();
    const chat = chats[chatId];

    if (!chat) return;

    if (chat.messages.length === 1 && chat.messages[0].role === "user") {
      const firstMessage = chat.messages[0];

      saveMessage({
        chatId,
        role: "user",
        content: firstMessage.content || "",
      }).then(() => {
        generateAIResponse(chatId, firstMessage.content || "");
      });
    }
  }, [chatId]);

  // 🔥 LOAD CHAT
  const [loadingChat, setLoadingChat] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadChat() {
      setLoadingChat(true);

      try {
        const res = await fetch(`/api/chat/${chatId}`);
        const data = await res.json();

        if (!isMounted) return;

        const { createChatIfNotExists, setMessages } =
          useChatStore.getState();

        createChatIfNotExists(chatId, data.databaseId);
        setMessages(chatId, data.messages);
      } catch (err) {
        console.error("Failed to load chat:", err);
      } finally {
        if (isMounted) setLoadingChat(false);
      }
    }

    loadChat();

    return () => {
      isMounted = false;
    };
  }, [chatId]);

  if (loadingChat) {
    return <Loader className="animate-spin mx-auto mt-10" />;
  }

  return (
    <ChatUi
      messages={messages}
      onSend={handleSend}
      onRunQuery={handleQueryRun}
      isSending={isSending}
    />
  );
}