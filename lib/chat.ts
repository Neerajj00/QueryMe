import { nanoid } from "nanoid";
import { useChatStore } from "@/store/chatStore";

export const sendMessage = async ({
  chatId,
  text,
}: {
  chatId: string;
  text: string;
}) => {
  const { addMessage, updateLastMessage } = useChatStore.getState();

  // user message
  addMessage(chatId, {
    id: nanoid(),
    role: "user",
    content: text,
  });

  // assistant placeholder
  addMessage(chatId, {
    id: nanoid(),
    role: "assistant",
    content: "",
  });

  const fakeText = "SELECT * FROM users LIMIT 10;";
  let index = 0;

  const interval = setInterval(() => {
    index++;

    updateLastMessage(chatId, {
      content: fakeText.slice(0, index),
    });

    if (index === fakeText.length) {
      clearInterval(interval);

      updateLastMessage(chatId, {
        generatedSQL: fakeText,
        content: "",
      });
    }
  }, 30);
};