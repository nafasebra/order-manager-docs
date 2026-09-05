export type SortDirection = 'asc' | 'desc'

export interface ParsedSort {
  field: string
  dir: SortDirection
}

export function parseSort(sort?: string): ParsedSort | null {
  if (!sort) return null
  const [field, dir] = sort.split(':')
  if (!field || (dir !== 'asc' && dir !== 'desc')) return null
  return { field, dir }
}

export function toggleSort(current: string | undefined, field: string): string | undefined {
  const parsed = parseSort(current)
  if (!parsed || parsed.field !== field) return `${field}:asc`
  if (parsed.dir === 'asc') return `${field}:desc`
  return undefined
}

export function applySort<T>(
  items: T[],
  sort: string | undefined,
  comparators: Record<string, (a: T, b: T) => number>,
  defaultSort?: string,
): T[] {
  const parsed = parseSort(sort ?? defaultSort)
  if (!parsed) return items
  const comparator = comparators[parsed.field]
  if (!comparator) return items
  const sorted = [...items].sort(comparator)
  return parsed.dir === 'desc' ? sorted.reverse() : sorted
}

export function sortIndicator(sort: string | undefined, field: string): SortDirection | null {
  const parsed = parseSort(sort)
  if (!parsed || parsed.field !== field) return null
  return parsed.dir
}
