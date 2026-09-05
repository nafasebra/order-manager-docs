import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  PageHeader,
  StatusChip,
  DescriptionList,
  TicketThread,
} from '@/components/patterns'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { tickets } from '@/lib/api'
import { adminUsers } from '@/mocks/fixtures/admins'
import { ME_QUERY_KEY } from '@/lib/router/context'
import type { TicketStatus } from '@/types'
import { toast } from 'sonner'

interface AdminTicketDetailPageProps {
  ticketId: string
}

export function AdminTicketDetailPage({ ticketId }: AdminTicketDetailPageProps) {
  const queryClient = useQueryClient()
  const { data: ticket } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => tickets.getTicket(ticketId),
  })
  const { data: messages } = useQuery({
    queryKey: ['ticket-messages', ticketId],
    queryFn: () => tickets.getTicketMessages(ticketId),
  })
  const { data: me } = useQuery({ queryKey: ME_QUERY_KEY })

  if (!ticket) return <div className="text-muted-foreground">Loading…</div>

  const authorLabels: Record<string, string> = {
    ...Object.fromEntries(adminUsers.map((a) => [a.id, a.name])),
    system: 'System',
  }

  const handleReply = async (body: string) => {
    if (!me) return
    await tickets.replyToTicket(ticketId, body, { type: 'admin', id: me.id })
    await queryClient.invalidateQueries({ queryKey: ['ticket-messages', ticketId] })
    toast.success('Reply sent')
  }

  const handleStatus = async (status: TicketStatus) => {
    await tickets.setTicketStatus(ticketId, status)
    await queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] })
    toast.success('Status updated')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <PageHeader title={ticket.subject} description={ticket.ticketNumber} />
        <TicketThread
          messages={messages ?? []}
          onSend={handleReply}
          readOnly={ticket.status === 'closed'}
          authorLabels={authorLabels}
        />
      </div>
      <div className="space-y-4">
        <DescriptionList
          items={[
            { label: 'Requester', value: ticket.requesterName },
            { label: 'Priority', value: ticket.priority },
            { label: 'Assignee', value: ticket.assigneeName ?? 'Unassigned' },
            {
              label: 'Status',
              value: <StatusChip domain="ticket" status={ticket.status} />,
            },
          ]}
        />
        <div>
          <label className="mb-2 block text-sm font-medium">Update status</label>
          <Select value={ticket.status} onValueChange={(v) => void handleStatus(v as TicketStatus)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(['open', 'in_progress', 'waiting', 'resolved', 'closed'] as TicketStatus[]).map(
                (s) => (
                  <SelectItem key={s} value={s}>
                    {s.replace('_', ' ')}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
