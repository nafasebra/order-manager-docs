import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import {
  PageHeader,
  StatusChip,
  SnapshotBlock,
  DataTable,
  ConfirmDialog,
} from '@/components/patterns'
import { Button } from '@/components/ui/button'
import { orders } from '@/lib/api'
import { ME_QUERY_KEY } from '@/lib/router/context'
import { formatMoney, formatDate } from '@/lib/utils'
import { toast } from 'sonner'

interface BuyerOrderDetailPageProps {
  orderId: string
}

export function BuyerOrderDetailPage({ orderId }: BuyerOrderDetailPageProps) {
  const queryClient = useQueryClient()
  const [cancelOpen, setCancelOpen] = useState(false)
  const { data: me } = useQuery({ queryKey: ME_QUERY_KEY })
  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orders.getOrder(orderId),
  })
  const { data: lineItems } = useQuery({
    queryKey: ['order-lines', orderId],
    queryFn: () => orders.getOrderLineItems(orderId),
  })

  if (!order || order.buyerId !== me?.buyerId) {
    return <div className="text-muted-foreground">Order not found.</div>
  }

  const canCancel = order.status === 'processing'

  const lineColumns: ColumnDef<(typeof lineItems extends (infer T)[] | undefined ? T : never)>[] = [
    { accessorKey: 'productNameSnapshot', header: 'Product' },
    { accessorKey: 'quantity', header: 'Qty' },
    {
      accessorKey: 'unitPriceSnapshot',
      header: 'Price',
      cell: ({ row }) => formatMoney(row.original.unitPriceSnapshot),
    },
  ]

  const handleCancel = async (reason?: string) => {
    if (!reason) return
    await orders.cancelOrderApi(orderId, reason, null, null)
    await queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    toast.success('Order canceled')
  }

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        description={`Placed ${formatDate(order.createdAt)}`}
        actions={
          <div className="flex items-center gap-2">
            <StatusChip domain="order" status={order.status} />
            {canCancel && (
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                Cancel order
              </Button>
            )}
          </div>
        }
      />
      <p className="mb-4 text-lg font-semibold">{formatMoney(order.total)}</p>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <SnapshotBlock title="Shipping to">
          {order.shippingAddressSnapshot.line}, {order.shippingAddressSnapshot.city}
        </SnapshotBlock>
        <SnapshotBlock title="Payment">
          {order.paymentWaySnapshot.label}
        </SnapshotBlock>
      </div>
      <DataTable columns={lineColumns} data={lineItems ?? []} />
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel order"
        description="Please provide a reason for cancellation."
        confirmLabel="Cancel order"
        destructive
        requireReason
        onConfirm={handleCancel}
      />
    </div>
  )
}
