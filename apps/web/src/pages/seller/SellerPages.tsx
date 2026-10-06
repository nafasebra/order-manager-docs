import { useState } from "react";
import { Link } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/patterns/PageHeader";
import { IncomeStatistics } from "@/components/patterns/IncomeStatistics";
import { EmptyState } from "@/components/patterns/EmptyState";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/patterns/DataTable";
import {
  actionsColumn,
  copyIdAction,
} from "@/components/patterns/DataTableRowActions";
import { StatusChip } from "@/components/patterns/StatusChip";
import {
  WaySettingsList,
  type WaySetting,
} from "@/components/patterns/WaySettingsList";
import {
  OrderStatusChart,
  SalesOverviewChart,
  TopProductsChart,
  type ChartRange,
} from "@/components/patterns/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { useSellerStats } from "@/lib/api/resources";
import { formatMoney, formatDate } from "@/lib/formats";
import { getSession } from "@/router";
import type { SellerProductStat, Ticket } from "@/types";

const DEMO_SELLER_ID = "seller-0001";

const initialDelivery: WaySetting[] = [
  {
    id: "std",
    name: "Standard shipping",
    enabled: true,
    label: "Standard",
    instructions: "3–5 business days",
    sortOrder: 1,
  },
  {
    id: "exp",
    name: "Express",
    enabled: true,
    label: "Express",
    instructions: "1–2 business days",
    sortOrder: 2,
  },
  {
    id: "pickup",
    name: "Pickup",
    enabled: false,
    label: "Store pickup",
    instructions: "",
    sortOrder: 3,
  },
];

const initialPayment: WaySetting[] = [
  {
    id: "cod",
    name: "Cash on delivery",
    enabled: true,
    label: "COD",
    instructions: "Pay when you receive",
    sortOrder: 1,
  },
  {
    id: "bank",
    name: "Bank transfer",
    enabled: true,
    label: "Bank transfer",
    instructions: "Include order number in reference",
    sortOrder: 2,
  },
  {
    id: "card",
    name: "Card",
    enabled: false,
    label: "Card (offline)",
    instructions: "",
    sortOrder: 3,
  },
];

function KpiCard({
  label,
  value,
  change,
  loading,
}: {
  label: string;
  value: string;
  change?: number;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <p className="text-2xl font-semibold">{value}</p>
            {change != null ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {change >= 0 ? "↑" : "↓"} {Math.abs(change)}% vs previous
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "ticketNumber",
    header: "Ticket",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.ticketNumber}</span>
    ),
  },
  { accessorKey: "subject", header: "Subject" },
  { accessorKey: "requesterName", header: "Requester" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusChip kind="ticket" status={row.original.status} />
    ),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
];

const topSellingProductColumns: ColumnDef<SellerProductStat>[] = [
  { accessorKey: "name", header: "Product" },
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.sku}</span>
    ),
  },
  { accessorKey: "unitsSold", header: "Units sold" },
  { accessorKey: "orderCount", header: "Orders" },
  {
    accessorKey: "revenue",
    header: "Revenue",
    cell: ({ row }) => formatMoney(row.original.revenue),
  },
];

export function SellerAnalyticsPage() {
  const session = getSession();
  const [range, setRange] = useState<ChartRange>("30d");
  const days = range === "7d" ? 7 : range === "90d" ? 90 : 30;
  const stats = useSellerStats(session?.sellerId ?? DEMO_SELLER_ID, days);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shop analytics"
        description={`Sales, income, and product performance for ${session?.shopName ?? "your shop"}. Demo reporting period ends September 1, 2026.`}
        actions={
          <Select value={range} onValueChange={(value) => setRange(value as ChartRange)}>
            <SelectTrigger className="w-[160px]" aria-label="Analytics period"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />
      {stats.isError ? <ErrorState title="Could not load shop analytics" /> : stats.isLoading || !stats.data ? (
        <Skeleton className="h-[480px] w-full rounded-md" />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Delivered sales" value={formatMoney(stats.data.revenue)} />
            <KpiCard label="Orders" value={String(stats.data.orders)} />
            <KpiCard label="Avg. delivered order" value={formatMoney(stats.data.aov)} />
            <KpiCard label="Items ordered" value={String(stats.data.itemsOrdered)} />
          </div>
          <IncomeStatistics data={stats.data.income} scope="shop" range={range} onRangeChange={setRange} />
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3"><SalesOverviewChart data={stats.data.salesSeries} range={range} onRangeChange={setRange} /></div>
            <div className="lg:col-span-2"><OrderStatusChart data={stats.data.statusMix} /></div>
          </div>
          {stats.data.topSellingProducts.length ? (
            <>
              <TopProductsChart title="Top products by ordered value" data={stats.data.topProducts} valueLabel="Ordered value" />
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Product performance</h2>
                <p className="text-sm text-muted-foreground">Units and order values include all order statuses in the selected period.</p>
                <DataTable columns={topSellingProductColumns} data={stats.data.topSellingProducts} dense />
              </div>
            </>
          ) : <EmptyState title="No orders in this period" description="Choose a longer reporting period to explore your shop's performance." />}
        </>
      )}
    </div>
  );
}

