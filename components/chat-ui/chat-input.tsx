"use client";

import type React from "react";

interface ChatInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  disabled?: boolean; // ✅ NEW
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

    if (disabled) return; // ✅ block submit
    if (!value.trim()) return;

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
        className={`w-full px-4 py-3 rounded-full backdrop-blur-sm outline-none
          ${
            disabled
              ? "bg-white/5 text-white/40 cursor-not-allowed"
              : "bg-white/10 text-white focus:ring-1 focus:ring-white/30"
          }`}
      />
    </form>
  );
}