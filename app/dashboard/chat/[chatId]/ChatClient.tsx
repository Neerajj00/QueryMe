"use client";

import { useState } from "react";
import ChatUi from "./ChatUi";
import EmptyUi from "./EmptyUi";
import { generateQuery, runQuery } from "@/lib/actions/query";
import Router from "next/router";


type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  generatedSQL?: string;
  result?: Record<string, unknown>[];
};

type Database = {
  id: string;
  name: string;
  dbType: string;
};

type ChatClientProps = {
  chatId: string | null;
  initialMessages: Message[];
  username: string;
  databases: Database[];
};

export default function ChatClient({
  chatId,
  initialMessages,
  username,
  databases,
}: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const dbId = databases?.[0]?.id;

  async function handleSend(text: string) {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);

    const aiId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        id: aiId,
        role: "assistant",
        content: "Generating SQL...",
      },
    ]);

    const res = await generateQuery(dbId, text);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === aiId
          ? {
              ...m,
              content: "Here is your SQL:",
              generatedSQL: res.generatedSQL,
            }
          : m
      )
    );
  }

  async function handleRun(msgId: string, sql: string) {
    const res = await runQuery(dbId, sql);

    setMessages((prev) =>
      prev.map((m) =>
        m.id === msgId
          ? {
              ...m,
              result: "rows" in res ? res.rows : [],
            }
          : m
      )
    );
  }

  if (messages.length === 0) {
    return (
      <EmptyUi
        username={username}
        onSend={handleSend}
        databases={databases}
      />
    );
  }

  return (
    <ChatUi
      messages={messages}
      onSend={handleSend}
      onRunQuery={handleRun}
    />
  );
}