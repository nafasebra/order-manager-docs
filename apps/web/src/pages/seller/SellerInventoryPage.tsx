import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { getSession } from "@/router";
import { useSellerInventory, useSellerStockMutation } from "@/lib/api/resources";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable } from "@/components/patterns/DataTable";
import { ErrorState } from "@/components/patterns/ErrorState";
import { StatusChip } from "@/components/patterns/StatusChip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Product } from "@/types";

export function SellerInventoryPage() {
  const sellerId = getSession()?.sellerId ?? "seller-0001";
  const query = useSellerInventory(sellerId);
  const mutate = useSellerStockMutation(sellerId);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const products = query.data ?? [];
  const rows = products.filter((product) => {
    const matches = `${product.name} ${product.sku}`.toLowerCase().includes(search.trim().toLowerCase());
    return matches && (filter === "all" || (filter === "low" && product.stock > 0 && product.stock < 10) || (filter === "out" && product.stock === 0));
  });
  const columns: ColumnDef<Product>[] = [
    { accessorKey: "name", header: "Product" },
    { accessorKey: "sku", header: "SKU" },
    { accessorKey: "status", header: "Listing", cell: ({ row }) => <StatusChip kind="content" status={row.original.status} /> },
    { accessorKey: "stock", header: "Quantity", cell: ({ row }) => <span className="font-semibold tabular-nums">{row.original.stock}</span> },
    { id: "stock-status", header: "Stock", cell: ({ row }) => <Badge variant={row.original.stock === 0 ? "destructive" : "secondary"}>{row.original.stock === 0 ? "Out of stock" : row.original.stock < 10 ? "Low stock" : "In stock"}</Badge> },
    { id: "adjust", header: "", cell: ({ row }) => <Button variant="outline" size="sm" onClick={() => { setSelected(row.original); setQuantity(String(row.original.stock)); }}>Update stock</Button> },
  ];
  const valid = quantity.trim() !== "" && Number.isSafeInteger(Number(quantity)) && Number(quantity) >= 0;
  return (
    <div className="space-y-4">
      <PageHeader title="Inventory" description="Review your shop's stock and update quantities. Low stock means fewer than 10 units." />
      <div className="grid gap-3 sm:grid-cols-3">
        {([
          ["Total units", products.reduce((total, product) => total + product.stock, 0)],
          ["Low-stock products", products.filter((product) => product.stock > 0 && product.stock < 10).length],
          ["Out of stock", products.filter((product) => product.stock === 0).length],
        ] as const).map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{query.isLoading ? "—" : value}</p></CardContent></Card>)}
      </div>
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search product or SKU…">
        <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-[160px]" aria-label="Stock filter"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All stock</SelectItem><SelectItem value="low">Low stock</SelectItem><SelectItem value="out">Out of stock</SelectItem></SelectContent></Select>
      </FilterBar>
      {query.isError ? <ErrorState title="Could not load inventory" /> : <DataTable columns={columns} data={rows} isLoading={query.isLoading} dense emptyMessage="No products match this view." />}
      <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update stock</DialogTitle><DialogDescription>{selected?.name} · {selected?.sku}. Current quantity: {selected?.stock}.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={async (event) => {
            event.preventDefault();
            if (!selected || !valid) return;
            try { await mutate.mutateAsync({ id: selected.id, stock: Number(quantity) }); toast.success("Stock updated"); setSelected(null); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not update stock"); }
          }}>
            <div className="space-y-2"><Label htmlFor="inventory-quantity">New quantity</Label><Input id="inventory-quantity" type="number" min="0" step="1" required value={quantity} onChange={(event) => setQuantity(event.target.value)} /><p className="text-xs text-muted-foreground">Set the total quantity, rather than the amount to add.</p></div>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button><Button type="submit" disabled={!valid || mutate.isPending}>Save quantity</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
