import { delay, paginate } from '@/lib/utils'
import { applySort } from '@/lib/list/sort'
import { db, addAddress, updateAddress, updateBuyerProfile } from '@/mocks/db'
import type { Address, Buyer, ListParams, Paginated } from '@/types'

export async function listBuyers(params: ListParams = {}): Promise<Paginated<Buyer>> {
  await delay()
  const { page = 1, pageSize = 25, search = '', status, sort } = params
  let items = [...db.buyers]
  if (status) items = items.filter((b) => b.status === status)
  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q) ||
        b.username.toLowerCase().includes(q),
    )
  }
  items = applySort(
    items,
    sort,
    {
      name: (a, b) => a.name.localeCompare(b.name),
      email: (a, b) => a.email.localeCompare(b.email),
      username: (a, b) => a.username.localeCompare(b.username),
      status: (a, b) => a.status.localeCompare(b.status),
      registeredAt: (a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime(),
    },
    'registeredAt:desc',
  )
  return paginate(items, page, pageSize)
}

export async function getBuyer(id: string): Promise<Buyer | null> {
  await delay()
  return db.buyers.find((b) => b.id === id) ?? null
}

export async function getBuyerAddresses(buyerId: string): Promise<Address[]> {
  await delay()
  return db.addresses.filter((a) => a.buyerId === buyerId)
}

export async function updateBuyer(id: string, data: { name?: string; email?: string }) {
  await delay()
  return updateBuyerProfile(id, data)
}

export async function saveAddress(buyerId: string, data: Omit<Address, 'id' | 'buyerId'> & { id?: string }) {
  await delay()
  if (data.id) {
    updateAddress(data.id, data)
    return db.addresses.find((a) => a.id === data.id)!
  }
  return addAddress(buyerId, data)
}

export async function getBuyerOrderCount(buyerId: string) {
  await delay(100)
  return db.orders.filter((o) => o.buyerId === buyerId).length
}
