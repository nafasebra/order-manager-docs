import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/patterns/PageHeader";
import { IncomeStatistics } from "@/components/patterns/IncomeStatistics";
import { DataTable } from "@/components/patterns/DataTable";
import {
  actionsColumn,
  copyIdAction,
} from "@/components/patterns/DataTableRowActions";
import { StatusChip } from "@/components/patterns/StatusChip";
import {
  OrderStatusChart,
  SalesOverviewChart,
  type ChartRange,
} from "@/components/patterns/charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminStats, useOrders } from "@/lib/api/resources";
import { formatMoney, formatDate } from "@/lib/formats";
import type { Order } from "@/types";

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

const recentColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order",
    cell: ({ row }) => (
      <Link
        to="/admin/orders/$orderId"
        params={{ orderId: row.original.id }}
        className="font-mono text-sm text-primary hover:underline"
      >
        {row.original.orderNumber}
      </Link>
    ),
  },
  { accessorKey: "buyerName", header: "Buyer" },
  {
    accessorKey: "total",
    header: "Amount",
    cell: ({ row }) => formatMoney(row.original.total, row.original.currency),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusChip kind="order" status={row.original.status} />
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

export function AdminOverviewPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<ChartRange>("30d");
  const stats = useAdminStats();
  const recent = useOrders({ page: 1, pageSize: 8, sort: "-createdAt" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description="Platform revenue, orders, and pending work."
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

      <IncomeStatistics data={stats.data?.income} scope="marketplace" />

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {stats.data ? (
            <SalesOverviewChart
              data={stats.data.salesSeries}
              range={range}
              onRangeChange={setRange}
            />
          ) : (
            <Skeleton className="h-[360px] w-full rounded-md" />
          )}
        </div>
        <div className="lg:col-span-2">
          {stats.data ? (
            <OrderStatusChart data={stats.data.statusMix} />
          ) : (
            <Skeleton className="h-[360px] w-full rounded-md" />
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Recent orders</h2>
        <DataTable
          columns={[
            ...recentColumns,
            actionsColumn<Order>((row) => [
              {
                label: "View details",
                onSelect: () =>
                  void navigate({
                    to: "/admin/orders/$orderId",
                    params: { orderId: row.id },
                  }),
              },
              copyIdAction(row.id),
            ]),
          ]}
          data={recent.data?.items ?? []}
          isLoading={recent.isLoading}
          dense
        />
      </div>
    </div>
  );
}
