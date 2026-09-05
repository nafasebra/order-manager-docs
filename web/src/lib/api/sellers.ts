import { delay, paginate } from '@/lib/utils'
import { applySort } from '@/lib/list/sort'
import { db, updateSellerProfile, updateSellerWays } from '@/mocks/db'
import type { ListParams, Paginated, Seller, SellerWay } from '@/types'

export async function listSellers(params: ListParams = {}): Promise<Paginated<Seller>> {
  await delay()
  const { page = 1, pageSize = 25, search = '', status, sort } = params
  let items = [...db.sellers]
  if (status) items = items.filter((s) => s.status === status)
  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (s) =>
        s.displayName.toLowerCase().includes(q) ||
        s.contactEmail.toLowerCase().includes(q) ||
        s.contactName.toLowerCase().includes(q),
    )
  }
  items = applySort(
    items,
    sort,
    {
      displayName: (a, b) => a.displayName.localeCompare(b.displayName),
      contactName: (a, b) => a.contactName.localeCompare(b.contactName),
      contactEmail: (a, b) => a.contactEmail.localeCompare(b.contactEmail),
      status: (a, b) => a.status.localeCompare(b.status),
    },
    'displayName:asc',
  )
  return paginate(items, page, pageSize)
}

export async function getSeller(id: string): Promise<Seller | null> {
  await delay()
  return db.sellers.find((s) => s.id === id) ?? null
}

export async function getSellerDeliveryMethods(sellerId: string): Promise<SellerWay[]> {
  await delay()
  return db.sellerDeliveryMethods
    .filter((w) => w.sellerId === sellerId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function getSellerPaymentWays(sellerId: string): Promise<SellerWay[]> {
  await delay()
  return db.sellerPaymentWays
    .filter((w) => w.sellerId === sellerId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export async function saveSellerWays(
  sellerId: string,
  type: 'delivery' | 'payment',
  ways: SellerWay[],
) {
  await delay()
  return updateSellerWays(sellerId, type, ways)
}

export async function updateSeller(id: string, data: Partial<Seller>) {
  await delay()
  return updateSellerProfile(id, {
    displayName: data.displayName,
    contactName: data.contactName,
    contactEmail: data.contactEmail,
    contactPhone: data.contactPhone,
    workplaceAddressText: data.workplaceAddressText,
  })
}

export async function getSellerProductCount(sellerId: string) {
  await delay(100)
  return db.products.filter((p) => p.sellerId === sellerId).length
}

export async function getSellerOrderCount(sellerId: string) {
  await delay(100)
  const orderIds = new Set(
    db.orderLineItems.filter((li) => li.sellerId === sellerId).map((li) => li.orderId),
  )
  return orderIds.size
}
