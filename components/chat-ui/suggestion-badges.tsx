"use client";

interface Suggestion {
  id: string;
  label: string;
}

interface SuggestionBadgesProps {
  suggestions: Suggestion[];
  onSelect?: (suggestion: Suggestion) => void;
}

export function SuggestionBadges({
  suggestions,
  onSelect,
}: SuggestionBadgesProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          type="button"
          onClick={() => onSelect?.(suggestion)}
          className="
            rounded-full border border-border
            bg-muted px-3 py-1.5
            text-xs text-muted-foreground
            transition-all duration-200
            hover:bg-accent
            hover:text-accent-foreground
            hover:border-primary/30
            active:scale-95
          "
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}