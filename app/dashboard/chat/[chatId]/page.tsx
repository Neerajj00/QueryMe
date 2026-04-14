import { getUser } from "@/lib/actions/user";
import ChatClient from "./ChatClient";
import { getMessagesByChatId } from "@/lib/actions/chat";

export default async function Page({
  params,
}: {
  params: { chatId: string };
}) {
  const { chatId } = params;

  const user = await getUser();

  const messages = await getMessagesByChatId(chatId);

  return (
    <ChatClient
      chatId={chatId}
      initialMessages={messages}
      username={user?.name || "User"}
    />
  );
}