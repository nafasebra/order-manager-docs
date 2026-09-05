import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader, FilterBar, DataTable, ListPagination } from '@/components/patterns'
import { sellers } from '@/lib/api'
import { useListSearch } from '@/lib/router/useListSearch'
import type { SellersSearch } from '@/lib/router/searchSchemas'
import type { Seller } from '@/types'
import { Badge } from '@/components/ui/badge'

const statusOptions = [
  { value: 'enabled', label: 'Enabled' },
  { value: 'disabled', label: 'Disabled' },
]

const columns: ColumnDef<Seller>[] = [
  { accessorKey: 'displayName', header: 'Shop', meta: { sortable: true } },
  { accessorKey: 'contactName', header: 'Contact', meta: { sortable: true } },
  { accessorKey: 'contactEmail', header: 'Email', meta: { sortable: true } },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { sortable: true },
    cell: ({ row }) => (
      <Badge variant={row.original.status === 'enabled' ? 'secondary' : 'destructive'}>
        {row.original.status}
      </Badge>
    ),
  },
]

export function AdminSellersListPage(props: SellersSearch) {
  const { page, pageSize, search, status, sort } = props
  const navigate = useNavigate()
  const { patch, onSortChange } = useListSearch('/admin/sellers', props)

  const { data, isLoading } = useQuery({
    queryKey: ['sellers', { page, pageSize, search, status, sort }],
    queryFn: () => sellers.listSellers({ page, pageSize, search, status, sort }),
    placeholderData: (prev) => prev,
  })

  return (
    <div>
      <PageHeader title="Sellers" description="Vendor directory" />
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
          void navigate({ to: '/admin/sellers/$sellerId', params: { sellerId: row.id } })
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
