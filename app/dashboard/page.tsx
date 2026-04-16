
import { getUser } from "@/lib/actions/user";
import { getDatabases } from "@/lib/actions/database";
import EmptyUiPageClient from "./EmptyUiPageClient";

export default async function Page() {
  const user = await getUser();
  if(!user){
    throw new Error("Unauthorized");
  }
  const databases = await getDatabases();

  return (
    <EmptyUiPageClient
      username={user.name || "User"}
      databases={databases}
    />
  );
}