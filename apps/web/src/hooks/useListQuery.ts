import type { ListParams } from "@/types";

/** Route search is the source of truth, including browser back/forward. */
export function useListQuery(
  search: ListParams,
  onSearchChange: (next: { q?: string; page?: number }) => void,
) {
  return [
    String(search.q ?? ""),
    (q: string) => onSearchChange({ q: q || undefined, page: 1 }),
  ] as const;
}
