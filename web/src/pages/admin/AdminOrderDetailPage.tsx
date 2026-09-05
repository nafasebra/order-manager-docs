import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import {
  PageHeader,
  StatusChip,
  DescriptionList,
  SnapshotBlock,
  DataTable,
  ConfirmDialog,
} from '@/components/patterns'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { orders } from '@/lib/api'
import { formatMoney, formatDate } from '@/lib/utils'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { toast } from 'sonner'

interface AdminOrderDetailPageProps {
  orderId: string
}

export function AdminOrderDetailPage({ orderId }: AdminOrderDetailPageProps) {
  const queryClient = useQueryClient()
  const [cancelOpen, setCancelOpen] = useState(false)

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orders.getOrder(orderId),
  })
  const { data: lineItems } = useQuery({
    queryKey: ['order-lines', orderId],
    queryFn: () => orders.getOrderLineItems(orderId),
  })
  const { data: history } = useQuery({
    queryKey: ['order-history', orderId],
    queryFn: () => orders.getOrderHistory(orderId),
  })
  const { data: me } = useQuery({ queryKey: ME_QUERY_KEY })

  if (!order) return <div className="text-muted-foreground">Loading…</div>

  const lineColumns: ColumnDef<(typeof lineItems extends (infer T)[] | undefined ? T : never)>[] = [
    { accessorKey: 'productNameSnapshot', header: 'Product' },
    { accessorKey: 'quantity', header: 'Qty' },
    {
      accessorKey: 'unitPriceSnapshot',
      header: 'Unit price',
      cell: ({ row }) => formatMoney(row.original.unitPriceSnapshot),
    },
    {
      id: 'total',
      header: 'Total',
      cell: ({ row }) =>
        formatMoney(row.original.unitPriceSnapshot * row.original.quantity),
    },
  ]

  const canAdvance = order.status === 'processing' || order.status === 'shipping'
  const canCancel = order.status !== 'delivered' && order.status !== 'canceled'

  const handleAdvance = async () => {
    await orders.advanceOrder(orderId, me?.actorType === 'admin' ? me.id : null, null)
    await queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    await queryClient.invalidateQueries({ queryKey: ['order-history', orderId] })
    toast.success('Order status updated')
  }

  const handleCancel = async (reason?: string) => {
    if (!reason) return
    await orders.cancelOrderApi(orderId, reason, me?.id ?? null, null)
    await queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    toast.success('Order canceled')
  }

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        description={`Updated ${formatDate(order.updatedAt)}`}
        actions={
          <div className="flex gap-2">
            <StatusChip domain="order" status={order.status} />
            {canAdvance && (
              <Button onClick={() => void handleAdvance()}>Advance status</Button>
            )}
            {canCancel && (
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                Cancel order
              </Button>
            )}
          </div>
        }
      />

      <DescriptionList
        className="mb-6"
        items={[
          { label: 'Customer', value: order.buyerName },
          { label: 'Seller(s)', value: order.sellerNames },
          { label: 'Total', value: formatMoney(order.total) },
          {
            label: 'Buyer profile',
            value: (
              <Link to="/admin/buyers/$buyerId" params={{ buyerId: order.buyerId }} className="text-primary hover:underline">
                View buyer
              </Link>
            ),
          },
        ]}
      />

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <SnapshotBlock title="Shipping address">
          {order.shippingAddressSnapshot.line}, {order.shippingAddressSnapshot.city},{' '}
          {order.shippingAddressSnapshot.postalCode}
        </SnapshotBlock>
        <SnapshotBlock title="Delivery method">
          {order.deliveryMethodSnapshot.label} — {order.deliveryMethodSnapshot.instructions}
        </SnapshotBlock>
        <SnapshotBlock title="Payment way">
          {order.paymentWaySnapshot.label} — {order.paymentWaySnapshot.instructions}
        </SnapshotBlock>
      </div>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Line items</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="items" className="mt-4">
          <DataTable columns={lineColumns} data={lineItems ?? []} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <ul className="space-y-3">
            {(history ?? []).map((h) => (
              <li key={h.id} className="flex justify-between border-b pb-2 text-sm">
                <span>
                  {h.fromStatus ? `${h.fromStatus} → ` : ''}
                  <strong>{h.toStatus}</strong>
                  {h.note && ` — ${h.note}`}
                </span>
                <span className="text-muted-foreground">{formatDate(h.createdAt)}</span>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel order"
        description="This action requires a reason and cannot be undone."
        confirmLabel="Cancel order"
        destructive
        requireReason
        onConfirm={handleCancel}
      />
    </div>
  )
}
