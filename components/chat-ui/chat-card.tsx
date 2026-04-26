"use client";

import { useState } from "react";
import { ChatInput } from "./chat-input";
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
  onSend: (text: string, dbId: string) => void;
}

export function ChatCard({
  userName,
  databases,
  onSend,
}: ChatCardProps) {
  const [inputValue, setInputValue] = useState("");
  const [selectedDb, setSelectedDb] = useState<string | null>(null);

  const handleSendMessage = (value: string) => {
    if (!value.trim() || !selectedDb) return;

    onSend(value, selectedDb);
    setInputValue("");
  };

  const handleSuggestionSelect = (suggestion: {
    id: string;
    label: string;
  }) => {
    if (!selectedDb) return;
    setInputValue(suggestion.label);
  };

  return (
    <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col items-center gap-6">
        {/* Header */}
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <p className="font-mono text-primary">&gt;_</p>
            <p className="text-sm text-muted-foreground">
              Hello {userName}!
            </p>
          </div>

          <Select onValueChange={setSelectedDb}>
            <SelectTrigger className="h-9 w-44">
              <SelectValue placeholder="Select Database" />
            </SelectTrigger>

            <SelectContent>
              {databases.length > 0 ? (
                databases.map((db) => (
                  <SelectItem key={db.id} value={db.id}>
                    {db.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>
                  No databases found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Input Section */}
        <div className="flex w-full flex-col gap-3">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            disabled={!selectedDb}
            placeholder={
              selectedDb
                ? "Ask me anything about your database..."
                : "Select a database first..."
            }
          />

          <div className="flex items-center justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-full"
              onClick={() => handleSendMessage(inputValue)}
              disabled={!selectedDb || !inputValue.trim()}
            >
              <SendHorizonal className="h-4 w-4" />
            </Button>
          </div>

          {!selectedDb && (
            <p className="px-1 text-xs text-muted-foreground">
              Select a database to begin querying.
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
  {
    id: "1",
    label: "Show all tables in the database",
  },
  {
    id: "2",
    label: "Count total number of records",
  },
  {
    id: "3",
    label: "Get first 10 records from a table",
  },
];