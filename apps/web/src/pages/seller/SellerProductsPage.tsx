import { template } from "@/config/template";
import { useState } from "react";
import { toast } from "sonner";
import { getSession } from "@/lib/auth/store";
import { categories } from "@/mocks/fixtures";
import {
  useSellerProducts,
  useSellerProductManagement,
  type ProductValues,
} from "@/lib/api/productManagement";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable } from "@/components/patterns/DataTable";
import { FilterBar } from "@/components/patterns/FilterBar";
import { ListPagination } from "@/components/patterns/ListPagination";
import { actionsColumn } from "@/components/patterns/DataTableRowActions";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatMoney } from "@/lib/formats";
import type { Product, ListParams } from "@/types";

const initial: ProductValues = {
  name: "",
  sku: "",
  price: 0,
  stock: 0,
  description: "",
  category: "",
  status: "draft",
};
export function SellerProductsPage({
  search,
  onSearchChange,
}: {
  search: ListParams;
  onSearchChange: (next: Partial<ListParams>) => void;
}) {
  const sellerId = getSession()?.sellerId ?? "seller-0001";
  const query = useSellerProducts(sellerId, search);
  const mutation = useSellerProductManagement(sellerId);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [values, setValues] = useState(initial);
  function edit(product?: Product) {
    setEditing(product ?? null);
    setValues(product ? { ...product } : { ...initial });
    setOpen(true);
  }
  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        description="Create and manage your shop's catalog. Platform restrictions are controlled by admins."
        actions={<Button onClick={() => edit()}>Add product</Button>}
      />
      <FilterBar
        search={String(search.q ?? "")}
        onSearchChange={(q) => onSearchChange({ q, page: 1 })}
        searchPlaceholder="Search product or SKU…"
      />
      {query.isError ? (
        <ErrorState title="Could not load products" />
      ) : (
        <DataTable<Product>
          data={query.data?.items ?? []}
          isLoading={query.isLoading}
          dense
          columns={[
            { accessorKey: "name", header: "Product" },
            { accessorKey: "sku", header: "SKU" },
            { accessorKey: "category", header: "Category" },
            {
              accessorKey: "price",
              header: "Price",
              cell: ({ row }) => formatMoney(row.original.price),
            },
            { accessorKey: "stock", header: "Stock" },
            { accessorKey: "status", header: "Listing status" },
            {
              id: "moderationStatus",
              accessorFn: (product) =>
                product.moderation?.blocked ? "Restricted" : "Allowed",
              header: "Platform",
              cell: ({ row }) =>
                row.original.moderation?.blocked ? (
                  <span title={row.original.moderation.reason}>
                    Restricted: {row.original.moderation.reason}
                  </span>
                ) : (
                  "Allowed"
                ),
            },
            actionsColumn((product) => [
              { label: "Edit", onSelect: () => edit(product) },
              {
                label: "Delete",
                destructive: true,
                onSelect: () => setDeleting(product),
              },
            ]),
          ]}
        />
      )}
      <ListPagination
        page={Number(search.page ?? 1)}
        pageSize={Number(search.pageSize ?? 25)}
        total={query.data?.total ?? 0}
        onPageChange={(page) => onSearchChange({ page })}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit product" : "Add product"}
            </DialogTitle>
            <DialogDescription>
              Product information for your shop.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={async (event) => {
              event.preventDefault();
              try {
                await mutation.mutateAsync({
                  action: "save",
                  id: editing?.id,
                  values,
                });
                toast.success("Product saved");
                setOpen(false);
              } catch (error) {
                toast.error(
                  error instanceof Error
                    ? error.message
                    : "Could not save product",
                );
              }
            }}
          >
            {(["name", "sku"] as const).map((key) => (
              <div key={key}>
                <Label htmlFor={`product-${key}`}>
                  {key === "sku" ? "SKU" : "Name"}
                </Label>
                <Input
                  id={`product-${key}`}
                  required
                  value={values[key]}
                  onChange={(event) =>
                    setValues({ ...values, [key]: event.target.value })
                  }
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              {(["price", "stock"] as const).map((key) => (
                <div key={key}>
                  <Label htmlFor={`product-${key}`}>
                    {key === "price" ? `Price (${template.currency})` : "Stock"}
                  </Label>
                  <Input
                    id={`product-${key}`}
                    type="number"
                    required
                    min={key === "price" ? 0.01 : 0}
                    step={key === "price" ? 0.01 : 1}
                    value={values[key]}
                    onChange={(event) =>
                      setValues({
                        ...values,
                        [key]: Number(event.target.value),
                      })
                    }
                  />
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="product-category">Category</Label>
              <select
                id="product-category"
                required
                className="h-10 w-full rounded border bg-background px-2"
                value={values.category}
                onChange={(event) =>
                  setValues({ ...values, category: event.target.value })
                }
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="product-status">Listing status</Label>
              <select
                id="product-status"
                className="h-10 w-full rounded border bg-background px-2"
                value={values.status}
                onChange={(event) =>
                  setValues({
                    ...values,
                    status: event.target.value as Product["status"],
                  })
                }
              >
                <option value="draft">Draft</option>
                <option
                  value="published"
                  disabled={editing?.moderation?.blocked}
                >
                  Published
                </option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <Label htmlFor="product-description">Description</Label>
              <Textarea
                id="product-description"
                required
                value={values.description}
                onChange={(event) =>
                  setValues({ ...values, description: event.target.value })
                }
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button disabled={mutation.isPending}>Save product</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={Boolean(deleting)}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDeleting(null);
        }}
        title="Delete product"
        description={`Remove ${deleting?.name ?? "this product"} from your catalog? Historical order and review records remain.`}
        destructive
        confirmLabel="Delete"
        onConfirm={async () => {
          if (deleting) {
            try {
              await mutation.mutateAsync({ action: "delete", id: deleting.id });
              toast.success("Product deleted");
            } catch (error) {
              toast.error(
                error instanceof Error
                  ? error.message
                  : "Could not delete product",
              );
            }
          }
        }}
      />
    </div>
  );
}
