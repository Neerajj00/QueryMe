export type Role = "user" | "assistant";

export interface Message {
  id: string;              // make this required
  role: Role;
  content: string;
  createdAt: Date;        // also make required for consistency
}

export interface Chat {
  id: string;
  title?: string;
  createdAt: Date;
}

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;

  // AI generated SQL
  generatedSQL?: string;

  // query result
  result?: Record<string, any>[];

  // loading states
  isLoading?: boolean;
};