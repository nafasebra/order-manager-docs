import { delay, paginate } from '@/lib/utils'
import { applySort } from '@/lib/list/sort'
import {
  db,
  getOrderTotal,
  advanceOrderStatus,
  cancelOrder,
  getOverviewStats,
  getSalesTrend,
  getOrderStatusMix,
  getTopProducts,
  getTopSellers,
} from '@/mocks/db'
import { buyers } from '@/mocks/fixtures/buyers'
import { sellers } from '@/mocks/fixtures/sellers'
import type { ListParams, Order, Paginated } from '@/types'

export interface OrderListItem extends Order {
  buyerName: string
  sellerNames: string
  total: number
}

function enrichOrder(order: Order): OrderListItem {
  const buyer = buyers.find((b) => b.id === order.buyerId)
  const sellerIds = [...new Set(db.orderLineItems.filter((li) => li.orderId === order.id).map((li) => li.sellerId))]
  const sellerNames = sellerIds.map((id) => sellers.find((s) => s.id === id)?.displayName ?? id).join(', ')
  return {
    ...order,
    buyerName: buyer?.name ?? 'Unknown',
    sellerNames,
    total: getOrderTotal(order.id),
  }
}

export async function listOrders(
  params: ListParams & { sellerId?: string; buyerId?: string } = {},
): Promise<Paginated<OrderListItem>> {
  await delay()
  const { page = 1, pageSize = 25, search = '', status, sellerId, buyerId, sort } = params
  let items = db.orders.map(enrichOrder)
  if (sellerId) {
    const orderIds = new Set(
      db.orderLineItems.filter((li) => li.sellerId === sellerId).map((li) => li.orderId),
    )
    items = items.filter((o) => orderIds.has(o.id))
  }
  if (buyerId) items = items.filter((o) => o.buyerId === buyerId)
  if (status) items = items.filter((o) => o.status === status)
  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.buyerName.toLowerCase().includes(q) ||
        o.sellerNames.toLowerCase().includes(q),
    )
  }
  items = applySort(
    items,
    sort,
    {
      orderNumber: (a, b) => a.orderNumber.localeCompare(b.orderNumber),
      buyerName: (a, b) => a.buyerName.localeCompare(b.buyerName),
      sellerNames: (a, b) => a.sellerNames.localeCompare(b.sellerNames),
      total: (a, b) => a.total - b.total,
      status: (a, b) => a.status.localeCompare(b.status),
      createdAt: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    'createdAt:desc',
  )
  return paginate(items, page, pageSize)
}

export async function getOrder(id: string): Promise<OrderListItem | null> {
  await delay()
  const order = db.orders.find((o) => o.id === id)
  return order ? enrichOrder(order) : null
}

export async function getOrderLineItems(orderId: string) {
  await delay()
  return db.orderLineItems.filter((li) => li.orderId === orderId)
}

export async function getOrderHistory(orderId: string) {
  await delay()
  return db.orderStatusHistory
    .filter((h) => h.orderId === orderId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export async function getOrderSplits(orderId: string) {
  await delay()
  return db.orderSplits.filter((s) => s.orderId === orderId)
}

export async function advanceOrder(id: string, actorAdminId: string | null, actorSellerId: string | null) {
  await delay()
  return advanceOrderStatus(id, actorAdminId, actorSellerId)
}

export async function cancelOrderApi(
  id: string,
  reason: string,
  actorAdminId: string | null,
  actorSellerId: string | null,
) {
  await delay()
  return cancelOrder(id, reason, actorAdminId, actorSellerId)
}

export async function getOverview(sellerId?: string) {
  await delay()
  return getOverviewStats(sellerId)
}

export async function getRecentOrders(limit = 5, sellerId?: string) {
  await delay()
  const result = await listOrders({ page: 1, pageSize: limit, sellerId })
  return result.items
}

export async function getPendingWork() {
  await delay()
  const openTickets = db.tickets.filter((t) => ['open', 'in_progress'].includes(t.status)).length
  const processingOrders = db.orders.filter((o) => o.status === 'processing').length
  const draftProducts = db.products.filter((p) => p.status === 'draft').length
  return [
    { label: 'Open tickets', count: openTickets, href: '/admin/support/tickets' },
    { label: 'Processing orders', count: processingOrders, href: '/admin/orders?status=processing' },
    { label: 'Draft products', count: draftProducts, href: '/admin/products?status=draft' },
  ]
}

export async function getSalesOverview(days = 7, sellerId?: string) {
  await delay()
  return getSalesTrend(days, sellerId)
}

export async function getStatusMix(sellerId?: string) {
  await delay()
  return getOrderStatusMix(sellerId)
}

export async function getTopProductsList(limit = 5, sellerId?: string) {
  await delay()
  return getTopProducts(limit, sellerId)
}

export async function getTopSellersList(limit = 5) {
  await delay()
  return getTopSellers(limit)
}
