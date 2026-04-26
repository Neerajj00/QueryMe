"use client";

import type React from "react";

interface ChatInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  disabled?: boolean;
}

export function ChatInput({
  placeholder = "Ask me anything...",
  value: externalValue,
  onChange: externalOnChange,
  onSubmit,
  disabled = false,
}: ChatInputProps) {
  const value = externalValue ?? "";

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (disabled || !value.trim()) return;
    onSubmit?.(value);
  };

  return (
    <form onSubmit={handleFormSubmit} className="w-full">
      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => externalOnChange?.(e.target.value)}
        placeholder={placeholder}
        className="
          w-full rounded-full px-4 py-3 outline-none border transition-all duration-200

          bg-white text-slate-900 border-slate-200
          placeholder:text-slate-400
          shadow-sm

          focus:border-slate-400
          focus:ring-2 focus:ring-slate-200

          dark:bg-white/10
          dark:text-white
          dark:border-white/20
          dark:placeholder:text-white/50
          dark:backdrop-blur-md
          dark:focus:border-white/40
          dark:focus:ring-white/20

          disabled:cursor-not-allowed
          disabled:bg-slate-100
          disabled:text-slate-400
          disabled:border-slate-200

          dark:disabled:bg-white/5
          dark:disabled:text-white/40
          dark:disabled:border-white/10
        "
      />
    </form>
  );
}