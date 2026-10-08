import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { getSession } from "@/lib/auth/store";
import { useSellerOrder, useSellerOrders } from "@/lib/api/sellerCommerce";
import { useSeller, useMockMutation } from "@/lib/api/resources";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable } from "@/components/patterns/DataTable";
import { ListPagination } from "@/components/patterns/ListPagination";
import { ErrorState } from "@/components/patterns/ErrorState";
import { DescriptionList } from "@/components/patterns/DescriptionList";
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

export function SellerOrderDetailPage({ orderId }: { orderId: string }) {
  const query = useSellerOrder(getSession()!.sellerId!, orderId);
  const mutation = useMockMutation("orders");
  const [nextStatus, setNextStatus] = useState<OrderStatus | null>(null);
  if (query.isLoading) return <Skeleton className="h-80 w-full" />;
  if (!query.data || query.isError)
    return <ErrorState title="Order not found in your shop" />;
  const order = query.data;
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
        description={order.status}
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
      <DescriptionList
        items={[
          { label: "Customer", value: order.buyerName },
          { label: "Email", value: order.buyerEmail },
          {
            label: "Store subtotal",
            value: formatMoney(order.total, order.currency),
          },
          { label: "Delivery", value: order.deliveryMethodSnapshot },
          { label: "Payment method", value: order.paymentWaySnapshot },
          {
            label: "Shipping address",
            value: `${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.postalCode ?? ""}, ${order.shippingAddress.country}`,
          },
        ]}
      />
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
        ]}
      />
      <h2 className="text-lg font-semibold">Order history</h2>
      <ul className="space-y-2 text-sm">
        {order.history.map((entry) => (
          <li key={entry.id}>
            {entry.status} · {formatDate(entry.at)}
            {entry.note ? ` · ${entry.note}` : ""}
          </li>
        ))}
      </ul>
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
