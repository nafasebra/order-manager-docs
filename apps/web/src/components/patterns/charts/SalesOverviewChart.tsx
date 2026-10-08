import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesPoint } from "@/types";
import { formatMoney } from "@/lib/formats";
import {
  chartAxisStyle,
  chartColors,
  chartGridStyle,
} from "@/components/patterns/charts/chartTheme";
import {
  ChartCard,
  type ChartRange,
} from "@/components/patterns/charts/ChartCard";

type Props = {
  data: SalesPoint[];
  range?: ChartRange;
  onRangeChange?: (range: ChartRange) => void;
};

export function SalesOverviewChart({ data, range, onRangeChange }: Props) {
  const colors = chartColors();
  const sliced =
    range === "7d" ? data.slice(-7) : range === "90d" ? data : data.slice(-30);

  return (
    <ChartCard
      title="Sales overview"
      description="Revenue over time"
      range={range}
      onRangeChange={onRangeChange}
      showRange
      tableColumns={[
        { key: "date", label: "Date" },
        { key: "revenue", label: "Revenue" },
        { key: "orders", label: "Orders" },
      ]}
      tableRows={sliced.map((d) => ({
        date: d.date,
        revenue: formatMoney(d.revenue),
        orders: d.orders,
      }))}
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={sliced}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={colors.chart1}
                  stopOpacity={0.25}
                />
                <stop offset="100%" stopColor={colors.chart1} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...chartGridStyle} vertical={false} />
            <XAxis
              dataKey="date"
              tick={chartAxisStyle}
              tickFormatter={(v: string) => v.slice(5)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={chartAxisStyle}
              tickFormatter={(v: number) => `£${v}`}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              contentStyle={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [formatMoney(value), "Revenue"]}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={colors.chart1}
              fill="url(#salesFill)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
