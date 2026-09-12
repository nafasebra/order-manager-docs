import { useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MapPin, Package, LifeBuoy, User } from "lucide-react";
import { PageHeader } from "@/components/patterns/PageHeader";
import { EmptyState } from "@/components/patterns/EmptyState";
import { DataTable } from "@/components/patterns/DataTable";
import { FilterBar } from "@/components/patterns/FilterBar";
import { ListPagination } from "@/components/patterns/ListPagination";
import { StatusChip } from "@/components/patterns/StatusChip";
import { DescriptionList } from "@/components/patterns/DescriptionList";
import { SnapshotBlock } from "@/components/patterns/SnapshotBlock";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { VirtualList } from "@/components/patterns/VirtualList";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  useBuyer,
  useBuyerOrders,
  useBuyerSummary,
  useBuyerTickets,
  useMockMutation,
  useOrder,
  useTicket,
} from "@/lib/api/resources";
import { formatMoney, formatDate } from "@/lib/formats";
import { getSession } from "@/router";
import type {
  Address,
  ListParams,
  Order,
  OrderStatus,
  Ticket,
} from "@/types";
import type { OrdersSearch } from "@/lib/router/search";

const DEMO_BUYER_ID = "buyer-0001";

function useBuyerId() {
  const session = getSession();
  return session?.buyerId ?? session?.id ?? DEMO_BUYER_ID;
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string;
  value: string;
  icon: typeof Package;
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <p className="text-2xl font-semibold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function BuyerHomePage() {
  const buyerId = useBuyerId();
  const session = getSession();
  const summary = useBuyerSummary(buyerId);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Hello, ${session?.displayName ?? summary.data?.buyer.name ?? "there"}`}
        description="Your orders, addresses, and support in one calm place."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Orders"
          value={summary.data ? String(summary.data.totalOrders) : "—"}
          icon={Package}
          loading={summary.isLoading}
        />
        <SummaryCard
          label="Open tickets"
          value={summary.data ? String(summary.data.openTickets) : "—"}
          icon={LifeBuoy}
          loading={summary.isLoading}
        />
        <SummaryCard
          label="Saved addresses"
          value={summary.data ? String(summary.data.addressCount) : "—"}
          icon={MapPin}
          loading={summary.isLoading}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline">
          <Link to="/account/profile">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/account/addresses">
            <MapPin className="h-4 w-4" />
            Addresses
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/account/tickets">
            <LifeBuoy className="h-4 w-4" />
            Support
          </Link>
        </Button>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent orders</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/account/orders">View all</Link>
          </Button>
        </div>
        {summary.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : summary.data?.recentOrders.length ? (
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {summary.data.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to="/account/orders/$orderId"
                  params={{ orderId: order.id }}
                  className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-muted/50"
                >
                  <div>
                    <p className="font-mono text-sm">{order.orderNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)} ·{" "}
                      {formatMoney(order.total, order.currency)}
                    </p>
                  </div>
                  <StatusChip kind="order" status={order.status} />
                </Link>
              ))}
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            title="No orders yet"
            description="When you place an order, it will show up here."
          />
        )}
      </div>

      {summary.data && summary.data.inProgressOrders > 0 ? (
        <p className="text-sm text-muted-foreground">
          You have {summary.data.inProgressOrders} order
          {summary.data.inProgressOrders === 1 ? "" : "s"} currently in
          progress.
        </p>
      ) : null}
    </div>
  );
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  username: z.string().min(2, "Username is required"),
  email: z.string().email(),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "At least 8 characters"),
    confirmPassword: z.string().min(1),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function BuyerProfilePage() {
  const buyerId = useBuyerId();
  const { data: buyer, isLoading } = useBuyer(buyerId);
  const mutate = useMockMutation("buyers");

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    values: buyer
      ? { name: buyer.name, username: buyer.username, email: buyer.email }
      : undefined,
    defaultValues: { name: "", username: "", email: "" },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  if (isLoading) return <Skeleton className="h-80 w-full" />;

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <PageHeader
        title="Profile"
        description="Your name, username, email, and password."
      />

      <Form {...profileForm}>
        <form
          className="space-y-4"
          onSubmit={profileForm.handleSubmit(async (values) => {
            await mutate.mutateAsync({ id: buyerId, ...values });
            toast.success("Profile saved (mock)");
          })}
        >
          {(["name", "username", "email"] as const).map((name) => (
            <FormField
              key={name}
              control={profileForm.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{name}</FormLabel>
                  <FormControl>
                    <Input
                      type={name === "email" ? "email" : "text"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button type="submit">Save profile</Button>
        </form>
      </Form>

      <div className="space-y-4 border-t border-border pt-8">
        <h2 className="text-lg font-semibold">Change password</h2>
        <Form {...passwordForm}>
          <form
            className="space-y-4"
            onSubmit={passwordForm.handleSubmit(async () => {
              await mutate.mutateAsync({ id: buyerId, action: "password" });
              passwordForm.reset();
              toast.success("Password updated (mock)");
            })}
          >
            {(
              [
                ["currentPassword", "Current password"],
                ["newPassword", "New password"],
                ["confirmPassword", "Confirm password"],
              ] as const
            ).map(([name, label]) => (
              <FormField
                key={name}
                control={passwordForm.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <FormControl>
                      <Input type="password" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button type="submit" variant="outline">
              Update password
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

const addressSchema = z.object({
  label: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
});

export function BuyerAddressesPage() {
  const buyerId = useBuyerId();
  const { data: buyer, isLoading } = useBuyer(buyerId);
  const mutate = useMockMutation("buyers");
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const form = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "",
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      country: "GB",
    },
  });

  const list = addresses ?? buyer?.addresses ?? [];

  function openCreate() {
    setEditing(null);
    form.reset({
      label: "",
      line1: "",
      line2: "",
      city: "",
      postalCode: "",
      country: "GB",
    });
    setDialogOpen(true);
  }

  function openEdit(address: Address) {
    setEditing(address);
    form.reset({
      label: address.label,
      line1: address.line1,
      line2: address.line2 ?? "",
      city: address.city,
      postalCode: address.postalCode,
      country: address.country,
    });
    setDialogOpen(true);
  }

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Addresses"
        description="Shipping and billing addresses."
        actions={
          <Button type="button" onClick={openCreate}>
            Add address
          </Button>
        }
      />

      {list.length ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((address) => (
            <Card key={address.id}>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">
                      {address.label}
                      {address.isDefault ? (
                        <Badge variant="secondary" className="ml-2">
                          Default
                        </Badge>
                      ) : null}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                      <br />
                      {address.city} {address.postalCode}
                      <br />
                      {address.country}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => openEdit(address)}
                  >
                    Edit
                  </Button>
                  {!address.isDefault ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        const next = list.map((a) => ({
                          ...a,
                          isDefault: a.id === address.id,
                        }));
                        setAddresses(next);
                        await mutate.mutateAsync({
                          id: buyerId,
                          addresses: next,
                        });
                        toast.success("Default address updated (mock)");
                      }}
                    >
                      Set default
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No addresses yet"
          description="Add a shipping address to get started."
          action={
            <Button type="button" onClick={openCreate}>
              Add address
            </Button>
          }
        />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit address" : "Add address"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              className="space-y-3"
              onSubmit={form.handleSubmit(async (values) => {
                let next: Address[];
                if (editing) {
                  next = list.map((a) =>
                    a.id === editing.id ? { ...a, ...values } : a,
                  );
                } else {
                  next = [
                    ...list,
                    {
                      id: `addr-${Date.now()}`,
                      ...values,
                      isDefault: list.length === 0,
                    },
                  ];
                }
                setAddresses(next);
                await mutate.mutateAsync({ id: buyerId, addresses: next });
                setDialogOpen(false);
                toast.success(
                  editing ? "Address updated (mock)" : "Address added (mock)",
                );
              })}
            >
              {(
                [
                  ["label", "Label"],
                  ["line1", "Address line 1"],
                  ["line2", "Address line 2"],
                  ["city", "City"],
                  ["postalCode", "Postal code"],
                  ["country", "Country"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{label}</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const orderColumns: ColumnDef<Order>[] = [
  {
    accessorKey: "orderNumber",
    header: "Order",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.orderNumber}</span>
    ),
  },
  {
    accessorKey: "sellerNames",
    header: "Seller(s)",
    cell: ({ row }) => row.original.sellerNames.join(", "),
  },
  {
    accessorKey: "total",
    header: "Total",
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
    header: "Placed",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

type ListProps = {
  search: OrdersSearch | ListParams;
  onSearchChange: (next: Partial<OrdersSearch & ListParams>) => void;
};

export function BuyerOrdersListPage({ search, onSearchChange }: ListProps) {
  const navigate = useNavigate();
  const buyerId = useBuyerId();
  const [q, setQ] = useState(String(search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useBuyerOrders(buyerId, {
    ...search,
    q: debouncedQ || undefined,
  });

  return (
    <div>
      <PageHeader
        title="Orders"
        description="Your orders only — cancel when still processing."
      />
      <FilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search orders…"
      >
        <Select
          value={String(search.status ?? "all")}
          onValueChange={(v) =>
            onSearchChange({
              status: v === "all" ? undefined : (v as OrderStatus),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[160px]" aria-label="Status filter">
            <SelectValue />
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
        columns={orderColumns}
        data={query.data?.items ?? []}
        isLoading={query.isLoading}
        onRowClick={(row) =>
          void navigate({
            to: "/account/orders/$orderId",
            params: { orderId: row.id },
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

export function BuyerOrderDetailPage({ orderId }: { orderId: string }) {
  const buyerId = useBuyerId();
  const { data, isLoading, isError } = useOrder(orderId);
  const mutate = useMockMutation("orders");
  const [cancelOpen, setCancelOpen] = useState(false);

  const owned = data?.buyerId === buyerId;

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !data || !owned) {
    return (
      <ErrorState
        title="Order not found"
        description="This order is not available on your account."
      />
    );
  }

  const canCancel = data.status === "processing";

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/account/orders">Orders</Link>
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
        description={`Placed ${formatDate(data.createdAt)}`}
        actions={
          <>
            <StatusChip kind="order" status={data.status} />
            {canCancel ? (
              <Button
                variant="destructive"
                type="button"
                onClick={() => setCancelOpen(true)}
              >
                Cancel order
              </Button>
            ) : null}
          </>
        }
      />

      <DescriptionList
        items={[
          { label: "Seller(s)", value: data.sellerNames.join(", ") },
          { label: "Total", value: formatMoney(data.total, data.currency) },
          { label: "Updated", value: formatDate(data.updatedAt) },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <SnapshotBlock title="Delivery method">
          {data.deliveryMethodSnapshot}
        </SnapshotBlock>
        <SnapshotBlock title="Payment way">
          {data.paymentWaySnapshot}
        </SnapshotBlock>
      </div>

      <SnapshotBlock title="Shipping address">
        {data.shippingAddress.line1}, {data.shippingAddress.city}{" "}
        {data.shippingAddress.postalCode}, {data.shippingAddress.country}
      </SnapshotBlock>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Line items</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.lineItems.map((li) => (
              <TableRow key={li.id}>
                <TableCell>{li.productName}</TableCell>
                <TableCell>{li.quantity}</TableCell>
                <TableCell>{formatMoney(li.unitPrice)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">History</h2>
        <ul className="space-y-2">
          {data.history.map((entry) => (
            <li
              key={entry.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
            >
              <StatusChip kind="order" status={entry.status} />
              <span className="text-muted-foreground">
                {formatDate(entry.at)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancel order"
        description="You can cancel while the order is still processing. A reason is required."
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

const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "ticketNumber",
    header: "Ticket",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.ticketNumber}</span>
    ),
  },
  { accessorKey: "subject", header: "Subject" },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.channel}</Badge>
    ),
  },
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

export function BuyerTicketsListPage({ search, onSearchChange }: ListProps) {
  const navigate = useNavigate();
  const buyerId = useBuyerId();
  const [q, setQ] = useState(String(search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useBuyerTickets(buyerId, {
    ...search,
    q: debouncedQ || undefined,
  });

  return (
    <div>
      <PageHeader
        title="Tickets"
        description="Tickets where you are the requester."
      />
      <FilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search tickets…"
      />
      <DataTable
        columns={ticketColumns}
        data={query.data?.items ?? []}
        isLoading={query.isLoading}
        onRowClick={(row) =>
          void navigate({
            to: "/account/tickets/$ticketId",
            params: { ticketId: row.id },
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

export function BuyerTicketDetailPage({ ticketId }: { ticketId: string }) {
  const buyerId = useBuyerId();
  const { data, isLoading, isError } = useTicket(ticketId);
  const mutate = useMockMutation("tickets");
  const [reply, setReply] = useState("");

  const owned = data?.requesterId === buyerId;
  const visibleMessages = useMemo(
    () => (data?.messages ?? []).filter((m) => !m.internal),
    [data?.messages],
  );

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !data || !owned) {
    return (
      <ErrorState
        title="Ticket not found"
        description="This ticket is not available on your account."
      />
    );
  }

  const closed = data.status === "closed";

  return (
    <div className="space-y-4">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/account/tickets">Tickets</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="font-mono">
              {data.ticketNumber}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeader
        title={data.subject}
        description={data.ticketNumber}
        actions={<StatusChip kind="ticket" status={data.status} />}
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_240px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thread</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <VirtualList
              items={visibleMessages}
              estimateSize={88}
              height={Math.min(400, Math.max(160, visibleMessages.length * 88))}
              getKey={(m) => m.id}
              renderItem={(msg) => (
                <div className="border-b border-border px-1 py-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{msg.authorName}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.body}</p>
                </div>
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="buyer-reply">Reply</Label>
              <Textarea
                id="buyer-reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder={
                  closed ? "This ticket is closed" : "Write a reply…"
                }
                rows={3}
                disabled={closed}
              />
              <Button
                type="button"
                disabled={closed || !reply.trim()}
                onClick={async () => {
                  await mutate.mutateAsync({
                    id: data.id,
                    action: "reply",
                    body: reply,
                  });
                  setReply("");
                  toast.success("Reply sent (mock)");
                }}
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Channel</p>
              <p>{data.channel}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Priority</p>
              <p className="capitalize">{data.priority}</p>
            </div>
            {data.sellerName ? (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Seller</p>
                <p>{data.sellerName}</p>
              </div>
            ) : null}
            {data.relatedOrderId ? (
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Related order
                </p>
                <Link
                  to="/account/orders/$orderId"
                  params={{ orderId: data.relatedOrderId }}
                  className="text-primary hover:underline"
                >
                  View order
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
