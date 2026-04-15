import { ChatCard } from "@/components/chat-ui/chat-card";

interface Database {
  id: string;
  name: string;
  dbType: string;
}

interface EmptyUiProps {
  username: string;
  onSend: (text: string, dbId: string) => void;
  databases: Database[];
}

export default function EmptyUi({
  username,
  onSend,
  databases,
}: EmptyUiProps) {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <ChatCard
        userName={username}
        onSend={onSend}
        databases={databases}
      />
    </div>
  );
}