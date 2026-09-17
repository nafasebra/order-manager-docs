import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useInvoice,
  useInvoices,
  useMockMutation,
} from "@/lib/api/resources";
import { formatMoney, formatDate } from "@/lib/formats";
import type { Invoice, ListParams } from "@/types";

const invoiceColumns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "invoiceNumber",
    header: "Invoice",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.invoiceNumber}</span>
    ),
  },
  { accessorKey: "buyerName", header: "Buyer" },
  {
    accessorKey: "orderNumber",
    header: "Order",
    cell: ({ row }) => row.original.orderNumber ?? "—",
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => formatMoney(row.original.total, row.original.currency),
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

export function AdminInvoicesListPage({ search, onSearchChange }: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useState(String(search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useInvoices({ ...search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Browse invoices and create manual invoices."
        actions={
          <Button asChild>
            <Link to="/admin/invoices/new">Create invoice</Link>
          </Button>
        }
      />
      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder="Search invoices…">
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
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="issued">Issued</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="void">Void</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        columns={[
          ...invoiceColumns,
          actionsColumn<Invoice>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/invoices/$invoiceId",
                  params: { invoiceId: row.id },
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
            to: "/admin/invoices/$invoiceId",
            params: { invoiceId: row.id },
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

const createSchema = z.object({
  buyerName: z.string().min(1),
  description: z.string().min(1),
  amount: z.coerce.number().positive(),
});

export function AdminInvoiceCreatePage() {
  const navigate = useNavigate();
  const mutate = useMockMutation("invoices");
  const form = useForm<z.infer<typeof createSchema>>({
    resolver: zodResolver(createSchema),
    defaultValues: { buyerName: "", description: "", amount: 0 },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Create manual invoice"
        description="Staff-issued invoice (mock)."
      />
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await mutate.mutateAsync(values);
            toast.success("Invoice created (mock)");
            void navigate({ to: "/admin/invoices" });
          })}
        >
          <FormField
            control={form.control}
            name="buyerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buyer name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Line description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit">Create</Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/invoices">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function AdminInvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const { data, isLoading, isError } = useInvoice(invoiceId);
  const mutate = useMockMutation("invoices");
  const [voidOpen, setVoidOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (isError || !data) {
    return <ErrorState title="Invoice not found" />;
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/invoices">Invoices</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono">
              {data.invoiceNumber}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        title={data.invoiceNumber}
        description={data.buyerName}
        actions={
          <>
            <Badge variant="secondary">{data.status}</Badge>
            <Button
              variant="destructive"
              type="button"
              disabled={data.status === "void"}
              onClick={() => setVoidOpen(true)}
            >
              Void invoice
            </Button>
          </>
        }
      />
      <DescriptionList
        items={[
          { label: "Buyer", value: data.buyerName },
          { label: "Order", value: data.orderNumber ?? "—" },
          { label: "Total", value: formatMoney(data.total, data.currency) },
          {
            label: "Issued",
            value: data.issuedAt ? formatDate(data.issuedAt) : "—",
          },
        ]}
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Qty</TableHead>
            <TableHead>Unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.lines.map((line) => (
            <TableRow key={line.id}>
              <TableCell>{line.description}</TableCell>
              <TableCell>{line.quantity}</TableCell>
              <TableCell>{formatMoney(line.unitPrice)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ConfirmDialog
        open={voidOpen}
        onOpenChange={setVoidOpen}
        title="Void invoice"
        description="Voiding is audited and irreversible in production."
        confirmLabel="Void invoice"
        destructive
        requireReason
        onConfirm={async (reason) => {
          await mutate.mutateAsync({ id: data.id, action: "void", reason });
          toast.success("Invoice voided (mock)");
        }}
      />
    </div>
  );
}
