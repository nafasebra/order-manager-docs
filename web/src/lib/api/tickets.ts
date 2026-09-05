import { delay, paginate } from '@/lib/utils'
import { applySort } from '@/lib/list/sort'
import { db, addTicketMessage, updateTicketStatus, createTicket } from '@/mocks/db'
import { buyers } from '@/mocks/fixtures/buyers'
import { sellers } from '@/mocks/fixtures/sellers'
import { adminUsers } from '@/mocks/fixtures/admins'
import type { ListParams, Paginated, Ticket, TicketStatus } from '@/types'

export interface TicketListItem extends Ticket {
  requesterName: string
  sellerName: string | null
  assigneeName: string | null
}

function enrich(t: Ticket): TicketListItem {
  return {
    ...t,
    requesterName: buyers.find((b) => b.id === t.requesterBuyerId)?.name ?? 'Unknown',
    sellerName: t.sellerId ? sellers.find((s) => s.id === t.sellerId)?.displayName ?? null : null,
    assigneeName: t.assigneeAdminId
      ? adminUsers.find((a) => a.id === t.assigneeAdminId)?.name ?? null
      : null,
  }
}

export async function listTickets(
  params: ListParams & {
    sellerId?: string
    buyerId?: string
    type?: string
  } = {},
): Promise<Paginated<TicketListItem>> {
  await delay()
  const { page = 1, pageSize = 25, search = '', status, sellerId, buyerId, type, sort } = params
  let items = db.tickets.map(enrich)
  if (sellerId) items = items.filter((t) => t.sellerId === sellerId)
  if (buyerId) items = items.filter((t) => t.requesterBuyerId === buyerId)
  if (type) items = items.filter((t) => t.type === type)
  if (status) items = items.filter((t) => t.status === status)
  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (t) =>
        t.ticketNumber.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.requesterName.toLowerCase().includes(q),
    )
  }
  items = applySort(
    items,
    sort,
    {
      ticketNumber: (a, b) => a.ticketNumber.localeCompare(b.ticketNumber),
      subject: (a, b) => a.subject.localeCompare(b.subject),
      requesterName: (a, b) => a.requesterName.localeCompare(b.requesterName),
      type: (a, b) => a.type.localeCompare(b.type),
      status: (a, b) => a.status.localeCompare(b.status),
      updatedAt: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    'updatedAt:desc',
  )
  return paginate(items, page, pageSize)
}

export async function getTicket(id: string): Promise<TicketListItem | null> {
  await delay()
  const t = db.tickets.find((x) => x.id === id)
  return t ? enrich(t) : null
}

export async function getTicketMessages(ticketId: string) {
  await delay()
  return db.ticketMessages
    .filter((m) => m.ticketId === ticketId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
}

export async function replyToTicket(
  ticketId: string,
  body: string,
  author: { type: 'admin' | 'buyer' | 'seller'; id: string },
) {
  await delay()
  return addTicketMessage(ticketId, body, author)
}

export async function setTicketStatus(ticketId: string, status: TicketStatus) {
  await delay()
  return updateTicketStatus(ticketId, status)
}

export async function openTicket(data: {
  subject: string
  description: string
  requesterBuyerId: string
  type: 'site' | 'buyer_seller'
  sellerId?: string | null
}) {
  await delay()
  const ticket = createTicket(data)
  return enrich(ticket)
}

export async function assignTicket(ticketId: string, adminId: string) {
  await delay()
  const ticket = db.tickets.find((t) => t.id === ticketId)
  if (!ticket) return false
  ticket.assigneeAdminId = adminId
  ticket.updatedAt = new Date().toISOString()
  return true
}
