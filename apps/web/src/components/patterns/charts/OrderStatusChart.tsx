import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusMixPoint } from "@/types";
import {
  chartColors,
  statusChartColor,
} from "@/components/patterns/charts/chartTheme";
import { ChartCard } from "@/components/patterns/charts/ChartCard";

type Props = {
  data: StatusMixPoint[];
};

export function OrderStatusChart({ data }: Props) {
  const colors = chartColors();
  const colorMap: Record<string, string> = {
    processing: colors.warning,
    shipping: colors.info,
    delivered: colors.success,
    canceled: colors.destructive,
  };

  return (
    <ChartCard
      title="Order status mix"
      description="Current distribution"
      tableColumns={[
        { key: "label", label: "Status" },
        { key: "count", label: "Count" },
      ]}
      tableRows={data.map((d) => ({ label: d.label, count: d.count }))}
    >
      <div className="flex h-[280px] items-center gap-6">
        <div className="h-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="label"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={
                      colorMap[entry.status] ??
                      statusChartColor[entry.status] ??
                      colors.chart1
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: colors.card,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ul className="space-y-2 text-sm">
          {data.map((d) => (
            <li key={d.status} className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: colorMap[d.status] }}
              />
              <span className="text-muted-foreground">{d.label}</span>
              <span className="font-medium">{d.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}
