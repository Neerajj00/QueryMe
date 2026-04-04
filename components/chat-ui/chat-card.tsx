"use client";

import { useState } from "react";
import { SnowflakeIcon } from "@/components/icons/snowflake-icon";
import { ChatInput } from "./chat-input";
import { InputControls } from "./input-controls";
import { SuggestionBadges } from "./suggestion-badges";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ChatCardProps {
  userName?: string;
  onBackgroundChange?: (imageUrl: string) => void;
  onResetBackground?: () => void;
}

export function ChatCard({
  userName = "Juan",
  onBackgroundChange,
  onResetBackground,
}: ChatCardProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSuggestionSelect = (suggestion: {
    id: string;
    label: string;
  }) => {
    setInputValue(suggestion.label);
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
      <div className="flex flex-col gap-6 items-center">
        {/* Header with logo and greeting */}
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-2">
            <p>&gt;_</p>
            <p className="text-sm text-white/80">Hello {userName}!</p>
          </div>
          <div>
            <Select>
              <SelectTrigger className="w-35 h-2 text-xs bg-white/10 border-white/20">
                <SelectValue placeholder="Select DB" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="db1">Database 1</SelectItem>
                <SelectItem value="db2">Database 2</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Input section */}
        <div className="flex w-full flex-col gap-1">
          <ChatInput
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={setInputValue}
          />
          <InputControls />
        </div>

        {/* Suggestions */}
        <SuggestionBadges
          suggestions={DEFAULT_SUGGESTIONS}
          onSelect={handleSuggestionSelect}
        />
      </div>
    </div>
  );
}

const DEFAULT_SUGGESTIONS = [
  { id: "1", label: "Write an email" },
  { id: "2", label: "Summarize a document" },
  { id: "3", label: "Generate code" },
];
