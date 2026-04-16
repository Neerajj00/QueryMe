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
  
    const { createChatIfNotExists, addMessage } = useChatStore.getState();
  
    // ✅ create chat WITH dbId
    createChatIfNotExists(chatId, dbId);
  
    // ✅ add first message
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