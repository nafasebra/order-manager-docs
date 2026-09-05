import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  PageHeader,
  KpiCard,
  DataTable,
  SalesOverviewChart,
  OrderStatusChart,
  TopProductsChart,
  TopSellersChart,
} from '@/components/patterns'
import { StatusChip } from '@/components/patterns/StatusChip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { orders } from '@/lib/api'
import { formatMoney, formatDate } from '@/lib/utils'
import type { ColumnDef } from '@tanstack/react-table'
import type { OrderListItem } from '@/lib/api/orders'

const columns: ColumnDef<OrderListItem>[] = [
  {
    accessorKey: 'orderNumber',
    header: 'Order',
    cell: ({ row }) => (
      <Link
        to="/admin/orders/$orderId"
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

export function AdminOverviewPage() {
  const { data: stats } = useQuery({
    queryKey: ['overview'],
    queryFn: () => orders.getOverview(),
  })
  const { data: salesTrend, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-trend'],
    queryFn: () => orders.getSalesOverview(7),
  })
  const { data: statusMix, isLoading: statusLoading } = useQuery({
    queryKey: ['status-mix'],
    queryFn: () => orders.getStatusMix(),
  })
  const { data: topProducts, isLoading: productsLoading } = useQuery({
    queryKey: ['top-products'],
    queryFn: () => orders.getTopProductsList(5),
  })
  const { data: topSellers, isLoading: sellersLoading } = useQuery({
    queryKey: ['top-sellers'],
    queryFn: () => orders.getTopSellersList(5),
  })
  const { data: recent } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: () => orders.getRecentOrders(5),
  })
  const { data: pending } = useQuery({
    queryKey: ['pending-work'],
    queryFn: () => orders.getPendingWork(),
  })

  return (
    <div>
      <PageHeader title="Dashboard" description="Good morning — platform overview" />
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

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {productsLoading ? (
          <Skeleton className="h-[320px]" />
        ) : (
          <TopProductsChart data={topProducts ?? []} />
        )}
        {sellersLoading ? (
          <Skeleton className="h-[320px]" />
        ) : (
          <TopSellersChart data={topSellers ?? []} />
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Recent orders</h2>
          <DataTable columns={columns} data={recent ?? []} dense />
        </div>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Pending work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(pending ?? []).map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center justify-between rounded-md border px-3 py-2 text-sm hover:bg-muted/50"
              >
                <span>{item.label}</span>
                <span className="font-semibold">{item.count}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
