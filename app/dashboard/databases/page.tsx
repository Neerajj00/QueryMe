import { getDatabases } from "@/lib/actions/database";
import PageClient from "./PageClient";


export default async function Page() {
  const databases = await getDatabases();

  return <PageClient databases={databases} />;
}