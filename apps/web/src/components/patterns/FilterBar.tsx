import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FilterBarProps = {
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: ReactNode;
  className?: string;
};

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  children,
  className,
}: FilterBarProps) {
  return (
    <div
      className={cn(
        "mb-4 flex flex-col gap-3 sm:flex-row sm:items-center",
        className,
      )}
    >
      {onSearchChange ? (
        <Input
          value={search ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="max-w-sm"
          aria-label={searchPlaceholder}
        />
      ) : null}
      {children ? (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
