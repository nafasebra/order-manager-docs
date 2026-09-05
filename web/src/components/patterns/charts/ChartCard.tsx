import type { ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function ChartCard({ title, description, action, children, className }: ChartCardProps) {
  return (
    <Card className={cn('shadow-none', className)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
