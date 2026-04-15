"use client";

import { useRouter } from "next/navigation";
import { nanoid } from "nanoid";
import EmptyUi from "@/components/chat-ui/EmptyUi";
import { DatabaseType } from "@/lib/actions/database";
import { sendMessage } from "@/lib/chat";

type Props = {
  username: string;
  databases: DatabaseType[];
};

export default function EmptyUiPageClient({ username, databases }: Props) {
  const router = useRouter();

  const handleSubmit = async (input:string) => {
    if (!input.trim()) return;
  
    const chatId = nanoid();
  
    await sendMessage({
      chatId,
      text: input,
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