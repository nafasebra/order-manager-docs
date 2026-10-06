import { useState, type ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/patterns/DataTable";
import { cn } from "@/lib/utils";

export type ChartRange = "7d" | "30d" | "90d";

type TableColumn = { key: string; label: string };
type TableRowData = Record<string, string | number>;

type ChartCardProps = {
  title: string;
  description?: string;
  range?: ChartRange;
  onRangeChange?: (range: ChartRange) => void;
  showRange?: boolean;
  tableColumns?: TableColumn[];
  tableRows?: TableRowData[];
  className?: string;
  children: ReactNode;
};

export function ChartCard({
  title,
  description,
  range = "30d",
  onRangeChange,
  showRange,
  tableColumns,
  tableRows,
  className,
  children,
}: ChartCardProps) {
  const [showTable, setShowTable] = useState(false);
  const hasFallback = Boolean(tableColumns?.length && tableRows?.length);

  return (
    <Card className={cn(className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {hasFallback ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTable((v) => !v)}
            >
              {showTable ? "Chart" : "Table"}
            </Button>
          ) : null}
          {showRange ? (
            <Select
              value={range}
              onValueChange={(v) => onRangeChange?.(v as ChartRange)}
            >
              <SelectTrigger className="h-8 w-[100px]" aria-label="Date range">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">7D</SelectItem>
                <SelectItem value="30d">30D</SelectItem>
                <SelectItem value="90d">90D</SelectItem>
              </SelectContent>
            </Select>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        {showTable && hasFallback ? (
          <DataTable<TableRowData> data={tableRows!} columns={tableColumns!.map((column) => ({ accessorKey: column.key, header: column.label,
            sortingFn: (a, b) => {
              const av = a.original[column.key]; const bv = b.original[column.key];
              const numeric = (value: string | number) => typeof value === "number" ? value : /[£$€]/.test(value) ? Number(value.replace(/[^\d.-]/g, "")) : NaN;
              const an = numeric(av); const bn = numeric(bv);
              return Number.isFinite(an) && Number.isFinite(bn) ? an - bn : String(av).localeCompare(String(bv), undefined, { numeric: true });
            },
          }))} />
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
