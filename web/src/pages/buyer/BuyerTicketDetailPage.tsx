import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader, StatusChip, TicketThread } from '@/components/patterns'
import { tickets } from '@/lib/api'
import { adminUsers } from '@/mocks/fixtures/admins'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { toast } from 'sonner'

interface BuyerTicketDetailPageProps {
  ticketId: string
}

export function BuyerTicketDetailPage({ ticketId }: BuyerTicketDetailPageProps) {
  const queryClient = useQueryClient()
  const { data: me } = useQuery({ queryKey: ME_QUERY_KEY })
  const { data: ticket } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => tickets.getTicket(ticketId),
  })
  const { data: messages } = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: () => tickets.getTicketMessages(ticketId),
  })

  if (!ticket || ticket.requesterBuyerId !== me?.buyerId) {
    return <div className="text-muted-foreground">Ticket not found.</div>
  }

  const authorLabels: Record<string, string> = {
    ...Object.fromEntries(adminUsers.map((a) => [a.id, a.name])),
    [me!.id]: me!.name,
    system: 'System',
  }

  const handleReply = async (body: string) => {
    if (!me?.buyerId) return
    await tickets.replyToTicket(ticketId, body, { type: 'buyer', id: me.buyerId })
    await queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
    toast.success('Reply sent')
  }

  return (
    <div>
      <PageHeader
        title={ticket.subject}
        description={ticket.ticketNumber}
        actions={<StatusChip domain="ticket" status={ticket.status} />}
      />
      <TicketThread
        messages={messages ?? []}
        onSend={handleReply}
        readOnly={ticket.status === 'closed'}
        authorLabels={authorLabels}
      />
    </div>
  )
}
