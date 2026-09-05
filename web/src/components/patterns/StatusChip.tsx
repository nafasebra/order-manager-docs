import type { OrderStatus, TicketStatus, ProductStatus } from '@/types'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type ChipVariant = 'success' | 'warning' | 'info' | 'destructive' | 'secondary'

const variantClasses: Record<ChipVariant, string> = {
  success: 'border-transparent bg-success/15 text-success',
  warning: 'border-transparent bg-warning/15 text-warning',
  info: 'border-transparent bg-info/15 text-info',
  destructive: '',
  secondary: '',
}

const orderMap: Record<OrderStatus, { variant: ChipVariant; label: string }> = {
  processing: { variant: 'warning', label: 'Processing' },
  shipping: { variant: 'info', label: 'Shipping' },
  delivered: { variant: 'success', label: 'Delivered' },
  canceled: { variant: 'destructive', label: 'Canceled' },
}

const ticketMap: Record<TicketStatus, { variant: ChipVariant; label: string }> = {
  open: { variant: 'info', label: 'Open' },
  in_progress: { variant: 'warning', label: 'In Progress' },
  waiting: { variant: 'secondary', label: 'Waiting' },
  resolved: { variant: 'success', label: 'Resolved' },
  closed: { variant: 'secondary', label: 'Closed' },
}

const productMap: Record<ProductStatus, { variant: ChipVariant; label: string }> = {
  draft: { variant: 'secondary', label: 'Draft' },
  published: { variant: 'success', label: 'Published' },
  out_of_stock: { variant: 'warning', label: 'Out of Stock' },
  archived: { variant: 'secondary', label: 'Archived' },
}

interface StatusChipProps {
  domain: 'order' | 'ticket' | 'product'
  status: string
  className?: string
}

export function StatusChip({ domain, status, className }: StatusChipProps) {
  const map = domain === 'order' ? orderMap : domain === 'ticket' ? ticketMap : productMap
  const config = map[status as keyof typeof map] ?? { variant: 'secondary' as ChipVariant, label: status }
  const badgeVariant = config.variant === 'destructive' ? 'destructive' : config.variant === 'secondary' ? 'secondary' : 'outline'

  return (
    <Badge
      variant={badgeVariant}
      className={cn(variantClasses[config.variant], className)}
    >
      {config.label}
    </Badge>
  )
}
