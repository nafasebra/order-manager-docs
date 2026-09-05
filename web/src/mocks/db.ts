import { adminUsers, adminGrants } from './fixtures/admins'
import { buyers, addresses } from './fixtures/buyers'
import { sellers, sellerDeliveryMethods, sellerPaymentWays } from './fixtures/sellers'
import { products, productImages } from './fixtures/products'
import {
  orders,
  orderLineItems,
  orderSplits,
  orderStatusHistory,
  getOrderTotal,
} from './fixtures/orders'
import { tickets, ticketMessages } from './fixtures/tickets'
import type {
  OrderStatus,
  Product,
  SellerWay,
  TicketStatus,
  TicketMessage,
} from '@/types'

export const db = {
  adminUsers: [...adminUsers],
  adminGrants: { ...adminGrants },
  buyers: [...buyers],
  addresses: [...addresses],
  sellers: [...sellers],
  sellerDeliveryMethods: [...sellerDeliveryMethods],
  sellerPaymentWays: [...sellerPaymentWays],
  products: [...products],
  productImages: [...productImages],
  orders: [...orders],
  orderLineItems: [...orderLineItems],
  orderSplits: [...orderSplits],
  orderStatusHistory: [...orderStatusHistory],
  tickets: [...tickets],
  ticketMessages: [...ticketMessages],
}

export { getOrderTotal }

const ORDER_FLOW: Record<OrderStatus, OrderStatus | null> = {
  processing: 'shipping',
  shipping: 'delivered',
  delivered: null,
  canceled: null,
}

export function advanceOrderStatus(orderId: string, actorAdminId: string | null, actorSellerId: string | null): boolean {
  const order = db.orders.find((o) => o.id === orderId)
  if (!order || order.status === 'canceled' || order.status === 'delivered') return false
  const next = ORDER_FLOW[order.status]
  if (!next) return false
  const prev = order.status
  order.status = next
  order.version += 1
  order.updatedAt = new Date().toISOString()
  db.orderStatusHistory.push({
    id: `hist-${orderId}-${Date.now()}`,
    orderId,
    fromStatus: prev,
    toStatus: next,
    actorAdminId,
    actorSellerId,
    orderSplitId: null,
    note: null,
    createdAt: new Date().toISOString(),
  })
  db.orderSplits.filter((s) => s.orderId === orderId).forEach((s) => {
    if (s.status !== 'canceled') s.status = next
  })
  return true
}

export function cancelOrder(orderId: string, reason: string, actorAdminId: string | null, actorSellerId: string | null): boolean {
  const order = db.orders.find((o) => o.id === orderId)
  if (!order || order.status === 'delivered' || order.status === 'canceled') return false
  const prev = order.status
  order.status = 'canceled'
  order.cancelReason = reason
  order.version += 1
  order.updatedAt = new Date().toISOString()
  db.orderStatusHistory.push({
    id: `hist-${orderId}-cancel-${Date.now()}`,
    orderId,
    fromStatus: prev,
    toStatus: 'canceled',
    actorAdminId,
    actorSellerId,
    orderSplitId: null,
    note: reason,
    createdAt: new Date().toISOString(),
  })
  db.orderSplits.filter((s) => s.orderId === orderId).forEach((s) => {
    s.status = 'canceled'
  })
  return true
}

export function updateSellerWays(
  sellerId: string,
  type: 'delivery' | 'payment',
  ways: SellerWay[],
): { ok: boolean; error?: string } {
  const enabled = ways.filter((w) => w.enabled)
  if (enabled.length === 0) return { ok: false, error: 'At least one way must be enabled' }
  const store = type === 'delivery' ? db.sellerDeliveryMethods : db.sellerPaymentWays
  ways.forEach((way) => {
    const idx = store.findIndex((w) => w.id === way.id)
    if (idx >= 0) store[idx] = { ...way }
  })
  return { ok: true }
}

