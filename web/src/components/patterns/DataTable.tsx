import type { ReactNode } from 'react'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { sortIndicator } from '@/lib/list/sort'

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    sortable?: boolean
  }
}

interface DataTableProps<T> {
  columns: ColumnDef<T, unknown>[]
  data: T[]
  isLoading?: boolean
  onRowClick?: (row: T) => void
  dense?: boolean
  emptyMessage?: string
  className?: string
  sort?: string
  onSortChange?: (field: string) => void
}

function SortableHeader({
  label,
  field,
  sort,
  onSortChange,
}: {
  label: ReactNode
  field: string
  sort?: string
  onSortChange: (field: string) => void
}) {
  const direction = sortIndicator(sort, field)
  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
      onClick={() => onSortChange(field)}
    >
      {label}
      <Icon className={cn('size-3.5', direction ? 'text-foreground' : 'text-muted-foreground/60')} />
    </button>
  )
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  onRowClick,
  dense,
  emptyMessage = 'No results found.',
  className,
  sort,
  onSortChange,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className={cn('rounded-xl border bg-card', className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => {
                const field = header.column.id
                const isSortable = !!onSortChange && header.column.columnDef.meta?.sortable
                const label = header.isPlaceholder
                  ? null
                  : flexRender(header.column.columnDef.header, header.getContext())

                return (
                  <TableHead key={header.id} className={dense ? 'text-[13px]' : ''}>
                    {isSortable && label ? (
                      <SortableHeader
                        label={label}
                        field={field}
                        sort={sort}
                        onSortChange={onSortChange}
                      />
                    ) : (
                      label
                    )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {columns.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className={onRowClick ? 'cursor-pointer' : ''}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className={dense ? 'text-[13px]' : ''}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
