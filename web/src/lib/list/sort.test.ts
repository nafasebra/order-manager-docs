import { describe, it, expect } from 'vitest'
import { applySort, parseSort, toggleSort } from '@/lib/list/sort'

describe('parseSort', () => {
  it('parses field and direction', () => {
    expect(parseSort('createdAt:desc')).toEqual({ field: 'createdAt', dir: 'desc' })
  })

  it('returns null for invalid sort', () => {
    expect(parseSort('invalid')).toBeNull()
    expect(parseSort(undefined)).toBeNull()
  })
})

describe('toggleSort', () => {
  it('cycles asc -> desc -> clear', () => {
    expect(toggleSort(undefined, 'name')).toBe('name:asc')
    expect(toggleSort('name:asc', 'name')).toBe('name:desc')
    expect(toggleSort('name:desc', 'name')).toBeUndefined()
  })

  it('switches field', () => {
    expect(toggleSort('name:desc', 'email')).toBe('email:asc')
  })
})

describe('applySort', () => {
  const items = [{ n: 3 }, { n: 1 }, { n: 2 }]

  it('sorts ascending', () => {
    const sorted = applySort(items, 'n:asc', { n: (a, b) => a.n - b.n })
    expect(sorted.map((i) => i.n)).toEqual([1, 2, 3])
  })

  it('sorts descending', () => {
    const sorted = applySort(items, 'n:desc', { n: (a, b) => a.n - b.n })
    expect(sorted.map((i) => i.n)).toEqual([3, 2, 1])
  })

  it('uses default sort when sort is omitted', () => {
    const sorted = applySort(items, undefined, { n: (a, b) => a.n - b.n }, 'n:asc')
    expect(sorted.map((i) => i.n)).toEqual([1, 2, 3])
  })
})
