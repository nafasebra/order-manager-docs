import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { PageHeader, DescriptionList } from '@/components/patterns'
import { buyers, orders } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface AdminBuyerDetailPageProps {
  buyerId: string
}

export function AdminBuyerDetailPage({ buyerId }: AdminBuyerDetailPageProps) {
  const { data: buyer } = useQuery({
    queryKey: ['buyer', buyerId],
    queryFn: () => buyers.getBuyer(buyerId),
  })
  const { data: addresses } = useQuery({
    queryKey: ['buyer-addresses', buyerId],
    queryFn: () => buyers.getBuyerAddresses(buyerId),
  })
  const { data: orderCount } = useQuery({
    queryKey: ['buyer-order-count', buyerId],
    queryFn: () => buyers.getBuyerOrderCount(buyerId),
  })
  const { data: recentOrders } = useQuery({
    queryKey: ['buyer-orders', buyerId],
    queryFn: () => orders.listOrders({ buyerId, page: 1, pageSize: 5 }),
  })

  if (!buyer) return <div className="text-muted-foreground">Loading…</div>

  return (
    <div>
      <PageHeader
        title={buyer.name}
        description={buyer.email}
        actions={<Badge variant="secondary">{buyer.status}</Badge>}
      />
      <DescriptionList
        className="mb-6"
        items={[
          { label: 'Username', value: buyer.username },
          { label: 'Registered', value: formatDate(buyer.registeredAt) },
          { label: 'Last activity', value: formatDate(buyer.lastActivityAt) },
          { label: 'Orders', value: String(orderCount ?? 0) },
        ]}
      />
      <h2 className="mb-3 text-lg font-semibold">Addresses</h2>
      <ul className="mb-6 space-y-2">
        {(addresses ?? []).map((a) => (
          <li key={a.id} className="rounded-lg border p-3 text-sm">
            {a.line}, {a.city} {a.postalCode}
            {a.isDefaultShipping && (
              <Badge variant="outline" className="ml-2">
                Default shipping
              </Badge>
            )}
          </li>
        ))}
      </ul>
      <h2 className="mb-3 text-lg font-semibold">Recent orders</h2>
      <ul className="space-y-2">
        {(recentOrders?.items ?? []).map((o) => (
          <li key={o.id}>
            <Link
              to="/admin/orders/$orderId"
              params={{ orderId: o.id }}
              className="text-sm text-primary hover:underline"
            >
              {o.orderNumber} — {o.status}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
