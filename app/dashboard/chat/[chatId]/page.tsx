import { getUser } from "@/lib/actions/user";
import { Message } from "@/types";
import ChatClient from "./ChatClient";

export default async function Page({
  params,
}: {
  params: { chatId: string };
}) {
  const { chatId } = params;

  const user = await getUser();

  // 🔥 FUTURE: fetch messages using chatId
  const messages: Message[] = [];

  return (
    <ChatClient
      chatId={chatId}
      initialMessages={messages}
      username={user?.name || "User"}
    />
  );
}