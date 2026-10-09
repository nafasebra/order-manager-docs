import { useContext, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { TableSortContext } from "@/components/patterns/tableSortContext";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  exportToCsv,
  exportToPdf,
  type ExportColumn,
  type ExportValue,
} from "@/lib/export";

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
  /** Set false for tables that should not offer downloads. */
  exports?: false | {
    filename?: string;
    title?: string;
    columns?: readonly ExportColumn<TData>[];
  };
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
  exports = {},
}: DataTableProps<TData>) {
  const [exporting, setExporting] = useState(false);
  const remote = useContext(TableSortContext);
  const [localSorting, setLocalSorting] = useState<SortingState>([]);
  const currentSorting =
    sorting ??
    (remote
      ? remote.sort
        ? [
            {
              id: remote.sort.replace(/^-/, ""),
              desc: remote.sort.startsWith("-"),
            },
          ]
        : []
      : localSorting);
  const changeSorting: OnChangeFn<SortingState> =
    onSortingChange ??
    ((updater) => {
      const next =
        typeof updater === "function" ? updater(currentSorting) : updater;
      if (remote)
        remote.setSort(
          next.length ? `${next[0].desc ? "-" : ""}${next[0].id}` : undefined,
        );
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
    defaultColumn: {
      sortingFn: (a, b, id) => {
        const av = a.getValue<unknown>(id);
        const bv = b.getValue<unknown>(id);
        if (av == null || av === "") return bv == null || bv === "" ? 0 : 1;
        if (bv == null || bv === "") return -1;
        if (typeof av === "number" && typeof bv === "number") return av - bv;
        if (typeof av === "boolean" && typeof bv === "boolean")
          return Number(av) - Number(bv);
        return String(av).localeCompare(String(bv), undefined, {
          numeric: true,
          sensitivity: "base",
        });
      },
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const exportColumns: readonly ExportColumn<TData>[] = exports === false
    ? []
    : exports.columns ?? table.getVisibleLeafColumns()
      .filter((column) => Boolean(column.accessorFn))
      .map((column) => ({
        header: typeof column.columnDef.header === "string"
          ? column.columnDef.header
          : column.id,
        value: (original: TData): ExportValue => {
          const row = table.getRowModel().rows.find((item) => item.original === original);
          const value = row?.getValue<unknown>(column.id);
          // Never serialize hidden record fields, React elements, or objects.
          return value == null || typeof value === "string" ||
            typeof value === "number" || typeof value === "boolean"
            ? value as ExportValue
            : "";
        },
      }));
  const exportDisabled = Boolean(isLoading || exporting ||
    !table.getRowModel().rows.length || !exportColumns.length);

  async function download(format: "csv" | "pdf") {
    if (exports === false || exportDisabled) return;
    setExporting(true);
    try {
      const path = window.location.pathname.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "");
      const options = {
        filename: exports.filename ?? `${path || "table"}-current-page`,
        rows: table.getRowModel().rows.map((row) => row.original),
        columns: exportColumns,
      };
      if (format === "csv") exportToCsv(options);
      else await exportToPdf({
        ...options,
        title: exports.title ?? "Table export",
        description: "Current page only, in the displayed sort order. Values are exported from the underlying table data.",
        orientation: exportColumns.length > 5 ? "landscape" : "portrait",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not export table.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className={cn("rounded-md border border-border bg-card", className)}>
      {exports !== false && exportColumns.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-3">
          <p className="text-xs text-muted-foreground">Export current page</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" disabled={exportDisabled} onClick={() => void download("csv")}>
              Export CSV
            </Button>
            <Button type="button" variant="outline" size="sm" disabled={exportDisabled} onClick={() => void download("pdf")}>
              Export PDF
            </Button>
          </div>
        </div>
      )}
      <Table className={dense ? "text-[13px]" : undefined}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  aria-sort={
                    header.column.getCanSort()
                      ? header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 py-2 text-left"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUp className="h-3 w-3 shrink-0" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDown className="h-3 w-3 shrink-0" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 shrink-0 opacity-50" />
                      )}
                    </button>
                  ) : (
                    flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )
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
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (event) => {
                          if (
                            event.target === event.currentTarget &&
                            (event.key === "Enter" || event.key === " ")
                          ) {
                            event.preventDefault();
                            onRowClick(row.original);
                          }
                        }
                      : undefined
                  }
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
