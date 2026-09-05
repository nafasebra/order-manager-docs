import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader, FilterBar, DataTable, ListPagination } from '@/components/patterns'
import { buyers } from '@/lib/api'
import { useListSearch } from '@/lib/router/useListSearch'
import type { BuyersSearch } from '@/lib/router/searchSchemas'
import { formatDate } from '@/lib/utils'
import type { Buyer } from '@/types'
import { Badge } from '@/components/ui/badge'

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
]

const columns: ColumnDef<Buyer>[] = [
  { accessorKey: 'name', header: 'Name', meta: { sortable: true } },
  { accessorKey: 'email', header: 'Email', meta: { sortable: true } },
  { accessorKey: 'username', header: 'Username', meta: { sortable: true } },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { sortable: true },
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'active' ? 'secondary' : 'destructive'}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'registeredAt',
    header: 'Registered',
    meta: { sortable: true },
    cell: ({ row }) => formatDate(row.original.registeredAt),
  },
]

export function AdminBuyersListPage(props: BuyersSearch) {
  const { page, pageSize, search, status, sort } = props
  const navigate = useNavigate()
  const { patch, onSortChange } = useListSearch('/admin/buyers', props)

  const { data, isLoading } = useQuery({
    queryKey: ['buyers', { page, pageSize, search, status, sort }],
    queryFn: () => buyers.listBuyers({ page, pageSize, search, status, sort }),
    placeholderData: (prev) => prev,
  })

  return (
    <div>
      <PageHeader title="Buyers" description="Customer directory" />
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
        dense
        sort={sort}
        onSortChange={onSortChange}
        onRowClick={(row) =>
          void navigate({ to: '/admin/buyers/$buyerId', params: { buyerId: row.id } })
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
