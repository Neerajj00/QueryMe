import ChatClient from "./chat/[chatId]/ChatClient";

export default function Page() {
  return <ChatClient chatId={null} initialMessages={[]} />;
}