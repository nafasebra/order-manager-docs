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
import { StatusChip } from "@/components/patterns/StatusChip";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  useCategory,
  useCategoryMutation,
  useCategories,
  useMockMutation,
  useProduct,
  useProducts,
  useQuestion,
  useQuestions,
  useReport,
  useReports,
  useReview,
  useReviews,
} from "@/lib/api/resources";
import { formatMoney, formatDate } from "@/lib/formats";
import { getSession } from "@/router";
import { useProductModeration, productSales, productReviews } from "@/lib/api/productManagement";
import type {
  Category,
  ListParams,
  Product,
  ProductReport,
  Question,
  Review,
} from "@/types";

type ListProps = {
  search: ListParams;
  onSearchChange: (next: Partial<ListParams>) => void;
};

const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Use lowercase letters, numbers, and hyphens",
    ),
});

const categoryColumns: ColumnDef<Category>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "slug", header: "Slug" },
  { accessorKey: "productCount", header: "Products" },
  {
    accessorKey: "publishedProductCount",
    header: "Published products",
  },
];

export function AdminCategoriesListPage({
  search,
  onSearchChange,
}: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useState(String(search.q ?? ""));
  const [createOpen, setCreateOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const debouncedQ = useDebouncedValue(q);
  const query = useCategories({ ...search, q: debouncedQ || undefined });
  const mutate = useCategoryMutation();
  const createForm = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", slug: "" },
  });

  function setCreateDialogOpen(open: boolean) {
    setCreateOpen(open);
    if (!open) createForm.reset();
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Product categories across the marketplace."
        actions={
          <Button type="button" onClick={() => setCreateDialogOpen(true)}>
            Create category
          </Button>
        }
      />
      <FilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="Search categories…"
      />
      <DataTable
        columns={[
          ...categoryColumns,
          actionsColumn<Category>((row) => [
            {
              label: "Edit category",
              onSelect: () =>
                void navigate({
                  to: "/admin/categories/$categoryId/edit",
                  params: { categoryId: row.id },
                }),
            },
            copyIdAction(row.id),
            {
              label: "Delete category",
              destructive: true,
              onSelect: () => setCategoryToDelete(row),
            },
          ]),
        ]}
        data={query.data?.items ?? []}
        isLoading={query.isLoading}
        dense
      />
      <ListPagination
        page={Number(search.page ?? 1)}
        pageSize={Number(search.pageSize ?? 25)}
        total={query.data?.total ?? 0}
        onPageChange={(page) => onSearchChange({ page })}
      />
      <Dialog open={createOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create category</DialogTitle>
            <DialogDescription>
              Add a category to organize products in the marketplace catalog.
            </DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form
              className="space-y-4"
              onSubmit={createForm.handleSubmit(async (values) => {
                try {
                  await mutate.mutateAsync({ action: "create", ...values });
                  toast.success("Category created");
                  setCreateDialogOpen(false);
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Could not create category",
                  );
                }
              })}
            >
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input autoFocus {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={createForm.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="category-name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={mutate.isPending}>
                  Create category
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        onOpenChange={(open) => {
          if (!open) setCategoryToDelete(null);
        }}
        title="Delete category"
        description={
          categoryToDelete?.productCount
            ? `${categoryToDelete.name} has ${categoryToDelete.productCount} products. Move or remove them before deleting this category.`
            : `Delete ${categoryToDelete?.name ?? "this category"}? This action cannot be undone.`
        }
        confirmLabel="Delete"
        destructive
        onConfirm={async () => {
          if (!categoryToDelete) return;
          try {
            await mutate.mutateAsync({
              action: "delete",
              id: categoryToDelete.id,
            });
            toast.success("Category deleted");
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Could not delete category",
            );
          }
        }}
      />
    </div>
  );
}

