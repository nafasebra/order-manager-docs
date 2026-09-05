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
import { formatMoney } from '@/lib/utils'
import { toast } from 'sonner'

interface SellerOrderDetailPageProps {
  orderId: string
}

export function SellerOrderDetailPage({ orderId }: SellerOrderDetailPageProps) {
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

  const myLines = (lineItems ?? []).filter((li) => li.sellerId === me?.sellerId)
  const myTotal = myLines.reduce((s, li) => s + li.unitPriceSnapshot * li.quantity, 0)

  if (!order) return <div className="text-muted-foreground">Loading…</div>

  const canAdvance = order.status === 'processing' || order.status === 'shipping'
  const canCancel = order.status !== 'delivered' && order.status !== 'canceled'

  const lineColumns: ColumnDef<(typeof myLines)[0]>[] = [
    { accessorKey: 'productNameSnapshot', header: 'Product' },
    { accessorKey: 'quantity', header: 'Qty' },
    {
      accessorKey: 'unitPriceSnapshot',
      header: 'Unit',
      cell: ({ row }) => formatMoney(row.original.unitPriceSnapshot),
    },
  ]

  const handleAdvance = async () => {
    await orders.advanceOrder(orderId, null, me!.sellerId!)
    await queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    toast.success('Split status updated')
  }

  const handleCancel = async (reason?: string) => {
    if (!reason) return
    await orders.cancelOrderApi(orderId, reason, null, me!.sellerId!)
    await queryClient.invalidateQueries({ queryKey: ['order', orderId] })
    toast.success('Order canceled')
  }

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        description="Your fulfillment split"
        actions={
          <div className="flex gap-2">
            <StatusChip domain="order" status={order.status} />
            {canAdvance && <Button onClick={() => void handleAdvance()}>Advance</Button>}
            {canCancel && (
              <Button variant="destructive" onClick={() => setCancelOpen(true)}>
                Cancel split
              </Button>
            )}
          </div>
        }
      />
      <p className="mb-4 text-sm text-muted-foreground">
        Your lines total: <strong>{formatMoney(myTotal)}</strong>
      </p>
      <SnapshotBlock title="Delivery snapshot">
        {order.deliveryMethodSnapshot.label}
      </SnapshotBlock>
      <div className="mt-6">
        <DataTable columns={lineColumns} data={myLines} />
      </div>
      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel your split"
        description="Provide a reason for cancellation."
        confirmLabel="Cancel split"
        destructive
        requireReason
        onConfirm={handleCancel}
      />
    </div>
  )
}
