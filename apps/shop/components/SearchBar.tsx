"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";

type SearchBarProps = {
  initialQuery?: string;
  className?: string;
};

export function SearchBar({ initialQuery = "", className }: SearchBarProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) {
      router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/search");
    }
  }

  return (
    <form onSubmit={onSubmit} className={className} role="search">
      <label className="relative block">
        <span className="sr-only">Search products</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="h-9 w-full rounded-sm border border-input bg-background pl-9 pr-3 text-sm outline-none ring-ring placeholder:text-muted-foreground focus-visible:ring-2"
        />
      </label>
    </form>
  );
}