export function AdminCategoryFormPage({ categoryId }: { categoryId?: string }) {
  const navigate = useNavigate();
  const existing = useCategory(categoryId ?? "");
  const mutate = useCategoryMutation();
  const form = useForm<z.infer<typeof categorySchema>>({
    resolver: zodResolver(categorySchema),
    values: existing.data
      ? { name: existing.data.name, slug: existing.data.slug }
      : undefined,
    defaultValues: { name: "", slug: "" },
  });

  if (categoryId && existing.isLoading) {
    return <Skeleton className="mx-auto h-72 w-full max-w-xl" />;
  }
  if (categoryId && (existing.isError || !existing.data)) {
    return <ErrorState title="Category not found" />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title={categoryId ? "Edit category" : "Create category"}
        description="Organize products in the marketplace catalog."
      />
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              if (categoryId) {
                await mutate.mutateAsync({
                  action: "update",
                  id: categoryId,
                  ...values,
                });
                toast.success("Category updated");
              } else {
                await mutate.mutateAsync({ action: "create", ...values });
                toast.success("Category created");
              }
              void navigate({ to: "/admin/categories" });
            } catch (error) {
              toast.error(
                error instanceof Error ? error.message : "Could not save category",
              );
            }
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
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input placeholder="category-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={mutate.isPending}>Save</Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/categories">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

const productColumns: ColumnDef<Product>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "sku", header: "SKU" },
  { accessorKey: "sellerName", header: "Seller" },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => formatMoney(row.original.price, row.original.currency),
  },
  { accessorKey: "stock", header: "Stock" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusChip kind="content" status={row.original.status} />
    ),
  },
];

