import { describe, it, expect } from 'vitest'
import { paginate } from '@/lib/utils'

describe('paginate', () => {
  const items = Array.from({ length: 30 }, (_, i) => i + 1)

  it('returns correct page slice', () => {
    const result = paginate(items, 2, 10)
    expect(result.items).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20])
    expect(result.total).toBe(30)
    expect(result.page).toBe(2)
    expect(result.pageSize).toBe(10)
  })

  it('handles last partial page', () => {
    const result = paginate(items, 3, 10)
    expect(result.items).toEqual([21, 22, 23, 24, 25, 26, 27, 28, 29, 30])
  })
})
