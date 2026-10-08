import { useListQuery } from "@/hooks/useListQuery";
import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable } from "@/components/patterns/DataTable";
import {
  actionsColumn,
  copyIdAction,
} from "@/components/patterns/DataTableRowActions";
import { ListPagination } from "@/components/patterns/ListPagination";
import { DescriptionList } from "@/components/patterns/DescriptionList";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useMockMutation,
  useTransaction,
  useTransactions,
} from "@/lib/api/resources";
import { formatMoney, formatDate } from "@/lib/formats";
import { can } from "@/lib/permissions/can";
import { getSession } from "@/lib/auth/store";
import type { ListParams, Transaction } from "@/types";

const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "reference",
    header: "Reference",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.reference}</span>
    ),
  },
  { accessorKey: "type", header: "Type" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => formatMoney(row.original.amount, row.original.currency),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

type ListProps = {
  search: ListParams;
  onSearchChange: (next: Partial<ListParams>) => void;
};

export function AdminTransactionsListPage({
  search,
  onSearchChange,
}: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useListQuery(search, onSearchChange);
  const debouncedQ = useDebouncedValue(q);
  const query = useTransactions({ ...search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader
        title="Transactions"
        description="Payments, refunds, payouts, and adjustments."
      />
      <FilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search transactions…"
      >
        <Select
          value={String(search.status ?? "all")}
          onValueChange={(v) =>
            onSearchChange({ status: v === "all" ? undefined : v, page: 1 })
          }
        >
          <SelectTrigger className="w-[140px]" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        columns={[
          ...columns,
          actionsColumn<Transaction>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/transactions/$transactionId",
                  params: { transactionId: row.id },
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
            to: "/admin/transactions/$transactionId",
            params: { transactionId: row.id },
          })
        }
      />
      <ListPagination
        page={Number(search.page ?? 1)}
        pageSize={Number(search.pageSize ?? 25)}
        total={query.data?.total ?? 0}
        onPageChange={(page) => onSearchChange({ page })}
      />
    </div>
  );
}

export function AdminTransactionDetailPage({
  transactionId,
}: {
  transactionId: string;
}) {
  const { data, isLoading, isError } = useTransaction(transactionId);
  const mutate = useMockMutation("transactions");
  const [refundOpen, setRefundOpen] = useState(false);
  const user = getSession();
  const canRefund = can(user, "transactions", "refund");

  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (isError || !data) {
    return <ErrorState title="Transaction not found" />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/transactions">Transactions</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono">
              {data.reference}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        title={data.reference}
        description={data.type}
        actions={
          <>
            <Badge variant="secondary">{data.status}</Badge>
            {canRefund && data.type === "payment" ? (
              <Button
                variant="destructive"
                type="button"
                onClick={() => setRefundOpen(true)}
              >
                Issue refund
              </Button>
            ) : null}
          </>
        }
      />
      <DescriptionList
        items={[
          {
            label: "Amount",
            value: formatMoney(data.amount, data.currency),
          },
          { label: "External ref", value: data.externalRef ?? "—" },
          { label: "Order", value: data.orderId ?? "—" },
          { label: "Invoice", value: data.invoiceId ?? "—" },
          { label: "Created", value: formatDate(data.createdAt) },
          { label: "Note", value: data.note ?? "—" },
        ]}
      />
      <ConfirmDialog
        open={refundOpen}
        onOpenChange={setRefundOpen}
        title="Issue refund"
        description="Refunds are staff-only and audited."
        confirmLabel="Refund"
        destructive
        requireReason
        onConfirm={async (reason) => {
          await mutate.mutateAsync({ id: data.id, action: "refund", reason });
          toast.success("Refund recorded (mock)");
        }}
      />
    </div>
  );
}
