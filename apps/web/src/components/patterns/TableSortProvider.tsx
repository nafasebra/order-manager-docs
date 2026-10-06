import { createContext, type ReactNode } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

export const TableSortContext = createContext<{
  sort?: string;
  setSort: (sort?: string) => void;
} | null>(null);

export function TableSortProvider({ children }: { children: ReactNode }) {
  const search = useSearch({ strict: false });
  const navigate = useNavigate();
  const paginated = "page" in search && "pageSize" in search;
  return <TableSortContext.Provider value={paginated ? {
    sort: search.sort,
    setSort: (sort) => { void navigate({ search: ((previous: Record<string, unknown>) => ({ ...previous, sort, page: 1 })) as never }); },
  } : null}>{children}</TableSortContext.Provider>;
}
