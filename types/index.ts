export type Role = "user" | "assistant";

export interface Message {
  id?: string;
  role: Role;
  content: string;
  createdAt?: Date;
}

export interface Chat {
  id: string;
  title?: string;
  createdAt?: Date;
}