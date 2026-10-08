import { useListQuery } from "@/hooks/useListQuery";
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
import { ErrorState } from "@/components/patterns/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useAdmin,
  useAdmins,
  useMockMutation,
  useRoleTemplates,
} from "@/lib/api/resources";
import { formatDate } from "@/lib/formats";
import type {
  Action,
  AdminAccount,
  Grant,
  ListParams,
  PermissionArea,
} from "@/types";

type ListProps = {
  search: ListParams;
  onSearchChange: (next: Partial<ListParams>) => void;
};

const columns: ColumnDef<AdminAccount>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "role", header: "Role" },
  {
    accessorKey: "isSuperuser",
    header: "Super",
    cell: ({ row }) => (row.original.isSuperuser ? "Yes" : "—"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
];

export function AdminAdminsListPage({ search, onSearchChange }: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useListQuery(search, onSearchChange);
  const debouncedQ = useDebouncedValue(q);
  const query = useAdmins({ ...search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader
        title="Admins"
        description="Staff accounts and permission sets."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/settings/roles">Roles matrix</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/settings/admins/new">Create admin</Link>
            </Button>
          </div>
        }
      />
      <FilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search admins…"
      />
      <DataTable
        columns={[
          ...columns,
          actionsColumn<AdminAccount>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/settings/admins/$adminId",
                  params: { adminId: row.id },
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
            to: "/admin/settings/admins/$adminId",
            params: { adminId: row.id },
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

const adminSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "support", "editor", "custom"]),
});

export function AdminAdminCreatePage() {
  const navigate = useNavigate();
  const mutate = useMockMutation("admins");
  const form = useForm<z.infer<typeof adminSchema>>({
    resolver: zodResolver(adminSchema),
    defaultValues: { name: "", email: "", role: "support" },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title="Create admin" />
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await mutate.mutateAsync(values);
            toast.success("Admin created (mock)");
            void navigate({ to: "/admin/settings/admins" });
          })}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role template</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Create</Button>
        </form>
      </Form>
    </div>
  );
}

const AREAS: PermissionArea[] = [
  "analytics",
  "marketing",
  "crm",
  "orders",
  "buyers",
  "sellers",
  "invoices",
  "transactions",
  "products",
  "reviews",
  "qa",
  "product_reports",
  "website",
  "blog",
  "tickets",
  "admin_management",
];

const ACTIONS: Action[] = [
  "view",
  "edit",
  "create",
  "update_status",
  "refund",
  "moderate",
  "respond",
  "manage_admins",
];

function PermissionMatrix({
  grants,
  onChange,
  readOnly,
}: {
  grants: Grant[];
  onChange?: (grants: Grant[]) => void;
  readOnly?: boolean;
}) {
  function has(area: PermissionArea, action: Action) {
    return Boolean(
      grants.find((g) => g.area === area)?.actions.includes(action),
    );
  }

  function toggle(area: PermissionArea, action: Action) {
    if (readOnly || !onChange) return;
    const existing = grants.find((g) => g.area === area);
    let next: Grant[];
    if (!existing) {
      next = [...grants, { area, actions: [action] }];
    } else if (existing.actions.includes(action)) {
      const actions = existing.actions.filter((a) => a !== action);
      next = actions.length
        ? grants.map((g) => (g.area === area ? { ...g, actions } : g))
        : grants.filter((g) => g.area !== area);
    } else {
      next = grants.map((g) =>
        g.area === area ? { ...g, actions: [...g.actions, action] } : g,
      );
    }
    onChange(next);
  }

  return (
    <DataTable
      dense
      data={AREAS.map((area) => ({ area }))}
      columns={[
        {
          accessorKey: "area",
          header: "Area",
          cell: ({ row }) => (
            <span className="font-medium capitalize">
              {row.original.area.replace(/_/g, " ")}
            </span>
          ),
        },
        ...ACTIONS.map((action) => ({
          id: action,
          header: action.replace(/_/g, " "),
          accessorFn: (row: { area: PermissionArea }) => has(row.area, action),
          cell: ({ row }: { row: { original: { area: PermissionArea } } }) => (
            <Checkbox
              checked={has(row.original.area, action)}
              disabled={readOnly}
              onCheckedChange={() => toggle(row.original.area, action)}
              aria-label={`${row.original.area} ${action}`}
            />
          ),
        })),
      ]}
    />
  );
}

export function AdminAdminDetailPage({ adminId }: { adminId: string }) {
  const { data, isLoading, isError } = useAdmin(adminId);
  const mutate = useMockMutation("admins");
  const [grants, setGrants] = useState<Grant[] | null>(null);

  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (isError || !data) return <ErrorState title="Admin not found" />;

  const currentGrants = grants ?? data.grants;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/settings/admins">Admins</Link>
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
        actions={
          <>
            <Badge variant="secondary">{data.role}</Badge>
            {data.isSuperuser ? <Badge>Superuser</Badge> : null}
            {!data.isSuperuser ? (
              <Button
                type="button"
                onClick={async () => {
                  await mutate.mutateAsync({
                    id: data.id,
                    grants: currentGrants,
                  });
                  toast.success("Permissions saved (mock)");
                }}
              >
                Save permissions
              </Button>
            ) : null}
          </>
        }
      />
      <DescriptionList
        items={[
          { label: "Status", value: data.status },
          { label: "Created", value: formatDate(data.createdAt) },
        ]}
      />
      {data.isSuperuser ? (
        <p className="text-sm text-muted-foreground">
          Superusers have full access; grant matrix is not applied.
        </p>
      ) : (
        <PermissionMatrix grants={currentGrants} onChange={setGrants} />
      )}
    </div>
  );
}

export function AdminRolesPage() {
  const query = useRoleTemplates();
  const mutation = useMockMutation("role-templates");
  const [role, setRole] = useState<"support" | "editor" | "custom">("support");
  const [draft, setDraft] = useState<Grant[] | null>(null);
  const grants = draft ?? query.data?.[role] ?? [];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Role templates"
        description="Saved presets are applied to newly created staff accounts. Existing accounts keep their own grants."
        actions={
          <Button
            disabled={mutation.isPending || !query.data}
            onClick={async () => {
              await mutation.mutateAsync({ role, grants });
              setDraft(null);
              toast.success("Role template saved");
            }}
          >
            Save template
          </Button>
        }
      />
      <Select
        value={role}
        onValueChange={(value) => {
          setRole(value as typeof role);
          setDraft(null);
        }}
      >
        <SelectTrigger className="w-48" aria-label="Role template">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="support">Support</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
      {query.isError ? (
        <ErrorState title="Could not load role templates" />
      ) : (
        <PermissionMatrix grants={grants} onChange={setDraft} />
      )}
    </div>
  );
}
