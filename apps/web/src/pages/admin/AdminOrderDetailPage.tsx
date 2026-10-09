import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/patterns/PageHeader";
import { StatusChip } from "@/components/patterns/StatusChip";
import { DataTable } from "@/components/patterns/DataTable";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useMockMutation,
  useOrder,
  useOrderTransactions,
} from "@/lib/api/resources";
import { getSession } from "@/lib/auth/store";
import { can } from "@/lib/permissions/can";
import { formatMoney, formatDate } from "@/lib/formats";
import type { OrderLineItem } from "@/types";

function OrderCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-5">{children}</CardContent>
    </Card>
  );
}

export function AdminOrderDetailPage({ orderId }: { orderId: string }) {
  const user = getSession();
  const canEdit = can(user, "orders", "edit");
  const canViewPayments = can(user, "transactions", "view");
  const { data, isLoading, isError } = useOrder(orderId);
  const paymentsQuery = useOrderTransactions(orderId, canViewPayments);
  const mutate = useMockMutation("orders");
  const [action, setAction] = useState<"cancel" | "advance" | null>(null);

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !data) return <ErrorState title="Order not found" />;

  const money = (amount: number) => formatMoney(amount, data.currency);
  const terminal = data.status === "delivered" || data.status === "canceled";
  const ledger = paymentsQuery.data ?? [];
  const paid = ledger
    .filter((item) => item.type === "payment" && item.status === "completed")
    .reduce((sum, item) => sum + item.amount, 0);
  const refunded = ledger
    .filter((item) => item.type === "refund" && item.status === "completed")
    .reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const linesTotal = data.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const groups = Array.from(new Set(data.lineItems.map((item) => item.sellerId)))
    .map((sellerId) => {
      const items = data.lineItems.filter((item) => item.sellerId === sellerId);
      return {
        sellerId,
        name: items[0].sellerName,
        items,
        subtotal: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
      };
    });
  const columns: ColumnDef<OrderLineItem>[] = [
    {
      accessorKey: "productName",
      header: "Product",
      cell: ({ row }) => can(user, "products", "view") ? (
        <Link to="/admin/products/$productId" params={{ productId: row.original.productId }} className="text-primary underline">
          {row.original.productName}
        </Link>
      ) : row.original.productName,
    },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "unitPrice", header: "Unit price", cell: ({ row }) => money(row.original.unitPrice) },
    { id: "total", accessorFn: (item) => item.quantity * item.unitPrice, header: "Total", cell: ({ row }) => money(row.original.quantity * row.original.unitPrice) },
  ];

  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <Link to="/admin/orders" className="hover:underline">Orders</Link>
        <span aria-hidden> / </span><span>{data.orderNumber}</span>
      </nav>
      <PageHeader
        title={data.orderNumber}
        description={`Placed ${formatDate(data.createdAt)} · Updated ${formatDate(data.updatedAt)}`}
        actions={canEdit ? (
          <>
            <Button variant="outline" disabled={terminal || mutate.isPending} onClick={() => setAction("advance")}>Advance fulfillment</Button>
            <Button variant="destructive" disabled={terminal || mutate.isPending} onClick={() => setAction("cancel")}>Cancel order</Button>
          </>
        ) : undefined}
      />
      <div className="flex flex-wrap items-center gap-4 border-y py-4 text-sm">
        <span>{data.lineItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
        <span>{groups.length} stores</span>
        <span className="font-semibold">Order total {money(data.total)}</span>
        <StatusChip kind="order" status={data.status} />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <OrderCard title="Items by seller">
            {groups.map((group) => (
              <section key={group.sellerId} className="space-y-3 border-b pb-5 last:border-0 last:pb-0">
                <div className="flex flex-wrap justify-between gap-2">
                  <h3 className="font-semibold">{can(user, "sellers", "view") ? <Link to="/admin/sellers/$sellerId" params={{ sellerId: group.sellerId }} className="text-primary underline">{group.name}</Link> : group.name}</h3>
                  <span className="text-sm">Store subtotal {money(group.subtotal)}</span>
                </div>
                <DataTable columns={columns} data={group.items} dense />
              </section>
            ))}
          </OrderCard>
          <OrderCard title="Fulfillment coordination">
            <p className="text-sm">Delivery method: {data.deliveryMethodSnapshot}</p>
            <p className="text-sm text-muted-foreground">The recorded status applies to the whole order. Separate seller shipments, tracking numbers, and delay alerts are not captured yet.</p>
            <DataTable data={groups} columns={[
              { accessorKey: "name", header: "Store" },
              { id: "items", accessorFn: (group) => group.items.reduce((sum, item) => sum + item.quantity, 0), header: "Items" },
              { id: "status", accessorFn: () => data.status, header: "Order status", cell: () => <StatusChip kind="order" status={data.status} /> },
            ]} />
          </OrderCard>
          <OrderCard title="Financial breakdown">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt>Items subtotal</dt><dd>{money(linesTotal)}</dd></div>
              {["Discounts", "Shipping charges", "Taxes", "Platform commission", "Seller settlements"].map((label) => <div key={label} className="flex justify-between gap-4"><dt>{label}</dt><dd className="text-muted-foreground">Not recorded</dd></div>)}
              <div className="flex justify-between gap-4 border-t pt-3 font-semibold"><dt>Recorded order total</dt><dd>{money(data.total)}</dd></div>
            </dl>
            <p className="text-xs text-muted-foreground">Store item subtotals are not seller payout allocations.</p>
          </OrderCard>
          <OrderCard title="Transactions">
            <p className="text-sm text-muted-foreground">Payment method: {data.paymentWaySnapshot}. This is a mock ledger, not a live payment service.</p>
            {!canViewPayments ? <p className="text-sm">Transaction access requires billing permissions.</p> : paymentsQuery.isError ? <ErrorState title="Could not load transactions" /> : (
              <DataTable data={ledger} isLoading={paymentsQuery.isLoading} columns={[
                { accessorKey: "reference", header: "Reference", cell: ({ row }) => <Link to="/admin/transactions/$transactionId" params={{ transactionId: row.original.id }} className="text-primary underline">{row.original.reference}</Link> },
                { accessorKey: "type", header: "Type" },
                { accessorKey: "status", header: "Status" },
                { accessorKey: "sellerId", header: "Seller ID" },
                { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.original.createdAt) },
                { accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className={row.original.type === "refund" ? "text-destructive" : undefined}>{formatMoney(row.original.amount, row.original.currency)}</span> },
              ]} />
            )}
            {canViewPayments && paymentsQuery.isSuccess && (
              <dl className="space-y-3 border-t pt-4 text-sm">
                <div className="flex justify-between gap-4"><dt>Completed payments</dt><dd>{money(paid)}</dd></div>
                <div className="flex justify-between gap-4"><dt>Completed refunds</dt><dd>{money(refunded)}</dd></div>
                <div className="flex justify-between gap-4"><dt>Recorded balance</dt><dd>{money(data.total - paid + refunded)}</dd></div>
              </dl>
            )}
            <p className="text-xs text-muted-foreground">Open a transaction for existing billing controls. Recorded balance excludes payouts and adjustments and is not a statement of customer debt.</p>
          </OrderCard>
          <OrderCard title="Order notes">
            <p className="text-sm text-muted-foreground">Separate internal staff notes and customer-visible notes are not yet recorded. Existing reasons appear in the audit history below.</p>
          </OrderCard>
          <OrderCard title="Audit history">
            <DataTable data={data.history} columns={[
              { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusChip kind="order" status={row.original.status} /> },
              { accessorKey: "at", header: "When", cell: ({ row }) => formatDate(row.original.at) },
              { accessorKey: "by", header: "Actor", cell: ({ row }) => row.original.by || "Not recorded" },
              { accessorKey: "note", header: "Reason / note", cell: ({ row }) => row.original.note || "—" },
            ]} />
          </OrderCard>
        </div>
        <aside className="space-y-6" aria-label="Customer and addresses">
          <OrderCard title="Customer">
            <p className="font-medium">{can(user, "buyers", "view") ? <Link to="/admin/buyers/$buyerId" params={{ buyerId: data.buyerId }} className="text-primary underline">{data.buyerName}</Link> : data.buyerName}</p>
            <p className="text-sm text-muted-foreground">Customer ID: {data.buyerId}</p>
          </OrderCard>
          <OrderCard title="Contact person">
            <p className="text-sm">{data.buyerName}</p>
            <a href={`mailto:${data.buyerEmail}`} className="block break-all text-sm text-primary underline">{data.buyerEmail}</a>
            <p className="text-sm text-muted-foreground">Phone not recorded</p>
          </OrderCard>
          <OrderCard title="Shipping address">
            <address className="space-y-1 text-sm not-italic">
              <p>{data.buyerName}</p>
              <p>{data.shippingAddress.line1}</p>
              {data.shippingAddress.line2 && <p>{data.shippingAddress.line2}</p>}
              <p>{[data.shippingAddress.city, data.shippingAddress.region, data.shippingAddress.postalCode].filter(Boolean).join(", ")}</p>
              <p>{data.shippingAddress.country}</p>
            </address>
          </OrderCard>
          <OrderCard title="Billing address">
            <p className="text-sm text-muted-foreground">No separate billing address was captured for this order.</p>
          </OrderCard>
        </aside>
      </div>
      <ConfirmDialog
        open={Boolean(action)}
        onOpenChange={(open) => { if (!open) setAction(null); }}
        title={action === "cancel" ? "Cancel order" : "Advance fulfillment"}
        description="This updates the whole order, including all participating stores. A reason is required and recorded in the audit history."
        confirmLabel={action === "cancel" ? "Cancel order" : "Advance fulfillment"}
        destructive={action === "cancel"}
        requireReason
        onConfirm={async (reason) => {
          if (!canEdit || !action) throw new Error("Order edit permission required.");
          await mutate.mutateAsync({ id: data.id, action, reason });
          toast.success("Order updated");
        }}
      />
    </div>
  );
}
