// app/dashboard/history/page.tsx

import { getChatHistory } from "@/lib/actions/chat";
import PageClient from "./PageClient";

export default async function HistoryPage() {
  const chats = await getChatHistory();

  return <PageClient chats={chats} />;
}