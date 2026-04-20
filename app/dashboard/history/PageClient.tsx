"use client";

import Link from "next/link";
import { useTransition } from "react";
import { deleteChat, getChatHistory } from "@/lib/actions/chat";
import { formatDate } from "@/lib/date";
import { useConfirmDialog } from "@/hooks/UseConfirmDialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

type Chat = Awaited<ReturnType<typeof getChatHistory>>[number];

export default function PageClient({ chats }: { chats: Chat[] }) {
  const [isPending, startTransition] = useTransition();
  const confirm = useConfirmDialog();
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();

    const ok = await confirm({
      title: "Delete this chat?",
      description: "This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!ok) return;

    startTransition(async () => {
      try {
        const res = await deleteChat(id);
        if (!res?.success) throw new Error("Delete failed");

        toast.success("Chat deleted");
        router.refresh();
      } catch (err: any) {
        toast.error(err.message || "Something went wrong");
      }
    });
  }

  if (!chats.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No chats yet
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {chats.map((chat) => (
          <Link
            key={chat.id}
            href={`/dashboard/chat/${chat.id}`}
            className="group flex items-center justify-between
                       rounded-xl border px-4 py-3
                       hover:bg-muted/50 hover:shadow-sm transition"
          >
            {/* LEFT */}
            <div className="flex flex-col min-w-0">
              
              {/* Title */}
              <span className="text-sm font-medium truncate">
                {chat.title || "Untitled Chat"}
              </span>

              {/* Meta Row */}
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                
                {/* DB Badge with Logo */}
                {getDatabaseBadge(chat.database)}

                <span>•</span>

                {/* Last activity */}
                <span>{formatDate(chat.updatedAt)}</span>

              </div>
            </div>

            {/* RIGHT */}
            <button
              onClick={(e) => handleDelete(e, chat.id)}
              disabled={isPending}
              className="p-2 rounded-md text-muted-foreground
                         hover:text-red-500 hover:bg-red-50 transition"
            >
              <Trash2 size={16} />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------------- DB Badge ---------------- */

function getDatabaseBadge(db?: {
  name: string;
  dbType: string;
} | null) {
  const base =
    "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium";

  if (!db) {
    return (
      <span className={`${base} bg-gray-100 text-gray-600`}>
        No DB
      </span>
    );
  }

  const type = db.dbType.toLowerCase();

  if (type.includes("mysql")) {
    return (
      <span className={`${base} bg-blue-100 text-blue-700`}>
        🐬 {db.name}
      </span>
    );
  }

  if (type.includes("postgres")) {
    return (
      <span className={`${base} bg-indigo-100 text-indigo-700`}>
        🐘 {db.name}
      </span>
    );
  }

  return (
    <span className={`${base} bg-gray-100 text-gray-600`}>
      {db.name}
    </span>
  );
}