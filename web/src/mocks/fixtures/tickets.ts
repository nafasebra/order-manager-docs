import type { Ticket, TicketMessage, TicketStatus, TicketPriority } from '@/types'
import { buyers } from './buyers'
import { sellers } from './sellers'
import { orders } from './orders'
import { adminUsers } from './admins'

const statuses: TicketStatus[] = ['open', 'in_progress', 'waiting', 'resolved', 'closed']
const priorities: TicketPriority[] = ['low', 'normal', 'high', 'urgent']

const subjects = [
  'Order not received',
  'Refund request',
  'Account access issue',
  'Product damaged on arrival',
  'Wrong item shipped',
  'Payment not reflected',
  'General inquiry',
  'Seller communication issue',
]

export const tickets: Ticket[] = Array.from({ length: 40 }, (_, i) => {
  const buyer = buyers[i % buyers.length]
  const isSite = i % 3 !== 2
  const seller = isSite ? null : sellers[i % sellers.length]
  const status = statuses[i % statuses.length]
  return {
    id: `ticket-${i + 1}`,
    ticketNumber: `TKT-${990 + i}`,
    type: isSite ? 'site' : 'buyer_seller',
    subject: subjects[i % subjects.length],
    description: `Customer reported: ${subjects[i % subjects.length].toLowerCase()}. Please investigate and respond promptly.`,
    priority: priorities[i % priorities.length],
    status,
    requesterBuyerId: buyer.id,
    sellerId: seller?.id ?? null,
    assigneeAdminId: i % 2 === 0 ? adminUsers[1].id : adminUsers[0].id,
    relatedOrderId: i % 3 === 0 ? orders[i % orders.length].id : null,
    relatedProductId: null,
    createdAt: new Date(2026, 7, (i % 28) + 1).toISOString(),
    updatedAt: new Date(2026, 8, (i % 28) + 1).toISOString(),
  }
})

export const ticketMessages: TicketMessage[] = tickets.flatMap((ticket, i) => {
  const buyer = buyers.find((b) => b.id === ticket.requesterBuyerId)!
  const messages: TicketMessage[] = [
    {
      id: `msg-${ticket.id}-0`,
      ticketId: ticket.id,
      authorType: 'buyer',
      authorAdminId: null,
      authorSellerId: null,
      authorBuyerId: buyer.id,
      body: ticket.description,
      createdAt: ticket.createdAt,
    },
  ]
  if (ticket.status !== 'open') {
    messages.push({
      id: `msg-${ticket.id}-1`,
      ticketId: ticket.id,
      authorType: 'admin',
      authorAdminId: ticket.assigneeAdminId,
      authorSellerId: null,
      authorBuyerId: null,
      body: 'Thank you for reaching out. We are looking into this and will update you shortly.',
      createdAt: new Date(new Date(ticket.createdAt).getTime() + 3600000).toISOString(),
    })
  }
  if (['waiting', 'resolved', 'closed'].includes(ticket.status)) {
    messages.push({
      id: `msg-${ticket.id}-2`,
      ticketId: ticket.id,
      authorType: 'buyer',
      authorAdminId: null,
      authorSellerId: null,
      authorBuyerId: buyer.id,
      body: 'Thanks for the update. I will wait for further information.',
      createdAt: new Date(new Date(ticket.createdAt).getTime() + 7200000).toISOString(),
    })
  }
  return messages
})
