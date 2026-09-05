import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  PageHeader,
  KpiCard,
  DataTable,
  SalesOverviewChart,
  OrderStatusChart,
  TopProductsChart,
} from '@/components/patterns'
import { StatusChip } from '@/components/patterns/StatusChip'
import { Skeleton } from '@/components/ui/skeleton'
import { orders } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { formatMoney, formatDate } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import type { OrderListItem } from '@/lib/api/orders'

const columns: ColumnDef<OrderListItem>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Order',
    cell: ({ row }) => (
      <Link
        to="/seller/orders/$orderId"
        params={{ orderId: row.original.id }}
        className="font-mono text-sm text-primary hover:underline"
      >
        {row.original.orderNumber}
      </Link>
    ),
  },
  { accessorKey: 'buyerName', header: 'Customer' },
  {
    accessorKey: 'total',
    header: 'Amount',
    cell: ({ row }) => formatMoney(row.original.total),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <StatusChip domain="order" status={row.original.status} />,
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
]

export function SellerOverviewPage() {
  const { data: me } = useQuery({ queryKey: ME_QUERY_KEY })
  const sellerId = me?.sellerId

  const { data: stats } = useQuery({
    queryKey: ['seller-overview', sellerId],
    queryFn: () => orders.getOverview(sellerId),
    enabled: !!sellerId,
  })
  const { data: salesTrend, isLoading: salesLoading } = useQuery({
    queryKey: ['seller-sales-trend', sellerId],
    queryFn: () => orders.getSalesOverview(7, sellerId),
    enabled: !!sellerId,
  })
  const { data: statusMix, isLoading: statusLoading } = useQuery({
    queryKey: ['seller-status-mix', sellerId],
    queryFn: () => orders.getStatusMix(sellerId),
    enabled: !!sellerId,
  })
  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['seller-top-products', sellerId],
    queryFn: () => orders.getTopProductsList(5, sellerId),
    enabled: !!sellerId,
  })
  const { data: recent } = useQuery({
    queryKey: ['seller-recent-orders', sellerId],
    queryFn: () => orders.getRecentOrders(5, sellerId),
    enabled: !!sellerId,
  })

  return (
    <div>
      <PageHeader title="Shop overview" description={`Welcome back, ${me?.name ?? ''}`} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue" value={stats?.revenue ?? 0} change={stats?.revenueChange} format="money" />
        <KpiCard label="Orders" value={stats?.orders ?? 0} change={stats?.ordersChange} />
        <KpiCard label="Customers" value={stats?.customers ?? 0} change={stats?.customersChange} />
        <KpiCard label="Avg. Order" value={stats?.avgOrder ?? 0} change={stats?.avgOrderChange} format="money" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {salesLoading ? (
            <Skeleton className="h-[360px]" />
          ) : (
            <SalesOverviewChart data={salesTrend ?? []} />
          )}
        </div>
        <div>
          {statusLoading ? (
            <Skeleton className="h-[360px]" />
          ) : (
            <OrderStatusChart data={statusMix ?? []} />
          )}
        </div>
      </div>

      <div className="mb-8">
        {productsLoading ? (
          <Skeleton className="h-[320px]" />
        ) : (
          <TopProductsChart data={topProducts ?? []} />
        )}
      </div>

      <h2 className="mb-4 text-lg font-semibold">Recent orders</h2>
      <DataTable columns={columns} data={recent ?? []} />
    </div>
  )
}
