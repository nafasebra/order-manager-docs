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
import { WaySettingsList } from "@/components/patterns/WaySettingsList";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useBuyer,
  useBuyers,
  useMockMutation,
  useSeller,
  useSellers,
} from "@/lib/api/resources";
import { formatDate } from "@/lib/formats";
import type { WaySetting } from "@/components/patterns/WaySettingsList";
import type { Buyer, ListParams, Seller } from "@/types";

const buyerColumns: ColumnDef<Buyer>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "username", header: "Username" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
  { accessorKey: "orderCount", header: "Orders" },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => formatDate(row.original.createdAt, { dateStyle: "medium" }),
  },
];

type ListProps = {
  search: ListParams;
  onSearchChange: (next: Partial<ListParams>) => void;
};

export function AdminBuyersListPage({ search, onSearchChange }: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useState(String(search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useBuyers({ ...search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader title="Buyers" description="Buyer directory." />
      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder="Search buyers…">
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
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        columns={[
          ...buyerColumns,
          actionsColumn<Buyer>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/buyers/$buyerId",
                  params: { buyerId: row.id },
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
            to: "/admin/buyers/$buyerId",
            params: { buyerId: row.id },
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

export function AdminBuyerDetailPage({ buyerId }: { buyerId: string }) {
  const { data, isLoading, isError } = useBuyer(buyerId);
  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (isError || !data) return <ErrorState title="Buyer not found" />;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/buyers">Buyers</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        title={data.name}
        description={data.email}
        actions={<Badge variant="secondary">{data.status}</Badge>}
      />
      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="pt-4">
          <DescriptionList
            items={[
              { label: "Username", value: data.username },
              { label: "Orders", value: data.orderCount },
              { label: "Tickets", value: data.ticketCount },
              { label: "Joined", value: formatDate(data.createdAt) },
            ]}
          />
        </TabsContent>
        <TabsContent value="addresses" className="space-y-3 pt-4">
          {data.addresses.map((a) => (
            <div key={a.id} className="rounded-md border border-border p-4 text-sm">
              <p className="font-medium">
                {a.label}
                {a.isDefault ? " (default)" : ""}
              </p>
              <p className="text-muted-foreground">
                {a.line1}, {a.city} {a.postalCode}, {a.country}
              </p>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

const sellerColumns: ColumnDef<Seller>[] = [
  { accessorKey: "shopName", header: "Shop" },
  { accessorKey: "contactName", header: "Contact" },
  { accessorKey: "email", header: "Email" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
  { accessorKey: "productCount", header: "Products" },
  { accessorKey: "orderCount", header: "Orders" },
];

export function AdminSellersListPage({ search, onSearchChange }: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useState(String(search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useSellers({ ...search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader
        title="Sellers"
        description="Vendor directory and enablement."
        actions={
          <Button asChild>
            <Link to="/admin/sellers/new">Create seller</Link>
          </Button>
        }
      />
      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder="Search sellers…">
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
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        columns={[
          ...sellerColumns,
          actionsColumn<Seller>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/sellers/$sellerId",
                  params: { sellerId: row.id },
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
            to: "/admin/sellers/$sellerId",
            params: { sellerId: row.id },
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

const sellerSchema = z.object({
  shopName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
});

export function AdminSellerCreatePage() {
  const navigate = useNavigate();
  const mutate = useMockMutation("sellers");
  const form = useForm<z.infer<typeof sellerSchema>>({
    resolver: zodResolver(sellerSchema),
    defaultValues: { shopName: "", contactName: "", email: "" },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title="Create seller" description="Provision a seller account." />
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await mutate.mutateAsync(values);
            toast.success("Seller created (mock)");
            void navigate({ to: "/admin/sellers" });
          })}
        >
          {(["shopName", "contactName", "email"] as const).map((name) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {name === "shopName"
                      ? "Shop name"
                      : name === "contactName"
                        ? "Contact name"
                        : "Email"}
                  </FormLabel>
                  <FormControl>
                    <Input type={name === "email" ? "email" : "text"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <div className="flex gap-2">
            <Button type="submit">Create</Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/sellers">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function AdminSellerDetailPage({ sellerId }: { sellerId: string }) {
  const { data, isLoading, isError } = useSeller(sellerId);
  const [delivery, setDelivery] = useState<WaySetting[] | null>(null);
  const [payment, setPayment] = useState<WaySetting[] | null>(null);

  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (isError || !data) return <ErrorState title="Seller not found" />;

  const deliveryItems = delivery ?? data.deliveryMethods;
  const paymentItems = payment ?? data.paymentWays;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/sellers">Sellers</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data.shopName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <PageHeader
        title={data.shopName}
        description={data.email}
        actions={<Badge variant="secondary">{data.status}</Badge>}
      />
      <DescriptionList
        items={[
          { label: "Contact", value: data.contactName },
          { label: "Products", value: data.productCount },
          { label: "Orders", value: data.orderCount },
          { label: "Joined", value: formatDate(data.createdAt) },
        ]}
      />
      <WaySettingsList
        title="Delivery methods"
        items={deliveryItems}
        onChange={setDelivery}
      />
      <WaySettingsList
        title="Payment ways"
        items={paymentItems}
        onChange={setPayment}
        paymentHint
      />
    </div>
  );
}
