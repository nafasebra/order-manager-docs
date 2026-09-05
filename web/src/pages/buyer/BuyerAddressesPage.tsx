import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/patterns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { buyers } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import type { Address } from '@/types'
import { toast } from 'sonner'

export function BuyerAddressesPage() {
  const queryClient = useQueryClient()
  const { data: me } = useQuery({ queryKey: ME_QUERY_KEY })
  const { data: addresses } = useQuery({
    queryKey: ['buyer-addresses', me?.buyerId],
    queryFn: () => buyers.getBuyerAddresses(me!.buyerId!),
    enabled: !!me?.buyerId,
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    line: '',
    city: '',
    region: 'England',
    postalCode: '',
    country: 'GB',
    isDefaultShipping: false,
    isDefaultBilling: false,
    type: 'shipping' as const,
  })

  const handleAdd = async () => {
    if (!me?.buyerId) return
    await buyers.saveAddress(me.buyerId, form)
    await queryClient.invalidateQueries({ queryKey: ['buyer-addresses', me.buyerId] })
    setShowForm(false)
    setForm({
      line: '',
      city: '',
      region: 'England',
      postalCode: '',
      country: 'GB',
      isDefaultShipping: false,
      isDefaultBilling: false,
      type: 'shipping',
    })
    toast.success('Address added')
  }

  const setDefault = async (addr: Address, field: 'isDefaultShipping' | 'isDefaultBilling') => {
    if (!me?.buyerId) return
    await buyers.saveAddress(me.buyerId, { ...addr, [field]: true })
    await queryClient.invalidateQueries({ queryKey: ['buyer-addresses', me.buyerId] })
    toast.success('Default updated')
  }

  return (
    <div>
      <PageHeader
        title="Addresses"
        description="Shipping and billing addresses"
        actions={
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add address'}
          </Button>
        }
      />
      {showForm && (
        <div className="mb-6 max-w-xl space-y-3 rounded-xl border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Street</Label>
              <Input value={form.line} onChange={(e) => setForm({ ...form, line: e.target.value })} />
            </div>
            <div>
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div>
              <Label>Postal code</Label>
              <Input
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.isDefaultShipping}
              onCheckedChange={(v) => setForm({ ...form, isDefaultShipping: v })}
            />
            <Label>Default shipping</Label>
          </div>
          <Button onClick={() => void handleAdd()}>Save address</Button>
        </div>
      )}
      <ul className="space-y-3">
        {(addresses ?? []).map((a) => (
          <li key={a.id} className="rounded-xl border p-4">
            <p className="text-sm">
              {a.line}, {a.city} {a.postalCode}
            </p>
            <div className="mt-2 flex gap-2">
              {a.isDefaultShipping && (
                <span className="text-xs text-muted-foreground">Default shipping</span>
              )}
              {a.isDefaultBilling && (
                <span className="text-xs text-muted-foreground">Default billing</span>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              {!a.isDefaultShipping && (
                <Button size="sm" variant="outline" onClick={() => void setDefault(a, 'isDefaultShipping')}>
                  Set default shipping
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
