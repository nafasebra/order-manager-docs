import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { getSession } from "@/lib/auth/store";
import { useSellerOrder, useSellerOrders, useSellerOrderTransactions } from "@/lib/api/sellerCommerce";
import { useSeller, useMockMutation } from "@/lib/api/resources";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable } from "@/components/patterns/DataTable";
import { ListPagination } from "@/components/patterns/ListPagination";
import { ErrorState } from "@/components/patterns/ErrorState";
import { StatusChip } from "@/components/patterns/StatusChip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WaySettingsList } from "@/components/patterns/WaySettingsList";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatMoney } from "@/lib/formats";
import type { ListParams, OrderStatus, Seller } from "@/types";

export function SellerOrdersListPage({
  search,
  onSearchChange,
}: {
  search: ListParams;
  onSearchChange: (next: Partial<ListParams>) => void;
}) {
  const query = useSellerOrders(getSession()!.sellerId!, search);
  return (
    <div className="space-y-4">
      <PageHeader
        title="Orders"
        description="Customer orders containing your products. Totals show your store's items."
      />
      <div className="flex flex-wrap gap-2">
        <Input
          className="w-64"
          aria-label="Search orders"
          placeholder="Search order or customer…"
          value={String(search.q ?? "")}
          onChange={(event) =>
            onSearchChange({ q: event.target.value, page: 1 })
          }
        />
        <select
          aria-label="Order status"
          className="h-10 rounded-md border bg-background px-3"
          value={String(search.status ?? "")}
          onChange={(event) =>
            onSearchChange({ status: event.target.value || undefined, page: 1 })
          }
        >
          <option value="">All statuses</option>
          {["processing", "shipping", "delivered", "canceled"].map((status) => (
            <option key={status}>{status}</option>
          ))}
        </select>
      </div>
      {query.isError ? (
        <ErrorState title="Could not load orders" />
      ) : (
        <DataTable
          data={query.data?.items ?? []}
          isLoading={query.isLoading}
          columns={[
            {
              accessorKey: "orderNumber",
              header: "Order",
              cell: ({ row }) => (
                <Link
                  className="text-primary underline"
                  to="/seller/orders/$orderId"
                  params={{ orderId: row.original.id }}
                >
                  {row.original.orderNumber}
                </Link>
              ),
            },
            { accessorKey: "buyerName", header: "Customer" },
            { accessorKey: "status", header: "Status" },
            {
              accessorKey: "total",
              header: "Store subtotal",
              cell: ({ row }) =>
                formatMoney(row.original.total, row.original.currency),
            },
            {
              accessorKey: "createdAt",
              header: "Created",
              cell: ({ row }) => formatDate(row.original.createdAt),
            },
          ]}
        />
      )}
      <ListPagination
        page={Number(search.page ?? 1)}
        pageSize={Number(search.pageSize ?? 25)}
        total={query.data?.total ?? 0}
        onPageChange={(page) => onSearchChange({ page })}
      />
    </div>
  );
}

function OrderCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader className="border-b"><CardTitle className="text-lg">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-3 pt-5">{children}</CardContent>
    </Card>
  );
}

