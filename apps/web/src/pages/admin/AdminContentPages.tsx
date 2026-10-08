import { useListQuery } from "@/hooks/useListQuery";
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
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useContact,
  useContacts,
  useMockMutation,
  usePage,
  usePages,
  usePost,
  usePosts,
  useSiteContext,
} from "@/lib/api/resources";
import { formatDate } from "@/lib/formats";
import type { CrmContact, ListParams, SitePage, BlogPost } from "@/types";

type ListProps = {
  search: ListParams;
  onSearchChange: (next: Partial<ListParams>) => void;
};

const contactColumns: ColumnDef<CrmContact>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "type", header: "Type" },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => row.original.tags.join(", "),
  },
  {
    accessorKey: "lastActivityAt",
    header: "Last activity",
    cell: ({ row }) => formatDate(row.original.lastActivityAt),
  },
];

export function AdminCrmListPage({ search, onSearchChange }: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useListQuery(search, onSearchChange);
  const debouncedQ = useDebouncedValue(q);
  const query = useContacts({ ...search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader title="CRM" description="Buyer and seller contacts." />
      <FilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search contacts…"
      />
      <DataTable
        columns={[
          ...contactColumns,
          actionsColumn<CrmContact>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/crm/$contactId",
                  params: { contactId: row.id },
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
            to: "/admin/crm/$contactId",
            params: { contactId: row.id },
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

export function AdminCrmDetailPage({ contactId }: { contactId: string }) {
  const { data, isLoading, isError } = useContact(contactId);
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !data) return <ErrorState title="Contact not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.name}
        description={data.email}
        actions={<Badge variant="secondary">{data.type}</Badge>}
      />
      <DescriptionList
        items={[
          { label: "Linked id", value: data.linkedId },
          { label: "Tags", value: data.tags.join(", ") || "—" },
          { label: "Notes", value: data.notes || "—" },
          { label: "Last activity", value: formatDate(data.lastActivityAt) },
        ]}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>{formatDate(data.createdAt)} — Contact created</p>
          <p>{formatDate(data.lastActivityAt)} — Last activity</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function AdminWebsitePage() {
  const { data, isLoading } = useSiteContext();
  const mutate = useMockMutation("site-context");
  const form = useForm({
    values: data,
    defaultValues: {
      name: "",
      tagline: "",
      contactEmail: "",
      contactPhone: "",
      defaultSeoTitle: "",
      defaultSeoDescription: "",
      homepageCopy: "",
    },
  });

  if (isLoading || !data) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title="Website"
        description="Site identity, SEO, and contact."
        actions={
          <Button asChild variant="outline">
            <Link to="/admin/website/pages">Manage pages</Link>
          </Button>
        }
      />
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await mutate.mutateAsync(values);
            toast.success("Site context saved (mock)");
          })}
        >
          {(
            [
              ["name", "Site name"],
              ["tagline", "Tagline"],
              ["contactEmail", "Contact email"],
              ["contactPhone", "Contact phone"],
              ["defaultSeoTitle", "Default SEO title"],
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
                </FormItem>
              )}
            />
          ))}
          <FormField
            control={form.control}
            name="defaultSeoDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Default SEO description</FormLabel>
                <FormControl>
                  <Textarea rows={3} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="homepageCopy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Homepage copy</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">Save</Button>
        </form>
      </Form>
    </div>
  );
}

const pageColumns: ColumnDef<SitePage>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "slug", header: "Slug" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
];

