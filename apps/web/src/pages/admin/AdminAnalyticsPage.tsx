import { useState } from "react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { IncomeStatistics } from "@/components/patterns/IncomeStatistics";
import {
  OrderStatusChart,
  SalesOverviewChart,
  TopProductsChart,
  TopSellersChart,
  type ChartRange,
} from "@/components/patterns/charts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats } from "@/lib/api/resources";

export function AdminAnalyticsPage() {
  const [range, setRange] = useState<ChartRange>("30d");
  const [compare, setCompare] = useState("previous");
  const stats = useAdminStats();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        description="Revenue, volume, status mix, and rankings."
        actions={
          <div className="flex gap-2">
            <Select value={compare} onValueChange={setCompare}>
              <SelectTrigger className="w-[160px]" aria-label="Compare period">
                <SelectValue placeholder="Compare" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="previous">vs previous</SelectItem>
                <SelectItem value="yoy">vs last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        }
      />

      <IncomeStatistics data={stats.data?.income} scope="marketplace" />

      {stats.isLoading || !stats.data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Skeleton className="h-[360px] rounded-md" />
          <Skeleton className="h-[360px] rounded-md" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <SalesOverviewChart
                data={stats.data.salesSeries}
                range={range}
                onRangeChange={setRange}
              />
            </div>
            <div className="lg:col-span-2">
              <OrderStatusChart data={stats.data.statusMix} />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <TopProductsChart data={stats.data.topProducts} />
            <TopSellersChart data={stats.data.topSellers} />
          </div>
          <p className="text-xs text-muted-foreground">
            Comparison mode: {compare}. Chart table fallbacks available via the
            Table toggle on each card.
          </p>
        </>
      )}
    </div>
  );
}
