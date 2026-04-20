"use client";

import { useState } from "react";
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
import { Button } from "../ui/button";
import { SendHorizonal } from "lucide-react";

interface ChatCardProps {
  userName?: string;
  databases: any[];
  onSend: (text: string, dbId: string) => void; // ✅ UPDATED
}

export function ChatCard({ userName, databases, onSend }: ChatCardProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedDb, setSelectedDb] = useState<string | null>(null);

  const handleSendMessage = (value: string) => {
    if (!value.trim() || !selectedDb) return;

    onSend(value, selectedDb); // ✅ send dbId also
    setInputValue("");
  };

  const handleSuggestionSelect = (suggestion: {
    id: string;
    label: string;
  }) => {
    if (!selectedDb) return; // ❌ block suggestions too
    setInputValue(suggestion.label);
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md">
      <div className="flex flex-col gap-6 items-center">
        {/* Header */}
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-2">
            <p>&gt;_</p>
            <p className="text-sm text-white/80">Hello {userName}!</p>
          </div>

          {/* DB Select */}
          <Select onValueChange={(value) => setSelectedDb(value)}>
            <SelectTrigger className="w-40 h-8 text-xs bg-white/10 border-white/20">
              <SelectValue placeholder="Select DB" />
            </SelectTrigger>

            <SelectContent>
              {(databases ?? []).length > 0 ? (
                (databases ?? []).map((db) => (
                  <SelectItem key={db.id} value={db.id}>
                    {db.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No databases
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Input */}
        <div className="flex w-full flex-col gap-1">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            disabled={!selectedDb} // ✅ KEY
            placeholder={
              selectedDb ? "Ask me anything..." : "Select a database first..."
            }
          />
          <div className="flex w-full items-center justify-between px-4">
        
        <div className="flex items-center justify-end w-full gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-white/60 hover:bg-white/10 hover:text-white"
              onClick={() => handleSendMessage(inputValue)}
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>
        </div>
          {/* Hint */}
          {!selectedDb && (
            <p className="text-xs ml-4 text-white/50">
              Please select a database to start querying
            </p>
          )}
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
  { id: "1", label: "Show all tables in the database" },
  { id: "2", label: "Count total number of records" },
  { id: "3", label: "Get first 10 records from a table" },
];
