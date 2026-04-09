import { getUser } from "@/lib/actions/user";
import ChatClient from "./chat/[chatId]/ChatClient";

export default async function Page() {
  
  const user = await getUser();

  return <ChatClient chatId={null} username={user?.name || "User"} initialMessages={[]} />;
}