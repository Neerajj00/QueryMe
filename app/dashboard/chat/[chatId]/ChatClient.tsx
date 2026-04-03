"use client";
import { Message } from "@/types";
import { useState } from "react";
import EmptyUi from "./EmptyUi";
import ChatUi from "./ChatUi";

interface Props {
  chatId: string;
  initialMessages: Message[];
}

export default function ChatClient({ chatId, initialMessages }: Props) {

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  //   async function handleSend(text: string) {
  //     const userMsg: Message = {
  //       role: "user",
  //       content: text,
  //     };

  //     const isFirstMessage = messages.length === 0;

  //     // UI update
  //     setMessages((prev) => [...prev, userMsg]);

  //     try {
  //       if (isFirstMessage) {
  //         await createChatIfNotExists(chatId);
  //       }

  //       const aiReply = await sendMessage(chatId, text);

  //       setMessages((prev) => [...prev, aiReply]);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   }

  if (messages.length === 0) return <EmptyUi onSend={()=> console.log("send")} />;
  return <ChatUi messages={messages} onSend={()=> console.log("send")} />;
}
