import { useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { PageHeader, FilterBar, DataTable, ListPagination } from '@/components/patterns'
import { StatusChip } from '@/components/patterns/StatusChip'
import { orders } from '@/lib/api'
import { useListSearch } from '@/lib/router/useListSearch'
import type { OrdersSearch } from '@/lib/router/searchSchemas'
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
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.orderNumber}</span>
    ),
  },
  { accessorKey: 'buyerName', header: 'Customer', meta: { sortable: true } },
  { accessorKey: 'sellerNames', header: 'Seller(s)', meta: { sortable: true } },
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

export function AdminOrdersListPage(props: OrdersSearch) {
  const { page, pageSize, search, status, sort } = props
  const navigate = useNavigate()
  const { patch, onSortChange } = useListSearch('/admin/orders', props)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { page, pageSize, search, status, sort }],
    queryFn: () => orders.listOrders({ page, pageSize, search, status, sort }),
    placeholderData: (prev) => prev,
  })

  return (
    <div>
      <PageHeader title="Orders" description="Browse and manage platform orders" />
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
          void navigate({ to: '/admin/orders/$orderId', params: { orderId: row.id } })
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
