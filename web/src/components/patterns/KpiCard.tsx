import { TrendingDown, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn, formatMoney } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: string | number
  change?: number
  format?: 'money' | 'number'
  className?: string
}

export function KpiCard({ label, value, change, format = 'number', className }: KpiCardProps) {
  const displayValue =
    format === 'money' && typeof value === 'number' ? formatMoney(value) : String(value)
  const isPositive = change !== undefined && change >= 0

  return (
    <Card className={cn('shadow-none', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{displayValue}</div>
        {change !== undefined && (
          <div
            className={cn(
              'mt-1 flex items-center gap-1 text-xs',
              isPositive ? 'text-success' : 'text-destructive',
            )}
          >
            {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}% vs previous period
          </div>
        )}
      </CardContent>
    </Card>
  )
}
