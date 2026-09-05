import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader, FilterBar, DataTable, ListPagination } from '@/components/patterns'
import { StatusChip } from '@/components/patterns/StatusChip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { tickets } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { useListSearch } from '@/lib/router/useListSearch'
import type { TicketsSearch } from '@/lib/router/searchSchemas'
import type { SessionUser } from '@/types'
import { formatDate } from '@/lib/utils'
import type { TicketListItem } from '@/lib/api/tickets'
import { toast } from 'sonner'

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const columns: ColumnDef<TicketListItem>[] = [
  {
    accessorKey: 'ticketNumber',
    header: 'Ticket',
    meta: { sortable: true },
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.ticketNumber}</span>,
  },
  { accessorKey: 'subject', header: 'Subject', meta: { sortable: true } },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { sortable: true },
    cell: ({ row }) => <StatusChip domain="ticket" status={row.original.status} />,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    meta: { sortable: true },
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
]

export function BuyerTicketsListPage(props: TicketsSearch) {
  const { page, pageSize, search, status, sort } = props
  const navigate = useNavigate()
  const { patch, onSortChange } = useListSearch('/account/tickets', props)
  const { data: me } = useQuery<SessionUser | null>({ queryKey: ME_QUERY_KEY })
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['buyer-tickets', me?.buyerId, { page, pageSize, search, status, sort }],
    queryFn: () =>
      tickets.listTickets({ buyerId: me!.buyerId!, page, pageSize, search, status, sort }),
    enabled: !!me?.buyerId,
    placeholderData: (prev) => prev,
  })

  const handleOpen = async () => {
    if (!me?.buyerId || !subject.trim()) return
    await tickets.openTicket({
      subject,
      description,
      requesterBuyerId: me.buyerId,
      type: 'site',
    })
    setShowForm(false)
    setSubject('')
    setDescription('')
    await refetch()
    toast.success('Ticket opened')
  }

  return (
    <div>
      <PageHeader
        title="Support tickets"
        description="Get help with your account"
        actions={<Button onClick={() => setShowForm(!showForm)}>Open ticket</Button>}
      />
      {showForm && (
        <div className="mb-6 max-w-xl space-y-3 rounded-xl border p-4">
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button onClick={() => void handleOpen()}>Submit</Button>
        </div>
      )}
      <FilterBar
        search={search}
        onSearchChange={(s) => patch({ search: s || undefined }, true)}
        status={status}
        onStatusChange={(s) => patch({ status: s }, true)}
        statusOptions={statusOptions}
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        sort={sort}
        onSortChange={onSortChange}
        onRowClick={(row) =>
          void navigate({ to: '/account/tickets/$ticketId', params: { ticketId: row.id } })
        }
      />
      {data && (
        <ListPagination
          page={page}
          pageSize={pageSize}
          total={data.total}
          onPageChange={(p) => patch({ page: p })}
        />
      )}
    </div>
  )
}
