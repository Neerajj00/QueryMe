"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

type Chat = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  database?: {
    name: string;
  } | null;
};

export default function PageClient({ chats }: { chats: Chat[] }) {
  if (!chats.length) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No chats yet
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 p-4">
      {chats.map((chat) => (
        <Link href={`/dashboard/chat/${chat.id}`} key={chat.id}>
            <Card className="hover:shadow-lg transition cursor-pointer">
                <CardContent className="p-4">
                    <div className="text-sm font-semibold truncate">
                    {chat.title}
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                    <span>{chat.database?.name || "No DB"}</span>
                    <span>
                        {new Date(chat.createdAt).toLocaleDateString()}
                    </span>
                    </div>
                </CardContent>
            </Card>
        </Link>
      ))}
    </div>
  );
}