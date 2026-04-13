
import { getUser } from "@/lib/actions/user";
import { getDatabases } from "@/lib/actions/database";
import ChatClient from "./chat/[chatId]/ChatClient";

export default async function Page() {
  const user = await getUser();
  const databases = await getDatabases(); // 🔥 HERE

  return (
    <ChatClient
      chatId={null}
      initialMessages={[]}
      username={user?.name || "User"}
      databases={databases} // 🔥 PASS
    />
  );
}