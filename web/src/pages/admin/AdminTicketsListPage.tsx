import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader, FilterBar, DataTable, ListPagination } from '@/components/patterns'
import { StatusChip } from '@/components/patterns/StatusChip'
import { tickets } from '@/lib/api'
import { useListSearch } from '@/lib/router/useListSearch'
import type { TicketsSearch } from '@/lib/router/searchSchemas'
import { formatDate } from '@/lib/utils'
import type { TicketListItem } from '@/lib/api/tickets'
import { Badge } from '@/components/ui/badge'

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const typeOptions = [
  { value: 'site', label: 'Site' },
  { value: 'buyer_seller', label: 'Buyer–Seller' },
]

const columns: ColumnDef<TicketListItem>[] = [
  {
    accessorKey: 'ticketNumber',
    header: 'Ticket',
    meta: { sortable: true },
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.ticketNumber}</span>,
  },
  { accessorKey: 'subject', header: 'Subject', meta: { sortable: true } },
  { accessorKey: 'requesterName', header: 'Requester', meta: { sortable: true } },
  {
    accessorKey: 'type',
    header: 'Type',
    meta: { sortable: true },
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.type === 'site' ? 'Site' : 'Buyer–Seller'}</Badge>
    ),
  },
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

export function AdminTicketsListPage(props: TicketsSearch) {
  const { page, pageSize, search, status, sort, type } = props
  const navigate = useNavigate()
  const { patch, onSortChange } = useListSearch('/admin/support/tickets', props)

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', { page, pageSize, search, status, sort, type }],
    queryFn: () => tickets.listTickets({ page, pageSize, search, status, sort, type }),
    placeholderData: (prev) => prev,
  })

  return (
    <div>
      <PageHeader title="Support tickets" description="Site support queue" />
      <FilterBar
        search={search}
        onSearchChange={(s) => patch({ search: s || undefined }, true)}
        status={status}
        onStatusChange={(s) => patch({ status: s }, true)}
        statusOptions={statusOptions}
        secondary={{
          value: type,
          onChange: (t) => patch({ type: t }, true),
          options: typeOptions,
          placeholder: 'Type',
          allLabel: 'All types',
        }}
      />
      <DataTable
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        dense
        sort={sort}
        onSortChange={onSortChange}
        onRowClick={(row) =>
          void navigate({
            to: '/admin/support/tickets/$ticketId',
            params: { ticketId: row.id },
          })
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
