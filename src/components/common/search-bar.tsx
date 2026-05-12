"use client";

import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  placeholder?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function SearchBar({
  value,
  placeholder = "Search carriers by MC, USDOT, or legal name...",
  disabled = false,
  onChange,
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="pr-10 pl-9"
        aria-label="Search carriers"
      />
      {value ? (
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1.5 h-7 px-2 text-xs -translate-y-1/2"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
