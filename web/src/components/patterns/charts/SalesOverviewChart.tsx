import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { SalesTrendPoint } from '@/types'
import { formatMoney } from '@/lib/utils'
import { ChartCard } from './ChartCard'
import {
  CHART_GRID,
  CHART_MUTED,
  CHART_PRIMARY,
  chartTooltipStyle,
} from './chartTheme'

interface SalesOverviewChartProps {
  data: SalesTrendPoint[]
  periodLabel?: string
}

export function SalesOverviewChart({ data, periodLabel = 'Last 7 days' }: SalesOverviewChartProps) {
  return (
    <ChartCard
      title="Sales overview"
      description="Revenue and order volume"
      action={
        <span className="rounded-md border px-2 py-1 text-xs text-muted-foreground">{periodLabel}</span>
      }
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_PRIMARY} stopOpacity={0.2} />
                <stop offset="100%" stopColor={CHART_PRIMARY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: CHART_MUTED, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: CHART_MUTED, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `£${(v / 100).toFixed(0)}`}
              width={48}
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value: number, name: string) =>
                name === 'revenue' ? [formatMoney(value), 'Revenue'] : [value, 'Orders']
              }
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={CHART_PRIMARY}
              strokeWidth={2}
              fill="url(#revenueFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  )
}
