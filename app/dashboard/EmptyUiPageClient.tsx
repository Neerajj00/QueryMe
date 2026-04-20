"use client";

import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import EmptyUi from "@/components/chat-ui/EmptyUi";
import { getDatabases } from "@/lib/actions/database";
import { useChatStore } from "@/store/chatStore";

type Databases = Awaited<ReturnType<typeof getDatabases>>;

type Props = {
  username: string;
  databases: Databases;
};

export default function EmptyUiPageClient({ username, databases }: Props) {
  const router = useRouter();

  const handleSubmit = async (input: string, dbId: string) => {
    if (!input.trim() || !dbId) return;

    const chatId = nanoid();

    const response = await fetch("/api/chat/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId,
        databaseId: dbId,
        title: input.slice(0, 50),
      }),
    });

    if (!response.ok) {
      console.error("Failed to create chat");
      return;
    }

    const { createChatIfNotExists, addMessage } =
      useChatStore.getState();

    createChatIfNotExists(chatId, dbId);

    addMessage(chatId, {
      id: nanoid(),
      role: "user",
      content: input,
    });

    router.push(`/dashboard/chat/${chatId}`);
  };

  return (
    <EmptyUi
      username={username}
      databases={databases}
      onSend={handleSubmit}
    />
  );
}