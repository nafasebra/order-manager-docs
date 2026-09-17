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
import { Textarea } from "@/components/ui/textarea";
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
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
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
import type {
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
        description="Platform catalog."
        actions={
          <Button asChild>
            <Link to="/admin/products/new">Create product</Link>
          </Button>
        }
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

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  description: z.string().min(1),
});

export function AdminProductFormPage({
  productId,
}: {
  productId?: string;
}) {
  const navigate = useNavigate();
  const existing = useProduct(productId ?? "");
  const mutate = useMockMutation("products");
  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    values: existing.data
      ? {
          name: existing.data.name,
          sku: existing.data.sku,
          price: existing.data.price,
          stock: existing.data.stock,
          description: existing.data.description,
        }
      : undefined,
    defaultValues: {
      name: "",
      sku: "",
      price: 0,
      stock: 0,
      description: "",
    },
  });

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <PageHeader
        title={productId ? "Edit product" : "Create product"}
        description="Catalog details (mock)."
      />
      <Form {...form}>
        <form
          className="space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await mutate.mutateAsync({ ...values, id: productId });
            toast.success(productId ? "Product updated (mock)" : "Product created (mock)");
            void navigate({ to: "/admin/products" });
          })}
        >
          {(["name", "sku"] as const).map((name) => (
            <FormField
              key={name}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{name === "sku" ? "SKU" : "Name"}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <div className="grid grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea rows={4} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" asChild>
              <Link to="/admin/products">Cancel</Link>
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function AdminProductDetailPage({ productId }: { productId: string }) {
  const { data, isLoading, isError } = useProduct(productId);
  if (isLoading) return <Skeleton className="h-80 w-full" />;
  if (isError || !data) return <ErrorState title="Product not found" />;

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/admin/products">Products</Link>
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
        description={data.sku}
        actions={
          <>
            <StatusChip kind="content" status={data.status} />
            <Button asChild variant="outline">
              <Link
                to="/admin/products/$productId/edit"
                params={{ productId: data.id }}
              >
                Edit
              </Link>
            </Button>
          </>
        }
      />
      <DescriptionList
        items={[
          { label: "Seller", value: data.sellerName },
          { label: "Category", value: data.category },
          { label: "Price", value: formatMoney(data.price, data.currency) },
          { label: "Stock", value: data.stock },
          { label: "Updated", value: formatDate(data.updatedAt) },
        ]}
      />
      <p className="text-sm text-muted-foreground">{data.description}</p>
    </div>
  );
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
