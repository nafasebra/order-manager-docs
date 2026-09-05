import type {
  Order,
  OrderLineItem,
  OrderSplit,
  OrderStatusHistoryEntry,
  OrderStatus,
} from '@/types'
import { buyers, addresses } from './buyers'
import { sellers, sellerDeliveryMethods, sellerPaymentWays } from './sellers'
import { products } from './products'

const orderStatuses: OrderStatus[] = ['processing', 'shipping', 'delivered', 'canceled']

function getWaySnapshot(sellerId: string, type: 'delivery' | 'payment') {
  const ways = type === 'delivery' ? sellerDeliveryMethods : sellerPaymentWays
  const way = ways.find((w) => w.sellerId === sellerId && w.enabled)
  return way
    ? { code: way.code, label: way.label, instructions: way.instructions }
    : { code: 'standard', label: 'Standard', instructions: '' }
}

export const orders: Order[] = Array.from({ length: 120 }, (_, i) => {
  const buyer = buyers[i % buyers.length]
  const addr = addresses.find((a) => a.buyerId === buyer.id && a.isDefaultShipping)!
  const status = orderStatuses[i % orderStatuses.length]
  const seller = sellers[i % sellers.length]
  return {
    id: `order-${i + 1}`,
    orderNumber: `#${10200 + i}`,
    buyerId: buyer.id,
    status,
    shippingAddressSnapshot: {
      line: addr.line,
      city: addr.city,
      region: addr.region,
      postalCode: addr.postalCode,
      country: addr.country,
    },
    deliveryMethodSnapshot: getWaySnapshot(seller.id, 'delivery'),
    paymentWaySnapshot: getWaySnapshot(seller.id, 'payment'),
    cancelReason: status === 'canceled' ? 'Customer requested cancellation' : null,
    currency: 'GBP',
    version: 1,
    createdAt: new Date(2026, 7, (i % 28) + 1, 10 + (i % 12)).toISOString(),
    updatedAt: new Date(2026, 8, (i % 28) + 1).toISOString(),
  }
})

export const orderLineItems: OrderLineItem[] = orders.flatMap((order, i) => {
  const product = products[i % products.length]
  const qty = 1 + (i % 3)
  return [
    {
      id: `li-${order.id}-1`,
      orderId: order.id,
      sellerId: product.sellerId,
      productId: product.id,
      productNameSnapshot: product.name,
      quantity: qty,
      unitPriceSnapshot: product.salePrice ?? product.price,
    },
    ...(i % 4 === 0
      ? [
          {
            id: `li-${order.id}-2`,
            orderId: order.id,
            sellerId: products[(i + 5) % products.length].sellerId,
            productId: products[(i + 5) % products.length].id,
            productNameSnapshot: products[(i + 5) % products.length].name,
            quantity: 1,
            unitPriceSnapshot: products[(i + 5) % products.length].price,
          },
        ]
      : []),
  ]
})

export const orderSplits: OrderSplit[] = orderLineItems.reduce<OrderSplit[]>((acc, li) => {
  const existing = acc.find((s) => s.orderId === li.orderId && s.sellerId === li.sellerId)
  if (!existing) {
    const order = orders.find((o) => o.id === li.orderId)!
    acc.push({ orderId: li.orderId, sellerId: li.sellerId, status: order.status })
  }
  return acc
}, [])

export const orderStatusHistory: OrderStatusHistoryEntry[] = orders.flatMap((order, i) => {
  const entries: OrderStatusHistoryEntry[] = [
    {
      id: `hist-${order.id}-0`,
      orderId: order.id,
      fromStatus: null,
      toStatus: 'processing',
      actorAdminId: null,
      actorSellerId: null,
      orderSplitId: null,
      note: 'Order placed',
      createdAt: order.createdAt,
    },
  ]
  if (order.status !== 'processing') {
    const transitions: OrderStatus[] =
      order.status === 'canceled'
        ? ['shipping', 'canceled']
        : order.status === 'shipping'
          ? ['shipping']
          : ['shipping', 'delivered']
    let prev: OrderStatus = 'processing'
    transitions.forEach((to, j) => {
      entries.push({
        id: `hist-${order.id}-${j + 1}`,
        orderId: order.id,
        fromStatus: prev,
        toStatus: to,
        actorAdminId: j % 2 === 0 ? 'admin-1' : null,
        actorSellerId: j % 2 === 1 ? orderLineItems.find((li) => li.orderId === order.id)?.sellerId ?? null : null,
        orderSplitId: null,
        note: to === 'canceled' ? order.cancelReason : null,
        createdAt: new Date(new Date(order.createdAt).getTime() + (j + 1) * 86400000).toISOString(),
      })
      prev = to
    })
  }
  return entries
})

export function getOrderTotal(orderId: string): number {
  return orderLineItems
    .filter((li) => li.orderId === orderId)
    .reduce((sum, li) => sum + li.unitPriceSnapshot * li.quantity, 0)
}
