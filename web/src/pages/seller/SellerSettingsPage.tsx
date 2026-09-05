import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader, WaySettingsList } from '@/components/patterns'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { sellers } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import type { SellerWay } from '@/types'
import { toast } from 'sonner'

export function SellerSettingsPage() {
  const { data: me } = useQuery({ queryKey: ME_QUERY_KEY })
  const sellerId = me?.sellerId

  const { data: seller } = useQuery({
    queryKey: ['seller', sellerId],
    queryFn: () => sellers.getSeller(sellerId!),
    enabled: !!sellerId,
  })
  const { data: delivery } = useQuery({
    queryKey: ['seller-delivery', sellerId],
    queryFn: () => sellers.getSellerDeliveryMethods(sellerId!),
    enabled: !!sellerId,
  })
  const { data: payment } = useQuery({
    queryKey: ['seller-payment', sellerId],
    queryFn: () => sellers.getSellerPaymentWays(sellerId!),
    enabled: !!sellerId,
  })

  const [profile, setProfile] = useState({ displayName: '', contactPhone: '', workplaceAddressText: '' })
  const [deliveryWays, setDeliveryWays] = useState<SellerWay[]>([])
  const [paymentWays, setPaymentWays] = useState<SellerWay[]>([])

  useEffect(() => {
    if (seller) {
      setProfile({
        displayName: seller.displayName,
        contactPhone: seller.contactPhone,
        workplaceAddressText: seller.workplaceAddressText,
      })
    }
  }, [seller])

  useEffect(() => {
    if (delivery) setDeliveryWays(delivery)
  }, [delivery])

  useEffect(() => {
    if (payment) setPaymentWays(payment)
  }, [payment])

  const saveProfile = async () => {
    if (!sellerId) return
    await sellers.updateSeller(sellerId, profile)
    toast.success('Profile saved')
  }

  return (
    <div>
      <PageHeader title="Settings" description="Shop profile, delivery methods, and payment ways" />
      <div className="mb-8 max-w-xl space-y-4 rounded-xl border p-6">
        <h2 className="text-lg font-semibold">Shop profile</h2>
        <div className="space-y-2">
          <Label>Display name</Label>
          <Input
            value={profile.displayName}
            onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Phone</Label>
          <Input
            value={profile.contactPhone}
            onChange={(e) => setProfile({ ...profile, contactPhone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Workplace address</Label>
          <Input
            value={profile.workplaceAddressText}
            onChange={(e) => setProfile({ ...profile, workplaceAddressText: e.target.value })}
          />
        </div>
        <Button onClick={() => void saveProfile()}>Save profile</Button>
      </div>
      <div className="space-y-6">
        <WaySettingsList
          title="Delivery methods"
          ways={deliveryWays}
          onChange={setDeliveryWays}
          onSave={(ways) =>
            sellers.saveSellerWays(sellerId!, 'delivery', ways).then((r) => {
              if (r.ok) toast.success('Delivery methods saved')
              return r
            })
          }
        />
        <WaySettingsList
          title="Payment ways"
          ways={paymentWays}
          onChange={setPaymentWays}
          onSave={(ways) =>
            sellers.saveSellerWays(sellerId!, 'payment', ways).then((r) => {
              if (r.ok) toast.success('Payment ways saved')
              return r
            })
          }
          showPaymentHint
        />
      </div>
    </div>
  )
}
