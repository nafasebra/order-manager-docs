import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: ReactNode
}

export function EmptyState({ title, description, actionLabel, onAction, icon }: EmptyStateProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
        {actionLabel && onAction && (
          <Button className="mt-4" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
