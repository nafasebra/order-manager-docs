import type { PermissionGrant } from '@/types'

export const ADMIN_GRANTS: PermissionGrant[] = [
  { area: 'analytics', actions: ['view'] },
  { area: 'marketing', actions: ['view', 'edit', 'create'] },
  { area: 'crm', actions: ['view', 'edit'] },
  { area: 'orders', actions: ['view', 'edit', 'update_status', 'refund'] },
  { area: 'buyers', actions: ['view', 'edit'] },
  { area: 'sellers', actions: ['view', 'edit', 'create'] },
  { area: 'invoices', actions: ['view', 'edit', 'create'] },
  { area: 'transactions', actions: ['view', 'refund'] },
  { area: 'products', actions: ['view', 'edit', 'create', 'moderate'] },
  { area: 'reviews', actions: ['view', 'moderate'] },
  { area: 'qa', actions: ['view', 'moderate', 'respond'] },
  { area: 'product_reports', actions: ['view', 'moderate'] },
  { area: 'website', actions: ['view', 'edit'] },
  { area: 'blog', actions: ['view', 'edit', 'create'] },
  { area: 'tickets', actions: ['view', 'edit', 'respond', 'update_status'] },
  { area: 'admin_management', actions: ['view', 'edit', 'manage_admins'] },
]

export const SUPPORT_GRANTS: PermissionGrant[] = [
  { area: 'orders', actions: ['view'] },
  { area: 'buyers', actions: ['view', 'edit'] },
  { area: 'sellers', actions: ['view'] },
  { area: 'products', actions: ['view'] },
  { area: 'tickets', actions: ['view', 'edit', 'respond', 'update_status'] },
]

export const EDITOR_GRANTS: PermissionGrant[] = [
  { area: 'website', actions: ['view', 'edit'] },
  { area: 'blog', actions: ['view', 'edit', 'create'] },
]

export function can(
  grants: PermissionGrant[] | undefined,
  isSuperuser: boolean,
  area: PermissionGrant['area'],
  action: PermissionGrant['actions'][number],
): boolean {
  if (isSuperuser) return true
  if (!grants) return false
  const grant = grants.find((g) => g.area === area)
  return grant?.actions.includes(action) ?? false
}

export function hasView(grants: PermissionGrant[] | undefined, isSuperuser: boolean, area: PermissionGrant['area']): boolean {
  return can(grants, isSuperuser, area, 'view')
}
