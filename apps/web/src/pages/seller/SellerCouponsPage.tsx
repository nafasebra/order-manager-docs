import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { getSession } from "@/router";
import { useSellerCoupons, useSellerCouponMutation, type CouponValues, type SellerCoupon } from "@/lib/api/sellerCoupons";
import { formatMoney } from "@/lib/formats";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable } from "@/components/patterns/DataTable";
import { actionsColumn } from "@/components/patterns/DataTableRowActions";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const defaults: CouponValues = { code: "", type: "percentage", value: 10, usageLimit: null, registeredOnly: false, enabled: true, startsAt: "", endsAt: "" };

export function SellerCouponsPage() {
  const sellerId = getSession()?.sellerId ?? "seller-0001";
  const query = useSellerCoupons(sellerId);
  const mutation = useSellerCouponMutation(sellerId);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | undefined>();
  const [values, setValues] = useState<CouponValues>(defaults);
  const [deleting, setDeleting] = useState<SellerCoupon | null>(null);
  function startEdit(coupon?: SellerCoupon) {
    setEditing(coupon?.id);
    setValues(coupon ? { ...coupon } : { ...defaults });
    setOpen(true);
  }
  function update<K extends keyof CouponValues>(key: K, value: CouponValues[K]) { setValues((previous) => ({ ...previous, [key]: value })); }
  const columns: ColumnDef<SellerCoupon>[] = [
    { accessorKey: "code", header: "Code", cell: ({ row }) => <span className="font-mono font-medium">{row.original.code}</span> },
    { id: "discount", accessorFn: (row) => row.value, header: "Discount", cell: ({ row }) => row.original.type === "free_shipping" ? "Free shipping" : row.original.type === "percentage" ? `${row.original.value}%` : formatMoney(row.original.value) },
    { id: "usage", accessorFn: (row) => row.usageCount, header: "Usage", cell: ({ row }) => `${row.original.usageCount} / ${row.original.usageLimit ?? "Unlimited"}` },
    { accessorKey: "enabled", header: "Status", cell: ({ row }) => <Badge variant={row.original.enabled ? "secondary" : "outline"}>{row.original.enabled ? "Enabled" : "Disabled"}</Badge> },
    { id: "schedule", accessorFn: (row) => row.startsAt, header: "Schedule", cell: ({ row }) => `${row.original.startsAt || "Any time"} → ${row.original.endsAt || "No expiry"}` },
    actionsColumn<SellerCoupon>((coupon) => [{ label: "Edit coupon", onSelect: () => startEdit(coupon) }, { label: "Delete coupon", destructive: true, onSelect: () => setDeleting(coupon) }]),
  ];
  return (
    <div className="space-y-4">
      <PageHeader title="Coupons" description="Manage discounts for your shop." actions={<Button onClick={() => startEdit()}>Add coupon</Button>} />
      <FilterBar search={search} onSearchChange={setSearch} searchPlaceholder="Search coupon code…">
        <Select value={filter} onValueChange={setFilter}><SelectTrigger className="w-[150px]" aria-label="Coupon status"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="enabled">Enabled</SelectItem><SelectItem value="disabled">Disabled</SelectItem></SelectContent></Select>
      </FilterBar>
      {query.isError ? <ErrorState title="Could not load coupons" /> : <DataTable columns={columns} data={(query.data ?? []).filter((coupon) => coupon.code.toLowerCase().includes(search.trim().toLowerCase()) && (filter === "all" || coupon.enabled === (filter === "enabled")))} isLoading={query.isLoading} dense emptyMessage="No coupons found. Add a coupon to offer your first discount." />}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? "Edit coupon" : "Add coupon"}</DialogTitle><DialogDescription>Set the discount, usage rules, and schedule for your shop.</DialogDescription></DialogHeader>
          <form className="space-y-4" onSubmit={async (event) => {
            event.preventDefault();
            try { await mutation.mutateAsync({ action: "save", id: editing, values }); toast.success(editing ? "Coupon updated" : "Coupon created"); setOpen(false); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save coupon"); }
          }}>
            <div className="space-y-2"><Label htmlFor="coupon-code">Code</Label><Input id="coupon-code" required pattern="[A-Za-z0-9_-]+" value={values.code} onChange={(event) => update("code", event.target.value.toUpperCase())} placeholder="WELCOME10" /></div>
            <div className="space-y-2"><Label>Type</Label><Select value={values.type} onValueChange={(type) => update("type", type as CouponValues["type"])}><SelectTrigger aria-label="Discount type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="fixed">Fixed amount</SelectItem><SelectItem value="free_shipping">Free shipping</SelectItem></SelectContent></Select></div>
            {values.type !== "free_shipping" && <div className="space-y-2"><Label htmlFor="coupon-value">Discount value {values.type === "percentage" ? "(%)" : "(GBP)"}</Label><Input id="coupon-value" type="number" required min="0.01" max={values.type === "percentage" ? 100 : undefined} step="0.01" value={values.value} onChange={(event) => update("value", Number(event.target.value))} /></div>}
            <div className="space-y-2"><Label htmlFor="coupon-limit">Usage limit</Label><Input id="coupon-limit" type="number" min="1" step="1" placeholder="Unlimited" value={values.usageLimit ?? ""} onChange={(event) => update("usageLimit", event.target.value === "" ? null : Number(event.target.value))} /></div>
            <div className="flex items-center gap-2"><Checkbox id="coupon-registered" checked={values.registeredOnly} onCheckedChange={(checked) => update("registeredOnly", checked === true)} /><Label htmlFor="coupon-registered">Only for registered customers</Label></div>
            <div className="flex items-center gap-2"><Checkbox id="coupon-enabled" checked={values.enabled} onCheckedChange={(checked) => update("enabled", checked === true)} /><Label htmlFor="coupon-enabled">Enabled</Label></div>
            <fieldset className="grid gap-3 sm:grid-cols-2"><legend className="mb-2 text-sm font-medium">Schedule</legend><div className="space-y-2"><Label htmlFor="coupon-start">Start date</Label><Input id="coupon-start" type="date" value={values.startsAt} onChange={(event) => update("startsAt", event.target.value)} /></div><div className="space-y-2"><Label htmlFor="coupon-end">End date</Label><Input id="coupon-end" type="date" min={values.startsAt || undefined} value={values.endsAt} onChange={(event) => update("endsAt", event.target.value)} /></div></fieldset>
            <DialogFooter><Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button type="submit" disabled={mutation.isPending}>Save coupon</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={Boolean(deleting)} onOpenChange={(isOpen) => { if (!isOpen) setDeleting(null); }} title="Delete coupon" description={`Delete ${deleting?.code ?? "this coupon"}? This action cannot be undone.`} confirmLabel="Delete" destructive onConfirm={async () => {
        if (!deleting) return;
        try { await mutation.mutateAsync({ action: "delete", id: deleting.id }); toast.success("Coupon deleted"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete coupon"); }
      }} />
    </div>
  );
}
