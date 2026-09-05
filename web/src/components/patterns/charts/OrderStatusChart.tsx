import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { StatusMixPoint } from '@/types'
import { ChartCard } from './ChartCard'
import { CHART_GRID, CHART_MUTED, STATUS_CHART_COLORS, chartTooltipStyle } from './chartTheme'

interface OrderStatusChartProps {
  data: StatusMixPoint[]
}

export function OrderStatusChart({ data }: OrderStatusChartProps) {
  return (
    <ChartCard title="Order status mix" description="Current order pipeline">
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fill: CHART_MUTED, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={72}
            />
            <Tooltip contentStyle={chartTooltipStyle} />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {data.map((entry) => (
                <Cell key={entry.status} fill={STATUS_CHART_COLORS[entry.status]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
