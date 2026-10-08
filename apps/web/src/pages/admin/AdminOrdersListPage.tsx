import { useListQuery } from "@/hooks/useListQuery";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable } from "@/components/patterns/DataTable";
import {
  actionsColumn,
  copyIdAction,
} from "@/components/patterns/DataTableRowActions";
import { ListPagination } from "@/components/patterns/ListPagination";
import { StatusChip } from "@/components/patterns/StatusChip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrders } from "@/lib/api/resources";
import { formatMoney, formatDate } from "@/lib/formats";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Order, OrderStatus } from "@/types";
import type { OrdersSearch } from "@/lib/router/search";

const columns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.orderNumber}</span>
    ),
  },
  { accessorKey: "buyerName", header: "Buyer" },
  {
    accessorKey: "sellerNames",
    header: "Seller(s)",
    cell: ({ row }) => row.original.sellerNames.join(", "),
  },
  {
    accessorKey: "total",
    header: "Amount",
    cell: ({ row }) => formatMoney(row.original.total, row.original.currency),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusChip kind="order" status={row.original.status} />,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

type Props = {
  search: OrdersSearch;
  onSearchChange: (next: Partial<OrdersSearch>) => void;
};

export function AdminOrdersListPage({ search, onSearchChange }: Props) {
  const navigate = useNavigate();
  const [q, setQ] = useListQuery(search, onSearchChange);
  const debouncedQ = useDebouncedValue(q);
  const effectiveSearch = { ...search, q: debouncedQ || undefined };
  const query = useOrders(effectiveSearch);

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Browse and manage platform orders."
      />
      <FilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search orders…"
      >
        <Select
          value={search.status ?? "all"}
          onValueChange={(v) =>
            onSearchChange({
              status: v === "all" ? undefined : (v as OrderStatus),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[160px]" aria-label="Status filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipping">Shipping</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        columns={[
          ...columns,
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
        data={query.data?.items ?? []}
        isLoading={query.isLoading}
        dense
        onRowClick={(row) =>
          void navigate({
            to: "/admin/orders/$orderId",
            params: { orderId: row.id },
          })
        }
      />
      <ListPagination
        page={search.page}
        pageSize={search.pageSize}
        total={query.data?.total ?? 0}
        onPageChange={(page) => onSearchChange({ page })}
      />
    </div>
  );
}
