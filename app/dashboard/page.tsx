
import { getUser } from "@/lib/actions/user";
import { getDatabases } from "@/lib/actions/database";
import EmptyUi from "@/components/chat-ui/EmptyUi";

export default async function Page() {
  const user = await getUser();
  const databases = await getDatabases(); // 🔥 HERE

  return (
    <EmptyUi
    username={user?.name || "User"}
    databases={databases}
    />
  );
}