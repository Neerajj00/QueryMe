"use client";

import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import EmptyUi from "@/components/chat-ui/EmptyUi";
import { DatabaseType } from "@/lib/actions/database";
import { useChatStore } from "@/store/chatStore";

type Props = {
  username: string;
  databases: DatabaseType[];
};

export default function EmptyUiPageClient({ username, databases }: Props) {
  const router = useRouter();

  const handleSubmit = async (input: string, dbId: string) => {
    if (!input.trim() || !dbId) return;
  
    const chatId = nanoid();
  
    // ✅ STEP 1: Create Chat in DATABASE first
    const response = await fetch("/api/chat/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chatId,
        databaseId: dbId,
        title: input.slice(0, 50), // First 50 chars as title
      }),
    });
  
    if (!response.ok) {
      console.error("Failed to create chat");
      return;
    }
  
    // ✅ STEP 2: Create chat in Zustand store
    const { createChatIfNotExists, addMessage } = useChatStore.getState();
    createChatIfNotExists(chatId, dbId);
  
    // ✅ STEP 3: Add first user message to store (UI only)
    addMessage(chatId, {
      id: nanoid(),
      role: "user",
      content: input,
    });
  
    // ✅ STEP 4: Navigate to chat page
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