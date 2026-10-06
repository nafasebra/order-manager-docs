import { useContext, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableSortContext } from "@/components/patterns/TableSortProvider";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  isLoading?: boolean;
  dense?: boolean;
  onRowClick?: (row: TData) => void;
  emptyMessage?: string;
  className?: string;
};

export function DataTable<TData>({
  columns,
  data,
  pageCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  isLoading,
  dense,
  onRowClick,
  emptyMessage = "No results.",
  className,
}: DataTableProps<TData>) {
  const remote = useContext(TableSortContext);
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const currentSorting = sorting ?? (remote ? (remote.sort ? [{ id: remote.sort.replace(/^-/, ""), desc: remote.sort.startsWith("-") }] : []) : localSorting);
  const changeSorting: OnChangeFn<SortingState> = onSortingChange ?? ((updater) => {
    const next = typeof updater === "function" ? updater(currentSorting) : updater;
    if (remote) remote.setSort(next.length ? `${next[0].desc ? "-" : ""}${next[0].id}` : undefined);
    else setLocalSorting(next);
  });
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting: currentSorting,
    },
    onPaginationChange,
    onSortingChange: changeSorting,
    manualPagination: true,
    manualSorting: Boolean(remote),
    enableMultiSort: false,
    sortDescFirst: false,
    defaultColumn: { sortingFn: (a, b, id) => {
      const av = a.getValue<unknown>(id);
      const bv = b.getValue<unknown>(id);
      if (av == null || av === "") return bv == null || bv === "" ? 0 : 1;
      if (bv == null || bv === "") return -1;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      if (typeof av === "boolean" && typeof bv === "boolean") return Number(av) - Number(bv);
      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
    } },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={cn("rounded-md border border-border bg-card", className)}>
      <Table className={dense ? "text-[13px]" : undefined}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} aria-sort={header.column.getCanSort() ? (header.column.getIsSorted() === "asc" ? "ascending" : header.column.getIsSorted() === "desc" ? "descending" : "none") : undefined}>
                  {header.isPlaceholder
                    ? null
                    : header.column.getCanSort() ? <button type="button" className="flex w-full items-center gap-2 py-2 text-left" onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? <ArrowUp className="h-3 w-3 shrink-0" /> : header.column.getIsSorted() === "desc" ? <ArrowDown className="h-3 w-3 shrink-0" /> : <ArrowUpDown className="h-3 w-3 shrink-0 opacity-50" />}
                      </button> : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={`skeleton-${i}`}>
                  {columns.map((_, j) => (
                    <TableCell key={`skeleton-${i}-${j}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}
          {!isLoading && table.getRowModel().rows.length
            ? table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : null}
          {!isLoading && !table.getRowModel().rows.length ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
