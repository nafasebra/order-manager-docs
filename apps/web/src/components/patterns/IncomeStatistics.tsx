import { useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartCard, chartAxisStyle, chartColors, chartGridStyle, type ChartRange } from "@/components/patterns/charts";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/formats";
import type { IncomePoint } from "@/types";

export function IncomeStatistics({ data, scope, range: selectedRange, onRangeChange }: { data?: IncomePoint[]; scope: "shop" | "marketplace"; range?: ChartRange; onRangeChange?: (range: ChartRange) => void }) {
  const [localRange, setLocalRange] = useState<ChartRange>("30d");
  const range = selectedRange ?? localRange;
  const colors = chartColors();
  if (!data) return <Skeleton className="h-[480px] w-full rounded-md" />;
  const rows = data.slice(-(range === "7d" ? 7 : range === "90d" ? 90 : 30));
  const totals = rows.reduce((total, row) => ({
    collected: total.collected + row.collected,
    refunds: total.refunds + row.refunds,
    net: total.net + row.net,
    pending: total.pending + row.pending,
  }), { collected: 0, refunds: 0, net: 0, pending: 0 });
  return (
    <section className="space-y-4" aria-label="Income statistics">
      <div>
        <h2 className="text-lg font-semibold">Income statistics</h2>
        <p className="text-sm text-muted-foreground">
          {scope === "shop" ? "Your shop's" : "Marketplace"} payments and refunds. Net income is collected payments minus completed refunds, before costs and fees.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {([
          ["Collected income", totals.collected],
          ["Refunds", totals.refunds],
          ["Net income", totals.net],
          ["Pending payments", totals.pending],
        ] as const).map(([label, value]) => (
          <Card key={label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-semibold">{formatMoney(value)}</p></CardContent>
          </Card>
        ))}
      </div>
      <ChartCard
        title="Income over time"
        description="Completed payments and refunds by transaction date. Demo reporting period ends September 1, 2026."
        range={range}
        onRangeChange={onRangeChange ?? setLocalRange}
        showRange
        tableColumns={[{ key: "date", label: "Date" }, { key: "collected", label: "Collected" }, { key: "refunds", label: "Refunds" }, { key: "net", label: "Net income" }]}
        tableRows={rows.map((row) => ({ date: row.date, collected: formatMoney(row.collected), refunds: formatMoney(row.refunds), net: formatMoney(row.net) }))}
      >
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...chartGridStyle} vertical={false} />
              <XAxis dataKey="date" tick={chartAxisStyle} tickFormatter={(value: string) => value.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={chartAxisStyle} tickFormatter={(value: number) => `£${value}`} axisLine={false} tickLine={false} width={60} />
              <Tooltip formatter={(value: number) => [formatMoney(value), "Net income"]} />
              <Area type="monotone" dataKey="net" stroke={colors.chart1} fill={colors.chart1} fillOpacity={0.15} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>
    </section>
  );
}
