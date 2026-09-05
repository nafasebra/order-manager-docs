import { Lock } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

interface SnapshotBlockProps {
  title: string
  children: React.ReactNode
  className?: string
}

export function SnapshotBlock({ title, children, className }: SnapshotBlockProps) {
  return (
    <Alert className={cn('border-muted bg-muted/30', className)}>
      <Lock className="h-4 w-4" />
      <AlertTitle className="text-sm font-medium">{title}</AlertTitle>
      <AlertDescription className="text-sm">{children}</AlertDescription>
    </Alert>
  )
}
