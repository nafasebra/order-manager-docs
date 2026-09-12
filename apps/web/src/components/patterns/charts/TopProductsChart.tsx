import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RankedItem } from "@/types";
import { formatMoney } from "@/lib/formats";
import {
  chartAxisStyle,
  chartColors,
  chartGridStyle,
} from "@/components/patterns/charts/chartTheme";
import { ChartCard } from "@/components/patterns/charts/ChartCard";

type Props = {
  title?: string;
  data: RankedItem[];
  valueLabel?: string;
};

export function TopProductsChart({
  title = "Top products",
  data,
  valueLabel = "Revenue",
}: Props) {
  const colors = chartColors();

  return (
    <ChartCard
      title={title}
      tableColumns={[
        { key: "name", label: "Name" },
        { key: "value", label: valueLabel },
      ]}
      tableRows={data.map((d) => ({
        name: d.name,
        value: formatMoney(d.value),
      }))}
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
          >
            <CartesianGrid {...chartGridStyle} horizontal={false} />
            <XAxis
              type="number"
              tick={chartAxisStyle}
              tickFormatter={(v: number) => `£${v}`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={chartAxisStyle}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: colors.card,
                border: `1px solid ${colors.border}`,
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: number) => [formatMoney(value), valueLabel]}
            />
            <Bar dataKey="value" fill={colors.chart1} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

export function TopSellersChart({ data }: { data: RankedItem[] }) {
  return (
    <TopProductsChart title="Top sellers" data={data} valueLabel="Revenue" />
  );
}
