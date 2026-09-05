import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader, FilterBar, DataTable, ListPagination } from '@/components/patterns'
import { StatusChip } from '@/components/patterns/StatusChip'
import { orders } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { useListSearch } from '@/lib/router/useListSearch'
import type { OrdersSearch } from '@/lib/router/searchSchemas'
import type { SessionUser } from '@/types'
import { formatMoney, formatDate } from '@/lib/utils'
import type { OrderListItem } from '@/lib/api/orders'

const statusOptions = [
  { value: 'processing', label: 'Processing' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'canceled', label: 'Canceled' },
]

const columns: ColumnDef<OrderListItem>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Order',
    meta: { sortable: true },
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.orderNumber}</span>,
  },
  { accessorKey: 'buyerName', header: 'Customer', meta: { sortable: true } },
  {
    accessorKey: 'total',
    header: 'Amount',
    meta: { sortable: true },
    cell: ({ row }) => formatMoney(row.original.total),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    meta: { sortable: true },
    cell: ({ row }) => <StatusChip domain="order" status={row.original.status} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    meta: { sortable: true },
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
]

export function SellerOrdersListPage(props: OrdersSearch) {
  const { page, pageSize, search, status, sort } = props
  const navigate = useNavigate()
  const { patch, onSortChange } = useListSearch('/seller/orders', props)
  const { data: me } = useQuery<SessionUser | null>({ queryKey: ME_QUERY_KEY })

  const { data, isLoading } = useQuery({
    queryKey: ['seller-orders', me?.sellerId, { page, pageSize, search, status, sort }],
    queryFn: () =>
      orders.listOrders({ page, pageSize, search, status, sort, sellerId: me!.sellerId! }),
    enabled: !!me?.sellerId,
    placeholderData: (prev) => prev,
  })

  return (
    <div>
      <PageHeader title="Orders" description="Orders containing your products" />
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
          void navigate({ to: '/seller/orders/$orderId', params: { orderId: row.id } })
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
