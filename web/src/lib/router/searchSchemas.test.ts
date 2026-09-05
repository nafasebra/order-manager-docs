import { describe, it, expect } from 'vitest'
import { ordersSearchSchema, listSearchSchema, ticketsSearchSchema } from '@/lib/router/searchSchemas'

describe('ordersSearchSchema', () => {
  it('applies defaults for page and pageSize', () => {
    const result = ordersSearchSchema.parse({})
    expect(result.page).toBe(1)
    expect(result.pageSize).toBe(25)
  })

  it('parses valid status filter', () => {
    const result = ordersSearchSchema.parse({ status: 'processing', page: 2 })
    expect(result.status).toBe('processing')
    expect(result.page).toBe(2)
  })

  it('rejects invalid status via catch', () => {
    const result = ordersSearchSchema.parse({ status: 'invalid' })
    expect(result.status).toBeUndefined()
  })

  it('parses sort param', () => {
    const result = ordersSearchSchema.parse({ sort: 'createdAt:desc' })
    expect(result.sort).toBe('createdAt:desc')
  })
})

describe('listSearchSchema', () => {
  it('coerces page from string-like invalid to default', () => {
    const result = listSearchSchema.parse({ page: 0 })
    expect(result.page).toBe(1)
  })
})

describe('ticketsSearchSchema', () => {
  it('parses type filter', () => {
    const result = ticketsSearchSchema.parse({ type: 'site' })
    expect(result.type).toBe('site')
  })
})
