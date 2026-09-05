import type { AdminUser, PermissionGrant } from '@/types'
import { ADMIN_GRANTS, SUPPORT_GRANTS, EDITOR_GRANTS } from '@/lib/permissions'

export const adminUsers: AdminUser[] = [
  {
    id: 'admin-1',
    name: 'Nafas Admin',
    email: 'admin@marketplace.test',
    username: 'nafas.admin',
    isSuperuser: true,
    status: 'active',
    roleTemplateId: 'role-admin',
    permissionVersion: 1,
    lastLoginAt: '2026-09-04T08:00:00Z',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-09-04T08:00:00Z',
  },
  {
    id: 'admin-2',
    name: 'Sarah Support',
    email: 'support@marketplace.test',
    username: 'sarah.support',
    isSuperuser: false,
    status: 'active',
    roleTemplateId: 'role-support',
    permissionVersion: 1,
    lastLoginAt: '2026-09-03T14:00:00Z',
    createdAt: '2025-02-01T00:00:00Z',
    updatedAt: '2026-09-03T14:00:00Z',
  },
  {
    id: 'admin-3',
    name: 'Emma Editor',
    email: 'editor@marketplace.test',
    username: 'emma.editor',
    isSuperuser: false,
    status: 'active',
    roleTemplateId: 'role-editor',
    permissionVersion: 1,
    lastLoginAt: '2026-09-02T10:00:00Z',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2026-09-02T10:00:00Z',
  },
  {
    id: 'admin-4',
    name: 'James Ops',
    email: 'ops@marketplace.test',
    username: 'james.ops',
    isSuperuser: false,
    status: 'active',
    roleTemplateId: 'role-admin',
    permissionVersion: 1,
    lastLoginAt: '2026-09-01T09:00:00Z',
    createdAt: '2025-04-01T00:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
  },
  {
    id: 'admin-5',
    name: 'Lisa Manager',
    email: 'manager@marketplace.test',
    username: 'lisa.manager',
    isSuperuser: false,
    status: 'suspended',
    roleTemplateId: 'role-admin',
    permissionVersion: 1,
    lastLoginAt: '2026-08-15T12:00:00Z',
    createdAt: '2025-05-01T00:00:00Z',
    updatedAt: '2026-08-20T12:00:00Z',
  },
]

export const adminGrants: Record<string, PermissionGrant[]> = {
  'admin-1': ADMIN_GRANTS,
  'admin-2': SUPPORT_GRANTS,
  'admin-3': EDITOR_GRANTS,
  'admin-4': ADMIN_GRANTS,
  'admin-5': ADMIN_GRANTS,
}

export const loginAccounts = {
  staff: [
    { label: 'Superuser (Nafas)', userId: 'admin-1' },
    { label: 'Support (Sarah)', userId: 'admin-2' },
    { label: 'Editor (Emma)', userId: 'admin-3' },
    { label: 'Admin (James)', userId: 'admin-4' },
  ],
  seller: [
    { label: 'GreenLeaf Shop', userId: 'seller-1' },
    { label: 'TechHub Store', userId: 'seller-2' },
    { label: 'Artisan Crafts', userId: 'seller-3' },
  ],
  buyer: [
    { label: 'Sarah Miller', userId: 'buyer-1' },
    { label: 'John Smith', userId: 'buyer-2' },
    { label: 'Emma Brown', userId: 'buyer-3' },
  ],
}
