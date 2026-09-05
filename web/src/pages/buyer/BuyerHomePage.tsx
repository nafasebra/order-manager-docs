import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/patterns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { orders } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { formatMoney, formatDate } from '@/lib/utils'

export function BuyerHomePage() {
  const { data: me } = useQuery({ queryKey: ME_QUERY_KEY })
  const { data: recentOrders } = useQuery({
    queryKey: ['buyer-orders-recent', me?.buyerId],
    queryFn: () => orders.listOrders({ buyerId: me!.buyerId!, page: 1, pageSize: 3 }),
    enabled: !!me?.buyerId,
  })

  return (
    <div>
      <PageHeader title="Account home" description={`Welcome, ${me?.name ?? ''}`} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/account/orders" className="text-sm text-primary hover:underline">
              View all orders →
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/account/addresses" className="text-sm text-primary hover:underline">
              Manage addresses →
            </Link>
          </CardContent>
        </Card>
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-base">Support</CardTitle>
          </CardHeader>
          <CardContent>
            <Link to="/account/tickets" className="text-sm text-primary hover:underline">
              View tickets →
            </Link>
          </CardContent>
        </Card>
      </div>
      {recentOrders && recentOrders.items.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-lg font-semibold">Recent orders</h2>
          <ul className="space-y-2">
            {recentOrders.items.map((o) => (
              <li key={o.id} className="flex justify-between rounded-lg border px-4 py-3 text-sm">
                <Link
                  to="/account/orders/$orderId"
                  params={{ orderId: o.id }}
                  className="font-mono text-primary hover:underline"
                >
                  {o.orderNumber}
                </Link>
                <span>{formatMoney(o.total)}</span>
                <span className="text-muted-foreground">{formatDate(o.createdAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
