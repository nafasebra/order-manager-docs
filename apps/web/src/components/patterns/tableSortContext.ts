import { createContext } from "react";
export const TableSortContext = createContext<{
  sort?: string;
  setSort: (sort?: string) => void;
} | null>(null);