export function AdminWebsitePagesListPage({
  search,
  onSearchChange,
}: ListProps) {
  const navigate = useNavigate();
  const query = usePages(search);

  return (
    <div>
      <PageHeader
        title="Website pages"
        description="Static pages (About, Terms, …)."
        actions={
          <Button asChild>
            <Link to="/admin/website/pages/new">Create page</Link>
          </Button>
        }
      />
      <DataTable
        columns={[
          ...pageColumns,
          actionsColumn<SitePage>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/website/pages/$pageId",
                  params: { pageId: row.id },
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
            to: "/admin/website/pages/$pageId",
            params: { pageId: row.id },
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

const pageSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  body: z.string().min(1),
});

export function AdminWebsitePageEditor({ pageId }: { pageId?: string }) {
  const navigate = useNavigate();
  const existing = usePage(pageId ?? "");
  const mutate = useMockMutation("pages");
  const form = useForm<z.infer<typeof pageSchema>>({
    resolver: zodResolver(pageSchema),
    values: existing.data
      ? {
          title: existing.data.title,
          slug: existing.data.slug,
          body: existing.data.body,
        }
      : undefined,
    defaultValues: { title: "", slug: "", body: "" },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title={pageId ? "Edit page" : "Create page"}
        description="Plain textarea placeholder (TipTap later)."
      />
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await mutate.mutateAsync({ ...values, id: pageId });
            toast.success("Page saved (mock)");
            void navigate({ to: "/admin/website/pages" });
          })}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <Textarea rows={10} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Save</Button>
        </form>
      </Form>
    </div>
  );
}

const postColumns: ColumnDef<BlogPost>[] = [
  { accessorKey: "title", header: "Title" },
  { accessorKey: "slug", header: "Slug" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
];

export function AdminBlogListPage({ search, onSearchChange }: ListProps) {
  const navigate = useNavigate();
  const query = usePosts(search);

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Posts and comment moderation."
        actions={
          <Button asChild>
            <Link to="/admin/blog/new">Create post</Link>
          </Button>
        }
      />
      <DataTable
        columns={[
          ...postColumns,
          actionsColumn<BlogPost>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/blog/$postId",
                  params: { postId: row.id },
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
            to: "/admin/blog/$postId",
            params: { postId: row.id },
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

const postSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().min(1),
});

export function AdminBlogEditorPage({ postId }: { postId?: string }) {
  const navigate = useNavigate();
  const existing = usePost(postId ?? "");
  const mutate = useMockMutation("posts");
  const form = useForm<z.infer<typeof postSchema>>({
    resolver: zodResolver(postSchema),
    values: existing.data
      ? {
          title: existing.data.title,
          slug: existing.data.slug,
          excerpt: existing.data.excerpt,
          body: existing.data.body,
        }
      : undefined,
    defaultValues: { title: "", slug: "", excerpt: "", body: "" },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader title={postId ? "Edit post" : "Create post"} />
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await mutate.mutateAsync({ ...values, id: postId });
            toast.success("Post saved (mock)");
            void navigate({ to: "/admin/blog" });
          })}
        >
          {(["title", "slug", "excerpt"] as const).map((name) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="capitalize">{name}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <FormField
            control={form.control}
            name="body"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <Textarea rows={10} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Save</Button>
        </form>
      </Form>
    </div>
  );
}

export function AdminBlogDetailPage({ postId }: { postId: string }) {
  const { data, isLoading, isError } = usePost(postId);
  const mutate = useMockMutation("posts");
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !data) return <ErrorState title="Post not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.title}
        description={data.slug}
        actions={
          <>
            <Badge variant="secondary">{data.status}</Badge>
            <Button asChild variant="outline">
              <Link to="/admin/blog/$postId/edit" params={{ postId: data.id }}>
                Edit
              </Link>
            </Button>
          </>
        }
      />
      <p className="text-sm text-muted-foreground">{data.excerpt}</p>
      <div>
        <h2 className="mb-2 text-lg font-semibold">Comments</h2>
        <ul className="space-y-2">
          {data.comments.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-md border border-border p-3 text-sm"
            >
              <div>
                <p className="font-medium">{c.authorName}</p>
                <p className="text-muted-foreground">{c.body}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{c.status}</Badge>
                <Button
                  size="sm"
                  variant="outline"
                  type="button"
                  onClick={async () => {
                    await mutate.mutateAsync({
                      id: data.id,
                      commentId: c.id,
                      action: "approve",
                    });
                    toast.success("Comment approved (mock)");
                  }}
                >
                  Approve
                </Button>
              </div>
            </li>
          ))}
          {!data.comments.length ? (
            <p className="text-sm text-muted-foreground">No comments yet.</p>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
