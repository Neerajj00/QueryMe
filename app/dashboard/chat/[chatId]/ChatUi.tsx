import { Message } from "@/types";

export default function ChatUi({
  messages,
  onSend,
}: {
  messages: Message[];
  onSend: (text: string) => void;
}) {
  return (
    <div className="p-4">
      <div className="space-y-2">
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>

      <input
        className="border p-2 mt-4"
        placeholder="Type..."
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSend(e.currentTarget.value);
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
}