export function addTicketMessage(
  ticketId: string,
  body: string,
  author: { type: 'admin' | 'buyer' | 'seller'; id: string },
): TicketMessage | null {
  const ticket = db.tickets.find((t) => t.id === ticketId)
  if (!ticket || ticket.status === 'closed') return null
  const msg: TicketMessage = {
    id: `msg-${ticketId}-${Date.now()}`,
    ticketId,
    authorType: author.type,
    authorAdminId: author.type === 'admin' ? author.id : null,
    authorSellerId: author.type === 'seller' ? author.id : null,
    authorBuyerId: author.type === 'buyer' ? author.id : null,
    body,
    createdAt: new Date().toISOString(),
  }
  db.ticketMessages.push(msg)
  ticket.updatedAt = new Date().toISOString()
  return msg
}

export function updateTicketStatus(ticketId: string, status: TicketStatus): boolean {
  const ticket = db.tickets.find((t) => t.id === ticketId)
  if (!ticket) return false
  ticket.status = status
  ticket.updatedAt = new Date().toISOString()
  return true
}

export function createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
  const product: Product = {
    ...data,
    id: `product-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.products.push(product)
  return product
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const idx = db.products.findIndex((p) => p.id === id)
  if (idx < 0) return null
  db.products[idx] = { ...db.products[idx], ...data, updatedAt: new Date().toISOString() }
  return db.products[idx]
}

export function updateBuyerProfile(id: string, data: { name?: string; email?: string }): boolean {
  const buyer = db.buyers.find((b) => b.id === id)
  if (!buyer) return false
  if (data.name) buyer.name = data.name
  if (data.email) buyer.email = data.email
  buyer.updatedAt = new Date().toISOString()
  return true
}

export function updateAddress(id: string, data: Partial<(typeof db.addresses)[0]>): boolean {
  const idx = db.addresses.findIndex((a) => a.id === id)
  if (idx < 0) return false
  db.addresses[idx] = { ...db.addresses[idx], ...data }
  if (data.isDefaultShipping) {
    db.addresses
      .filter((a) => a.buyerId === db.addresses[idx].buyerId)
      .forEach((a) => {
        a.isDefaultShipping = a.id === id
      })
  }
  if (data.isDefaultBilling) {
    db.addresses
      .filter((a) => a.buyerId === db.addresses[idx].buyerId)
      .forEach((a) => {
        a.isDefaultBilling = a.id === id
      })
  }
  return true
}

export function addAddress(buyerId: string, data: Omit<(typeof db.addresses)[0], 'id' | 'buyerId'>): (typeof db.addresses)[0] {
  const addr = { id: `addr-${Date.now()}`, buyerId, ...data }
  db.addresses.push(addr)
  return addr
}

export function createTicket(data: {
  subject: string
  description: string
  requesterBuyerId: string
  type: 'site' | 'buyer_seller'
  sellerId?: string | null
}): (typeof db.tickets)[0] {
  const ticket = {
    id: `ticket-${Date.now()}`,
    ticketNumber: `TKT-${1000 + db.tickets.length}`,
    type: data.type,
    subject: data.subject,
    description: data.description,
    priority: 'normal' as const,
    status: 'open' as const,
    requesterBuyerId: data.requesterBuyerId,
    sellerId: data.sellerId ?? null,
    assigneeAdminId: null,
    relatedOrderId: null,
    relatedProductId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  db.tickets.push(ticket)
  addTicketMessage(ticket.id, data.description, { type: 'buyer', id: data.requesterBuyerId })
  return ticket
}

export function updateSellerProfile(
  sellerId: string,
  data: Partial<{ displayName: string; contactName: string; contactEmail: string; contactPhone: string; workplaceAddressText: string }>,
): boolean {
  const seller = db.sellers.find((s) => s.id === sellerId)
  if (!seller) return false
  Object.assign(seller, data, { updatedAt: new Date().toISOString() })
  return true
}

export function getOverviewStats(sellerId?: string) {
  const relevantOrders = sellerId
    ? db.orders.filter((o) => db.orderLineItems.some((li) => li.orderId === o.id && li.sellerId === sellerId))
    : db.orders
  const revenue = relevantOrders
    .filter((o) => o.status !== 'canceled')
    .reduce((sum, o) => sum + getOrderTotal(o.id), 0)
  const orderCount = relevantOrders.length
  const buyerIds = new Set(relevantOrders.map((o) => o.buyerId))
  const avgOrder = orderCount > 0 ? Math.round(revenue / orderCount) : 0
  return {
    revenue,
    revenueChange: 7.2,
    orders: orderCount,
    ordersChange: 8.1,
    customers: sellerId ? buyerIds.size : db.buyers.length,
    customersChange: 6.2,
    avgOrder,
    avgOrderChange: 3.4,
  }
}

const STATUS_LABELS: Record<string, string> = {
  processing: 'Processing',
  shipping: 'Shipping',
  delivered: 'Delivered',
  canceled: 'Canceled',
}

function filterOrdersBySeller(sellerId?: string) {
  if (!sellerId) return db.orders
  const orderIds = new Set(
    db.orderLineItems.filter((li) => li.sellerId === sellerId).map((li) => li.orderId),
  )
  return db.orders.filter((o) => orderIds.has(o.id))
}

export function getSalesTrend(days = 7, sellerId?: string) {
  const relevant = filterOrdersBySeller(sellerId)
  const now = new Date()
  const points = Array.from({ length: days }, (_, i) => {
    const d = new Date(now)
    d.setDate(d.getDate() - (days - 1 - i))
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate())
    const dayEnd = new Date(dayStart)
    dayEnd.setDate(dayEnd.getDate() + 1)
    const dayOrders = relevant.filter((o) => {
      const created = new Date(o.createdAt)
      return created >= dayStart && created < dayEnd && o.status !== 'canceled'
    })
    const revenue = dayOrders.reduce((sum, o) => sum + getOrderTotal(o.id), 0)
    return {
      label: dayStart.toLocaleDateString('en-GB', { weekday: 'short' }),
      revenue,
      orders: dayOrders.length,
    }
  })
  return points
}

export function getOrderStatusMix(sellerId?: string) {
  const relevant = filterOrdersBySeller(sellerId)
  const statuses = ['processing', 'shipping', 'delivered', 'canceled'] as const
  return statuses.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: relevant.filter((o) => o.status === status).length,
  }))
}

export function getTopProducts(limit = 5, sellerId?: string) {
  const lineItems = sellerId
    ? db.orderLineItems.filter((li) => li.sellerId === sellerId)
    : db.orderLineItems
  const byProduct = new Map<string, { name: string; revenue: number; orders: Set<string> }>()
  for (const li of lineItems) {
    const order = db.orders.find((o) => o.id === li.orderId)
    if (!order || order.status === 'canceled') continue
    const existing = byProduct.get(li.productId) ?? {
      name: li.productNameSnapshot,
      revenue: 0,
      orders: new Set<string>(),
    }
    existing.revenue += li.unitPriceSnapshot * li.quantity
    existing.orders.add(li.orderId)
    byProduct.set(li.productId, existing)
  }
  return [...byProduct.entries()]
    .map(([id, data]) => ({
      id,
      name: data.name,
      revenue: data.revenue,
      orders: data.orders.size,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}

export function getTopSellers(limit = 5) {
  const bySeller = new Map<string, { name: string; revenue: number; orders: Set<string> }>()
  for (const li of db.orderLineItems) {
    const order = db.orders.find((o) => o.id === li.orderId)
    if (!order || order.status === 'canceled') continue
    const seller = db.sellers.find((s) => s.id === li.sellerId)
    const existing = bySeller.get(li.sellerId) ?? {
      name: seller?.displayName ?? li.sellerId,
      revenue: 0,
      orders: new Set<string>(),
    }
    existing.revenue += li.unitPriceSnapshot * li.quantity
    existing.orders.add(li.orderId)
    bySeller.set(li.sellerId, existing)
  }
  return [...bySeller.entries()]
    .map(([id, data]) => ({
      id,
      name: data.name,
      revenue: data.revenue,
      orders: data.orders.size,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit)
}
