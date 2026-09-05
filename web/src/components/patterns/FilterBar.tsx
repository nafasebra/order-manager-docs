import type { ReactNode } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface FilterOption {
  value: string
  label: string
}

interface FilterBarProps {
  search?: string
  onSearchChange?: (value: string) => void
  searchPlaceholder?: string
  status?: string
  onStatusChange?: (value: string | undefined) => void
  statusOptions?: FilterOption[]
  secondary?: {
    value?: string
    onChange: (value: string | undefined) => void
    options: FilterOption[]
    placeholder?: string
    allLabel?: string
  }
  children?: ReactNode
}

export function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = 'Search…',
  status,
  onStatusChange,
  statusOptions,
  secondary,
  children,
}: FilterBarProps) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      {onSearchChange && (
        <Input
          placeholder={searchPlaceholder}
          value={search ?? ''}
          onChange={(e) => onSearchChange(e.target.value)}
          className="max-w-xs"
        />
      )}
      {statusOptions && onStatusChange && (
        <Select
          value={status ?? 'all'}
          onValueChange={(v) => onStatusChange(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {secondary && (
        <Select
          value={secondary.value ?? 'all'}
          onValueChange={(v) => secondary.onChange(v === 'all' ? undefined : v)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={secondary.placeholder ?? 'Filter'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{secondary.allLabel ?? 'All'}</SelectItem>
            {secondary.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {children}
    </div>
  )
}
