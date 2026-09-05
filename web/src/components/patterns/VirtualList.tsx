import { useRef, type ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  estimateSize?: number
  renderItem: (item: T, index: number) => ReactNode
  className?: string
  height?: number | string
}

export function VirtualList<T>({
  items,
  estimateSize = 72,
  renderItem,
  className,
  height = 400,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 8,
  })

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto', className)}
      style={{ height }}
      role="list"
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            role="listitem"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  )
}