export function SellerOverviewPage() {
  const session = getSession();
  const sellerId = session?.sellerId ?? DEMO_SELLER_ID;
  const [range, setRange] = useState<ChartRange>("30d");
  const stats = useSellerStats(sellerId);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shop overview"
        description={`Own revenue, orders, and inventory for ${session?.shopName ?? "your shop"}.`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={stats.data ? formatMoney(stats.data.revenue) : "—"}
          change={stats.data?.revenueChange}
          loading={stats.isLoading}
        />
        <KpiCard
          label="Orders"
          value={stats.data ? String(stats.data.orders) : "—"}
          change={stats.data?.ordersChange}
          loading={stats.isLoading}
        />
        <KpiCard
          label="Avg. order"
          value={stats.data ? formatMoney(stats.data.aov) : "—"}
          change={stats.data?.aovChange}
          loading={stats.isLoading}
        />
        <KpiCard
          label="Open tickets"
          value={stats.data ? String(stats.data.openTickets) : "—"}
          loading={stats.isLoading}
        />
      </div>

      <IncomeStatistics data={stats.data?.income} scope="shop" />

      {stats.isLoading || !stats.data ? (
        <div className="grid gap-4 lg:grid-cols-5">
          <Skeleton className="h-[360px] rounded-md lg:col-span-3" />
          <Skeleton className="h-[360px] rounded-md lg:col-span-2" />
        </div>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <SalesOverviewChart
                data={stats.data.salesSeries}
                range={range}
                onRangeChange={setRange}
              />
            </div>
            <div className="lg:col-span-2">
              <OrderStatusChart data={stats.data.statusMix} />
            </div>
          </div>

          <TopProductsChart
            title="Top products by revenue"
            data={stats.data.topProducts}
          />

          <div>
            <div className="mb-3">
              <h2 className="text-lg font-semibold">Top-selling products</h2>
              <p className="text-sm text-muted-foreground">
                Units, orders, and revenue for this shop only.
              </p>
            </div>
            {stats.data.topSellingProducts.length ? (
              <DataTable
                columns={topSellingProductColumns}
                data={stats.data.topSellingProducts}
                dense
              />
            ) : (
              <EmptyState
                title="No product sales yet"
                description="Top-selling product statistics will appear after orders are placed."
              />
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Recent tickets</h2>
              </div>
              {stats.data.recentTickets.length ? (
                <DataTable
                  columns={[
                    ...ticketColumns,
                    actionsColumn<Ticket>((row) => [copyIdAction(row.id)]),
                  ]}
                  data={stats.data.recentTickets}
                  dense
                />
              ) : (
                <EmptyState
                  title="No tickets yet"
                  description="Buyer–seller tickets for this shop will appear here."
                />
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold">Inventory signals</h2>
                <Button asChild variant="outline" size="sm">
                  <Link to="/seller/products">View products</Link>
                </Button>
              </div>
              {stats.data.lowStock.length ? (
                <Card>
                  <CardContent className="divide-y divide-border p-0">
                    {stats.data.lowStock.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.sku}
                          </p>
                        </div>
                        <p className="font-semibold text-warning">
                          {product.stock} left
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <EmptyState
                  title="Stock looks healthy"
                  description="No published products under 10 units."
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function SellerProductsListPage() {
  return (
    <PlaceholderPage
      title="Products"
      description="Your catalog only."
      actionLabel="Create product"
    />
  );
}

export function SellerOrdersListPage() {
  return (
    <PlaceholderPage
      title="Orders"
      description="Orders that include your shop."
    />
  );
}

export function SellerSettingsPage() {
  const [delivery, setDelivery] = useState(initialDelivery);
  const [payment, setPayment] = useState(initialPayment);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Shop profile, delivery methods, and payment ways."
      />
      <EmptyState
        title="Shop profile"
        description="Business display name, contacts, and workplace address will go here."
      />
      <WaySettingsList
        title="Delivery methods"
        items={delivery}
        onChange={setDelivery}
      />
      <WaySettingsList
        title="Payment ways"
        items={payment}
        onChange={setPayment}
        paymentHint
      />
    </div>
  );
}