export function SellerOrderDetailPage({ orderId }: { orderId: string }) {
  const sellerId = getSession()!.sellerId!;
  const query = useSellerOrder(sellerId, orderId);
  const paymentQuery = useSellerOrderTransactions(sellerId, orderId);
  const mutation = useMockMutation("orders");
  const [nextStatus, setNextStatus] = useState<OrderStatus | null>(null);
  if (query.isLoading) return <Skeleton className="h-80 w-full" />;
  if (!query.data || query.isError)
    return <ErrorState title="Order not found in your shop" />;
  const order = query.data;
  const multiStore = order.sellerIds.length > 1;
  const payments = paymentQuery.data ?? [];
  const paid = payments.filter((item) => item.type === "payment" && item.status === "completed").reduce((sum, item) => sum + item.amount, 0);
  const refunded = payments.filter((item) => item.type === "refund" && item.status === "completed").reduce((sum, item) => sum + Math.abs(item.amount), 0);
  const balance = order.total - paid + refunded;
  const money = (amount: number) => formatMoney(amount, order.currency);
  const financialsAvailable = !multiStore && paymentQuery.isSuccess;
  const next: OrderStatus | undefined =
    order.status === "processing"
      ? "shipping"
      : order.status === "shipping"
        ? "delivered"
        : undefined;
  return (
    <div className="space-y-5">
      <Button variant="outline" asChild>
        <Link to="/seller/orders">Back to orders</Link>
      </Button>
      <PageHeader
        title={order.orderNumber}
        description={`Placed ${formatDate(order.createdAt)}`}
        actions={
          next && order.sellerIds.length === 1 ? (
            <Button onClick={() => setNextStatus(next)}>Mark {next}</Button>
          ) : undefined
        }
      />
      {order.sellerIds.length > 1 && (
        <p className="text-sm text-muted-foreground">
          Marketplace staff coordinate status changes for orders containing
          multiple stores.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3 border-y py-4 text-sm">
        <span>{order.lineItems.reduce((sum, item) => sum + item.quantity, 0)} items</span>
        <span className="font-medium">Store subtotal {money(order.total)}</span>
        <StatusChip kind="order" status={order.status} />
        {financialsAvailable && <Badge variant={balance <= 0 ? "success" : "warning"}>{refunded > 0 ? "Refund recorded" : paid >= order.total ? "Paid" : paid > 0 ? "Partially paid" : "Awaiting payment"}</Badge>}
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <OrderCard title="Notes about order">
            <p className="text-sm text-muted-foreground">{order.history.filter((entry) => entry.note).map((entry) => entry.note).join(" · ") || "No order notes recorded."}</p>
          </OrderCard>
          <OrderCard title="Items">
      <DataTable
        data={order.lineItems}
        columns={[
          { accessorKey: "productName", header: "Product" },
          { accessorKey: "sku", header: "SKU" },
          { accessorKey: "quantity", header: "Quantity" },
          {
            accessorKey: "unitPrice",
            header: "Unit price",
            cell: ({ row }) =>
              formatMoney(row.original.unitPrice, order.currency),
          },
          {
            id: "lineTotal",
            accessorFn: (item) => item.quantity * item.unitPrice,
            header: "Total",
            cell: ({ row }) => money(row.original.quantity * row.original.unitPrice),
          },
        ]}
      />
            <dl className="space-y-3 border-t pt-4 text-sm">
              <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd>{money(order.total)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Shipping <span className="block text-muted-foreground">{order.deliveryMethodSnapshot}</span></dt><dd>Not itemized</dd></div>
              <div className="flex justify-between gap-4 border-t pt-3 font-semibold"><dt>Store items total</dt><dd>{money(order.total)}</dd></div>
            </dl>
          </OrderCard>
          <OrderCard title="Transactions">
            <p className="text-xs text-muted-foreground">Payment method: {order.paymentWaySnapshot}. Mock ledger; not a live payment service.</p>
            {multiStore ? <p className="text-sm text-muted-foreground">Marketplace staff manage payment allocations for multi-store orders. Whole-order transactions are not shown here.</p> : paymentQuery.isError ? <ErrorState title="Could not load transactions" /> : <DataTable isLoading={paymentQuery.isLoading} data={payments} columns={[
              { accessorKey: "reference", header: "Reference" },
              { accessorKey: "type", header: "Type" },
              { accessorKey: "status", header: "Status" },
              { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.original.createdAt) },
              { accessorKey: "amount", header: "Amount", cell: ({ row }) => <span className={row.original.type === "refund" ? "text-destructive" : undefined}>{formatMoney(row.original.amount, row.original.currency)}</span> },
            ]} />}
          </OrderCard>
          <OrderCard title="Balance">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt>Store items total</dt><dd>{money(order.total)}</dd></div>
              <div className="flex justify-between gap-4"><dt>Completed payments</dt><dd>{financialsAvailable ? money(paid) : "Unavailable"}</dd></div>
              <div className="flex justify-between gap-4"><dt>Refunded</dt><dd>{financialsAvailable ? money(refunded) : "Unavailable"}</dd></div>
              <div className="flex justify-between gap-4 border-t pt-3 font-semibold"><dt>Recorded balance</dt><dd>{financialsAvailable ? money(balance) : "Unavailable"}</dd></div>
            </dl>
            <p className="text-xs text-muted-foreground">Based on completed mock payments and refunds; excludes unitemized shipping, taxes, and credits. This is not a statement of customer debt.</p>
          </OrderCard>
          <OrderCard title="Order history">
      <ul className="space-y-2 text-sm">
        {order.history.map((entry) => (
          <li key={entry.id}>
            {entry.status} · {formatDate(entry.at)}
            {entry.note ? ` · ${entry.note}` : ""}
          </li>
        ))}
      </ul>
          </OrderCard>
        </div>
        <aside className="space-y-6" aria-label="Customer and delivery information">
          <OrderCard title="Customer">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary" aria-hidden>{order.buyerName.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span>
              <div><p className="font-medium">{order.buyerName}</p><p className="text-sm text-muted-foreground">Customer for this order</p></div>
            </div>
          </OrderCard>
          <OrderCard title="Contact person">
            <p className="text-sm">{order.buyerName}</p>
            <a className="block break-all text-sm text-primary underline" href={`mailto:${order.buyerEmail}`}>{order.buyerEmail}</a>
            <p className="text-sm text-muted-foreground">Phone not recorded</p>
          </OrderCard>
          <OrderCard title="Shipping address">
            <address className="space-y-1 text-sm not-italic">
              <p>{order.buyerName}</p><p>{order.shippingAddress.line1}</p>
              {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
              <p>{[order.shippingAddress.city, order.shippingAddress.region, order.shippingAddress.postalCode].filter(Boolean).join(", ")}</p>
              <p>{order.shippingAddress.country}</p>
            </address>
          </OrderCard>
          <OrderCard title="Billing address"><p className="text-sm text-muted-foreground">No separate billing address was captured for this order.</p></OrderCard>
        </aside>
      </div>
      <ConfirmDialog
        open={Boolean(nextStatus)}
        onOpenChange={(open) => {
          if (!open) setNextStatus(null);
        }}
        title={`Mark order ${nextStatus ?? ""}`}
        description="The customer and admin order views will reflect this status."
        onConfirm={async () => {
          await mutation.mutateAsync({
            id: order.id,
            action: "status",
            status: nextStatus,
          });
          toast.success("Order status updated");
        }}
      />
    </div>
  );
}

function ShopSettingsForm({ seller }: { seller: Seller }) {
  const [profile, setProfile] = useState({
    shopName: seller.shopName,
    contactName: seller.contactName,
    email: seller.email,
    line1: seller.workplaceAddress?.line1 ?? "",
    city: seller.workplaceAddress?.city ?? "",
    postalCode: seller.workplaceAddress?.postalCode ?? "",
    country: seller.workplaceAddress?.country ?? "",
  });
  const [delivery, setDelivery] = useState(seller.deliveryMethods);
  const [payment, setPayment] = useState(seller.paymentWays);
  const mutation = useMockMutation("sellers");
  return (
    <form
      className="space-y-6"
      onSubmit={async (event) => {
        event.preventDefault();
        if (
          !delivery.some((way) => way.enabled) ||
          !payment.some((way) => way.enabled)
        ) {
          toast.error("Enable at least one delivery and payment method.");
          return;
        }
        await mutation.mutateAsync({
          id: seller.id,
          shopName: profile.shopName,
          contactName: profile.contactName,
          email: profile.email,
          deliveryMethods: delivery,
          paymentWays: payment,
          workplaceAddress: {
            id: seller.workplaceAddress?.id ?? crypto.randomUUID(),
            label: "Workplace",
            line1: profile.line1,
            city: profile.city,
            postalCode: profile.postalCode,
            country: profile.country,
          },
        });
        toast.success("Shop settings saved");
      }}
    >
      <div className="grid gap-4 rounded-md border p-4 sm:grid-cols-2">
        {(
          [
            ["shopName", "Shop name"],
            ["contactName", "Contact name"],
            ["email", "Contact email"],
            ["line1", "Workplace address"],
            ["city", "City"],
            ["postalCode", "Postal code"],
            ["country", "Country"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="space-y-2">
            <Label htmlFor={`shop-${key}`}>{label}</Label>
            <Input
              id={`shop-${key}`}
              required={key !== "postalCode"}
              type={key === "email" ? "email" : "text"}
              value={profile[key]}
              onChange={(event) =>
                setProfile({ ...profile, [key]: event.target.value })
              }
            />
          </div>
        ))}
      </div>
      <WaySettingsList
        title="Delivery methods"
        items={delivery}
        onChange={setDelivery}
      />
      <WaySettingsList
        title="Payment methods"
        items={payment}
        onChange={setPayment}
        paymentHint
      />
      <Button disabled={mutation.isPending}>Save shop settings</Button>
    </form>
  );
}
export function SellerSettingsPage() {
  const query = useSeller(getSession()!.sellerId!);
  return (
    <div className="space-y-5">
      <PageHeader
        title="Shop settings"
        description="Business profile, delivery methods, and payment instructions."
      />
      {query.isLoading ? (
        <Skeleton className="h-80 w-full" />
      ) : query.data && !query.isError ? (
        <ShopSettingsForm key={query.data.id} seller={query.data} />
      ) : (
        <ErrorState title="Shop not found" />
      )}
    </div>
  );
}
