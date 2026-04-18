import { create } from "zustand";

type Message = {
  id: string;
  role: "user" | "assistant";
  content?: string;
  generatedSQL?: string;
};

type Chat = {
  id: string;
  dbId: string; // 🔥 add this
  messages: Message[];
};

type ChatStore = {
  chats: Record<string, Chat>;

  createChatIfNotExists: (chatId: string, dbId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  setMessages: (chatId: string, messages: Message[]) => void;
  updateLastMessage: (chatId: string, updates: Partial<Message>) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  // ✅ MUST EXIST
  chats: {},

  createChatIfNotExists: (chatId, dbId) =>
    set((state) => {
      if (state.chats[chatId]) return state;

      return {
        chats: {
          ...state.chats,
          [chatId]: {
            id: chatId,
            dbId, // 🔥 STORE IT HERE
            messages: [],
          },
        },
      };
    }),
    addMessage: (chatId, message) =>
      set((state) => {
        const existing = state.chats[chatId]?.messages || [];
    
        if (existing.find((m) => m.id === message.id)) {
          return state; // ✅ skip duplicate
        }
    
        return {
          chats: {
            ...state.chats,
            [chatId]: {
              ...state.chats[chatId],
              messages: [...existing, message],
            },
          },
        };
      }),
    setMessages: (chatId, messages) =>
      set((state) => ({
        chats: {
          ...state.chats,
          [chatId]: {
            ...state.chats[chatId],
            messages,
          },
        },
      })),

  updateLastMessage: (chatId, updates) =>
    set((state) => {
      const chat = state.chats[chatId];
      if (!chat) return state;

      const messages = [...chat.messages];
      const lastIndex = messages.length - 1;

      if (lastIndex < 0) return state;

      messages[lastIndex] = {
        ...messages[lastIndex],
        ...updates,
      };

      return {
        chats: {
          ...state.chats,
          [chatId]: {
            ...chat,
            messages,
          },
        },
      };
    }),
}));