export function AdminProductsListPage({ search, onSearchChange }: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useState(String(search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useProducts({ ...search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader
        title="Products"
        description="Inspect seller listings, sales, and reviews. Sellers manage product information."
      />
      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder="Search products…">
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
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        columns={[
          ...productColumns,
          actionsColumn<Product>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/products/$productId",
                  params: { productId: row.id },
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
            to: "/admin/products/$productId",
            params: { productId: row.id },
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


export function AdminProductDetailPage({ productId }: { productId: string }) {
  const { data, isLoading, isError } = useProduct(productId);
  const mutation = useProductModeration(getSession()?.displayName ?? "Admin preview");
  const [moderationOpen, setModerationOpen] = useState(false);
  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (isError || !data) return <ErrorState title="Product not found" />;
  return <div className="space-y-6">
    <Button variant="outline" asChild><Link to="/admin/products">Back to products</Link></Button>
    <PageHeader title={data.name} description={data.sku} actions={<Button variant={data.moderation?.blocked ? "outline" : "destructive"} onClick={() => setModerationOpen(true)}>{data.moderation?.blocked ? "Lift restriction" : "Restrict listing"}</Button>} />
    <DescriptionList items={[
      { label: "Seller", value: <Link to="/admin/sellers/$sellerId" params={{ sellerId: data.sellerId }} className="text-primary hover:underline">{data.sellerName}</Link> },
      { label: "Category", value: data.category }, { label: "Price", value: formatMoney(data.price, data.currency) },
      { label: "Stock", value: data.stock }, { label: "Units sold (delivered)", value: productSales(data.id) },
      { label: "Listing status", value: data.status }, { label: "Platform", value: data.moderation?.blocked ? "Restricted" : "Allowed" },
      { label: "Updated", value: formatDate(data.updatedAt) },
    ]} />
    <p className="text-sm text-muted-foreground">{data.description}</p>
    {data.moderation && <p className="text-sm">Last moderation: {data.moderation.reason} · {data.moderation.by} · {formatDate(data.moderation.at)}</p>}
    <div className="space-y-3"><h2 className="text-lg font-semibold">Product reviews</h2><DataTable data={productReviews(data.id)} columns={[
      { accessorKey: "buyerName", header: "Buyer" }, { accessorKey: "rating", header: "Rating" }, { accessorKey: "title", header: "Title" }, { accessorKey: "body", header: "Review" }, { accessorKey: "status", header: "Status" },
      actionsColumn<Review>((review) => [{ label: "View review", onSelect: () => { window.location.href = `/admin/reviews/${review.id}`; } }]),
    ]} emptyMessage="No reviews yet." /></div>
    <ConfirmDialog open={moderationOpen} onOpenChange={setModerationOpen} title={data.moderation?.blocked ? "Lift platform restriction" : "Restrict listing"} description="Restricting unpublishes the listing. Lifting a restriction lets the seller publish it again." requireReason onConfirm={async (reason) => {
      try { await mutation.mutateAsync({ id: data.id, blocked: !data.moderation?.blocked, reason: reason ?? "" }); toast.success("Platform restriction updated"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update restriction"); }
    }} />
  </div>;
}

function ModerationListPage<T extends { id: string }>({
  title,
  description,
  columns,
  search,
  onSearchChange,
  useList,
  detailTo,
  statusOptions,
}: {
  title: string;
  description: string;
  columns: ColumnDef<T>[];
  search: ListParams;
  onSearchChange: (next: Partial<ListParams>) => void;
  useList: (params?: ListParams) => {
    data?: { items: T[]; total: number };
    isLoading: boolean;
  };
  detailTo: string;
  statusOptions: { value: string; label: string }[];
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState(String(search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useList({ ...search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader title={title} description={description} />
      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder={`Search ${title.toLowerCase()}…`}>
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
            {statusOptions.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        columns={[
          ...columns,
          actionsColumn<T>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: detailTo as "/",
                  params: { id: row.id } as never,
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
            to: detailTo as "/",
            params: { id: row.id } as never,
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

const reviewColumns: ColumnDef<Review>[] = [
  { accessorKey: "productName", header: "Product" },
  { accessorKey: "buyerName", header: "Buyer" },
  { accessorKey: "rating", header: "Rating" },
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
];

export function AdminReviewsListPage(props: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useState(String(props.search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useReviews({ ...props.search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader title="Reviews" description="Moderate customer reviews." />
      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder="Search reviews…">
        <Select
          value={String(props.search.status ?? "all")}
          onValueChange={(v) =>
            props.onSearchChange({
              status: v === "all" ? undefined : v,
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-[140px]" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="hidden">Hidden</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        columns={[
          ...reviewColumns,
          actionsColumn<Review>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/reviews/$reviewId",
                  params: { reviewId: row.id },
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
            to: "/admin/reviews/$reviewId",
            params: { reviewId: row.id },
          })
        }
      />
      <ListPagination
        page={Number(props.search.page ?? 1)}
        pageSize={Number(props.search.pageSize ?? 25)}
        total={query.data?.total ?? 0}
        onPageChange={(page) => props.onSearchChange({ page })}
      />
    </div>
  );
}

export function AdminReviewDetailPage({ reviewId }: { reviewId: string }) {
  const { data, isLoading, isError } = useReview(reviewId);
  const mutate = useMockMutation("reviews");
  const [hideOpen, setHideOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !data) return <ErrorState title="Review not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.title}
        description={`${data.productName} · ${data.buyerName}`}
        actions={
          <>
            <Badge variant="secondary">{data.status}</Badge>
            <Button
              type="button"
              onClick={async () => {
                await mutate.mutateAsync({ id: data.id, action: "approve" });
                toast.success("Review approved (mock)");
              }}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setHideOpen(true)}
            >
              Hide
            </Button>
          </>
        }
      />
      <p className="text-sm">Rating: {data.rating}/5</p>
      <p className="text-sm text-muted-foreground">{data.body}</p>
      <ConfirmDialog
        open={hideOpen}
        onOpenChange={setHideOpen}
        title="Hide review"
        confirmLabel="Hide"
        destructive
        onConfirm={async () => {
          await mutate.mutateAsync({ id: data.id, action: "hide" });
          toast.success("Review hidden (mock)");
        }}
      />
    </div>
  );
}

const qaColumns: ColumnDef<Question>[] = [
  { accessorKey: "productName", header: "Product" },
  { accessorKey: "askerName", header: "Asker" },
  { accessorKey: "body", header: "Question" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
];

export function AdminQuestionsListPage(props: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useState(String(props.search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useQuestions({ ...props.search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader title="Q&A" description="Moderate product questions." />
      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder="Search questions…" />
      <DataTable
        columns={[
          ...qaColumns,
          actionsColumn<Question>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/questions/$questionId",
                  params: { questionId: row.id },
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
            to: "/admin/questions/$questionId",
            params: { questionId: row.id },
          })
        }
      />
      <ListPagination
        page={Number(props.search.page ?? 1)}
        pageSize={Number(props.search.pageSize ?? 25)}
        total={query.data?.total ?? 0}
        onPageChange={(page) => props.onSearchChange({ page })}
      />
    </div>
  );
}

export function AdminQuestionDetailPage({
  questionId,
}: {
  questionId: string;
}) {
  const { data, isLoading, isError } = useQuestion(questionId);
  const mutate = useMockMutation("questions");
  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !data) return <ErrorState title="Question not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Q&A"
        description={data.productName}
        actions={
          <Button
            type="button"
            onClick={async () => {
              await mutate.mutateAsync({ id: data.id, action: "approve" });
              toast.success("Question published (mock)");
            }}
          >
            Publish
          </Button>
        }
      />
      <p className="text-sm font-medium">{data.body}</p>
      <p className="text-sm text-muted-foreground">
        Answer: {data.answer ?? "No answer yet"}
      </p>
    </div>
  );
}

const reportColumns: ColumnDef<ProductReport>[] = [
  { accessorKey: "productName", header: "Product" },
  { accessorKey: "reporterName", header: "Reporter" },
  { accessorKey: "reason", header: "Reason" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge>,
  },
];

export function AdminReportsListPage(props: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useState(String(props.search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useReports({ ...props.search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader
        title="Product reports"
        description="Investigate listing reports."
      />
      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder="Search reports…" />
      <DataTable
        columns={[
          ...reportColumns,
          actionsColumn<ProductReport>((row) => [
            {
              label: "View details",
              onSelect: () =>
                void navigate({
                  to: "/admin/product-reports/$reportId",
                  params: { reportId: row.id },
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
            to: "/admin/product-reports/$reportId",
            params: { reportId: row.id },
          })
        }
      />
      <ListPagination
        page={Number(props.search.page ?? 1)}
        pageSize={Number(props.search.pageSize ?? 25)}
        total={query.data?.total ?? 0}
        onPageChange={(page) => props.onSearchChange({ page })}
      />
    </div>
  );
}

export function AdminReportDetailPage({ reportId }: { reportId: string }) {
  const { data, isLoading, isError } = useReport(reportId);
  const mutate = useMockMutation("product_reports");
  const [resolveOpen, setResolveOpen] = useState(false);

  if (isLoading) return <Skeleton className="h-64 w-full" />;
  if (isError || !data) return <ErrorState title="Report not found" />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={data.reason}
        description={data.productName}
        actions={
          <>
            <Badge variant="secondary">{data.status}</Badge>
            <Button type="button" onClick={() => setResolveOpen(true)}>
              Resolve
            </Button>
          </>
        }
      />
      <DescriptionList
        items={[
          { label: "Reporter", value: data.reporterName },
          { label: "Evidence", value: data.evidence ?? "—" },
          { label: "Created", value: formatDate(data.createdAt) },
          { label: "Resolution", value: data.resolution ?? "—" },
        ]}
      />
      <ConfirmDialog
        open={resolveOpen}
        onOpenChange={setResolveOpen}
        title="Resolve report"
        confirmLabel="Resolve"
        requireReason
        reasonLabel="Resolution notes"
        onConfirm={async (reason) => {
          await mutate.mutateAsync({ id: data.id, action: "resolve", reason });
          toast.success("Report resolved (mock)");
        }}
      />
    </div>
  );
}

// silence unused helper warning if tree-shaken oddly
void ModerationListPage;
