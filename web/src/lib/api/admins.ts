import { delay, paginate } from '@/lib/utils'
import { applySort } from '@/lib/list/sort'
import { db } from '@/mocks/db'
import { adminGrants } from '@/mocks/fixtures/admins'
import type { AdminUser, ListParams, Paginated, PermissionGrant } from '@/types'

export async function listAdmins(params: ListParams = {}): Promise<Paginated<AdminUser>> {
  await delay()
  const { page = 1, pageSize = 25, search = '', status, sort } = params
  let items = [...db.adminUsers]
  if (status) items = items.filter((a) => a.status === status)
  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.username.toLowerCase().includes(q),
    )
  }
  items = applySort(
    items,
    sort,
    {
      name: (a, b) => a.name.localeCompare(b.name),
      email: (a, b) => a.email.localeCompare(b.email),
      status: (a, b) => a.status.localeCompare(b.status),
    },
    'name:asc',
  )
  return paginate(items, page, pageSize)
}

export async function getAdmin(id: string): Promise<AdminUser | null> {
  await delay()
  return db.adminUsers.find((a) => a.id === id) ?? null
}

export async function getAdminGrants(id: string): Promise<PermissionGrant[]> {
  await delay(100)
  return adminGrants[id] ?? []
}

export async function updateAdminGrants(id: string, grants: PermissionGrant[]) {
  await delay()
  adminGrants[id] = grants
  db.adminGrants[id] = grants
  return true
}
