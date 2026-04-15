import ChatUi from "@/components/chat-ui/ChatUi";

export default async function Page({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  return <ChatUi />;
}
