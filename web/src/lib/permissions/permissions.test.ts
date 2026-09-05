import { describe, it, expect } from 'vitest'
import { can, hasView } from '@/lib/permissions'
import { SUPPORT_GRANTS, EDITOR_GRANTS } from '@/lib/permissions'

describe('can()', () => {
  it('superuser can do anything', () => {
    expect(can(undefined, true, 'orders', 'refund')).toBe(true)
    expect(can(undefined, true, 'admin_management', 'manage_admins')).toBe(true)
  })

  it('support can view orders but not refund', () => {
    expect(can(SUPPORT_GRANTS, false, 'orders', 'view')).toBe(true)
    expect(can(SUPPORT_GRANTS, false, 'orders', 'refund')).toBe(false)
  })

  it('editor can edit website but not orders', () => {
    expect(can(EDITOR_GRANTS, false, 'website', 'edit')).toBe(true)
    expect(can(EDITOR_GRANTS, false, 'orders', 'view')).toBe(false)
  })

  it('hasView delegates to can view', () => {
    expect(hasView(SUPPORT_GRANTS, false, 'tickets')).toBe(true)
    expect(hasView(SUPPORT_GRANTS, false, 'products')).toBe(true)
    expect(hasView(EDITOR_GRANTS, false, 'blog')).toBe(true)
  })
})
