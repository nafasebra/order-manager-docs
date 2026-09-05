import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface DescriptionItem {
  label: string
  value: ReactNode
}

interface DescriptionListProps {
  items: DescriptionItem[]
  columns?: 1 | 2
  className?: string
}

export function DescriptionList({ items, columns = 2, className }: DescriptionListProps) {
  return (
    <dl
      className={cn(
        'grid gap-4',
        columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-sm">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
