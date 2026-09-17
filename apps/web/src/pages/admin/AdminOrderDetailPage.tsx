import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DescriptionList } from "@/components/patterns/DescriptionList";
import { SnapshotBlock } from "@/components/patterns/SnapshotBlock";
import { StatusChip } from "@/components/patterns/StatusChip";
import { DataTable } from "@/components/patterns/DataTable";
import {
  actionsColumn,
  copyIdAction,
} from "@/components/patterns/DataTableRowActions";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { VirtualList } from "@/components/patterns/VirtualList";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMockMutation, useOrder } from "@/lib/api/resources";
import { formatMoney, formatDate } from "@/lib/formats";
import type { OrderLineItem } from "@/types";

const lineColumns: ColumnDef<OrderLineItem>[] = [
  { accessorKey: "productName", header: "Product" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "sellerName", header: "Seller" },
  { accessorKey: "quantity", header: "Qty" },
  {
    accessorKey: "unitPrice",
    header: "Unit",
    cell: ({ row }) => formatMoney(row.original.unitPrice),
  },
];

type Props = { orderId: string };

export function AdminOrderDetailPage({ orderId }: Props) {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useOrder(orderId);
  const mutate = useMockMutation("orders");
  const [cancelOpen, setCancelOpen] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }
  if (isError || !data) {
    return (
      <ErrorState
        title="Order not found"
        description="This order may have been removed."
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/orders">Orders</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono">
              {data.orderNumber}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={data.orderNumber}
        description={`Updated ${formatDate(data.updatedAt)}`}
        actions={
          <>
            <StatusChip kind="order" status={data.status} />
            <Button
              variant="outline"
              type="button"
              disabled={data.status === "delivered" || data.status === "canceled"}
              onClick={() => {
                mutate.mutate({ id: data.id, action: "advance" });
                toast.success("Status advanced (mock)");
              }}
            >
              Advance
            </Button>
            <Button
              variant="destructive"
              type="button"
              disabled={data.status === "canceled"}
              onClick={() => setCancelOpen(true)}
            >
              Cancel order
            </Button>
          </>
        }
      />

      <DescriptionList
        items={[
          {
            label: "Buyer",
            value: (
              <Link
                to="/admin/buyers/$buyerId"
                params={{ buyerId: data.buyerId }}
                className="text-primary hover:underline"
              >
                {data.buyerName}
              </Link>
            ),
          },
          { label: "Seller(s)", value: data.sellerNames.join(", ") },
          { label: "Total", value: formatMoney(data.total, data.currency) },
          { label: "Created", value: formatDate(data.createdAt) },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SnapshotBlock title="Delivery method snapshot">
          {data.deliveryMethodSnapshot}
        </SnapshotBlock>
        <SnapshotBlock title="Payment way snapshot">
          {data.paymentWaySnapshot}
        </SnapshotBlock>
      </div>

      <SnapshotBlock title="Shipping address">
        {data.shippingAddress.line1}, {data.shippingAddress.city}{" "}
        {data.shippingAddress.postalCode}, {data.shippingAddress.country}
      </SnapshotBlock>

      <Tabs defaultValue="lines">
        <TabsList>
          <TabsTrigger value="lines">Line items</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        <TabsContent value="lines" className="pt-4">
          <DataTable
            columns={[
              ...lineColumns,
              actionsColumn<OrderLineItem>((row) => [
                {
                  label: "View product",
                  onSelect: () =>
                    void navigate({
                      to: "/admin/products/$productId",
                      params: { productId: row.productId },
                    }),
                },
                copyIdAction(row.id),
              ]),
            ]}
            data={data.lineItems}
            dense
          />
        </TabsContent>
        <TabsContent value="history" className="pt-4">
          <VirtualList
            items={data.history}
            estimateSize={64}
            height={Math.min(320, data.history.length * 64)}
            getKey={(h) => h.id}
            renderItem={(entry) => (
              <div className="flex h-16 items-center justify-between border-b border-border px-2">
                <div>
                  <StatusChip kind="order" status={entry.status} />
                  {entry.note ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {entry.note}
                    </p>
                  ) : null}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDate(entry.at)}
                </span>
              </div>
            )}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel order"
        description="This action is audited. A reason is required."
        confirmLabel="Cancel order"
        destructive
        requireReason
        onConfirm={async (reason) => {
          await mutate.mutateAsync({ id: data.id, action: "cancel", reason });
          toast.success("Order canceled (mock)");
        }}
      />
    </div>
  );
}
