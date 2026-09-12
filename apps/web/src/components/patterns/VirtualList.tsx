import type { ReactNode } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { cn } from "@/lib/utils";
import { useRef } from "react";

type VirtualListProps<T> = {
  items: T[];
  estimateSize?: number;
  overscan?: number;
  className?: string;
  height?: number | string;
  renderItem: (item: T, index: number) => ReactNode;
  getKey?: (item: T, index: number) => string | number;
};

export function VirtualList<T>({
  items,
  estimateSize = 72,
  overscan = 8,
  className,
  height = 400,
  renderItem,
  getKey,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  });

  return (
    <div
      ref={parentRef}
      role="list"
      className={cn("overflow-auto", className)}
      style={{ height }}
    >
      <div
        className="relative w-full"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const item = items[virtualRow.index];
          return (
            <div
              key={getKey?.(item, virtualRow.index) ?? virtualRow.key}
              role="listitem"
              className="absolute left-0 top-0 w-full"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {renderItem(item, virtualRow.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
