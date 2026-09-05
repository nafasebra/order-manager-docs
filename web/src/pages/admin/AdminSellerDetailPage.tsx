import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader, DescriptionList, WaySettingsList } from '@/components/patterns'
import { sellers } from '@/lib/api'
import type { SellerWay } from '@/types'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface AdminSellerDetailPageProps {
  sellerId: string
}

export function AdminSellerDetailPage({ sellerId }: AdminSellerDetailPageProps) {
  const { data: seller } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: () => sellers.getSeller(sellerId),
  })
  const { data: delivery } = useQuery({
    queryKey: ['seller-delivery', sellerId],
    queryFn: () => sellers.getSellerDeliveryMethods(sellerId),
  })
  const { data: payment } = useQuery({
    queryKey: ['seller-payment', sellerId],
    queryFn: () => sellers.getSellerPaymentWays(sellerId),
  })
  const { data: productCount } = useQuery({
    queryKey: ['seller-products-count', sellerId],
    queryFn: () => sellers.getSellerProductCount(sellerId),
  })
  const { data: orderCount } = useQuery({
    queryKey: ['seller-orders-count', sellerId],
    queryFn: () => sellers.getSellerOrderCount(sellerId),
  })

  const [deliveryWays, setDeliveryWays] = useState<SellerWay[]>([])
  const [paymentWays, setPaymentWays] = useState<SellerWay[]>([])

  useEffect(() => {
    if (delivery) setDeliveryWays(delivery)
  }, [delivery])

  useEffect(() => {
    if (payment) setPaymentWays(payment)
  }, [payment])

  if (!seller) return <div className="text-muted-foreground">Loading…</div>

  return (
    <div>
      <PageHeader
        title={seller.displayName}
        description={seller.contactEmail}
        actions={<Badge variant="secondary">{seller.status}</Badge>}
      />
      <DescriptionList
        className="mb-8"
        items={[
          { label: 'Contact', value: seller.contactName },
          { label: 'Phone', value: seller.contactPhone },
          { label: 'Address', value: seller.workplaceAddressText },
          { label: 'Products', value: String(productCount ?? 0) },
          { label: 'Orders', value: String(orderCount ?? 0) },
        ]}
      />
      <div className="space-y-6">
        <WaySettingsList
          title="Delivery methods"
          ways={deliveryWays.length ? deliveryWays : delivery ?? []}
          onChange={setDeliveryWays}
          onSave={(ways) => sellers.saveSellerWays(sellerId, 'delivery', ways).then((r) => {
            if (r.ok) toast.success('Delivery methods saved')
            return r
          })}
        />
        <WaySettingsList
          title="Payment ways"
          ways={paymentWays.length ? paymentWays : payment ?? []}
          onChange={setPaymentWays}
          onSave={(ways) => sellers.saveSellerWays(sellerId, 'payment', ways).then((r) => {
            if (r.ok) toast.success('Payment ways saved')
            return r
          })}
          showPaymentHint
        />
      </div>
    </div>
  )
}
