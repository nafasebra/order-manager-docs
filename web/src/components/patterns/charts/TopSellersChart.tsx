import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TopSellerPoint } from '@/types'
import { formatMoney } from '@/lib/utils'
import { ChartCard } from './ChartCard'
import { CHART_GRID, CHART_MUTED, CHART_PRIMARY, chartTooltipStyle } from './chartTheme'

interface TopSellersChartProps {
  data: TopSellerPoint[]
}

export function TopSellersChart({ data }: TopSellersChartProps) {
  const chartData = data.map((s) => ({
    ...s,
    shortName: s.name.length > 18 ? `${s.name.slice(0, 18)}…` : s.name,
  }))

  return (
    <ChartCard title="Top sellers" description="By revenue">
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} horizontal={false} />
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="shortName"
              tick={{ fill: CHART_MUTED, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={100}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value: number) => [formatMoney(value), 'Revenue']}
              labelFormatter={(_, payload) =>
                payload?.[0]?.payload?.name ?? ''
              }
            />
            <Bar dataKey="revenue" fill={CHART_PRIMARY} radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
