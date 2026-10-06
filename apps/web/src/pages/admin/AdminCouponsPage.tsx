import { useState } from "react";
import { toast } from "sonner";
import { getSession } from "@/router";
import { sellers, products } from "@/mocks/fixtures";
import { useAdminCoupons, useAdminCouponMutation, couponStatus, couponFlags, type SellerCoupon, type CouponValues, type CouponPolicy } from "@/lib/api/sellerCoupons";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable } from "@/components/patterns/DataTable";
import { actionsColumn } from "@/components/patterns/DataTableRowActions";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatMoney } from "@/lib/formats";

const initial: CouponValues = { code: "", type: "percentage", value: 10, usageLimit: null, registeredOnly: false, enabled: true, startsAt: "", endsAt: "" };
const selectClass = "h-10 rounded-md border bg-background px-3 text-sm";
export function AdminCouponsPage() {
  const query = useAdminCoupons();
  const mutation = useAdminCouponMutation(getSession()?.displayName ?? "Admin preview");
  const [search, setSearch] = useState("");
  const [tenant, setTenant] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [flagged, setFlagged] = useState(false);
  const [detail, setDetail] = useState<string | null>(null);
  const [editing, setEditing] = useState<SellerCoupon | null>(null);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initial);
  const [scope, setScope] = useState<"seller" | "platform">("platform");
  const [owner, setOwner] = useState("");
  const [tenantIds, setTenantIds] = useState<string[]>([]);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [confirm, setConfirm] = useState<{ id: string; action: "suspend" | "enable" | "delete" } | null>(null);
  const [policyDraft, setPolicyDraft] = useState<CouponPolicy | null>(null);
  const [restrictedTenant, setRestrictedTenant] = useState("");
  const [reason, setReason] = useState("");
  const data = query.data;
  async function run(payload: Parameters<typeof mutation.mutateAsync>[0]) {
    try { await mutation.mutateAsync(payload); toast.success("Saved"); return true; } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save"); return false; }
  }
  function edit(coupon?: SellerCoupon) {
    setEditing(coupon ?? null); setValues(coupon ? { ...coupon } : { ...initial }); setScope(coupon?.scope ?? "platform"); setOwner(coupon?.sellerId ?? ""); setTenantIds(coupon?.tenantIds ?? []); setProductIds(coupon?.productIds ?? []); setOpen(true);
  }
  const rows = (data?.coupons ?? []).filter((coupon) => coupon.code.toLowerCase().includes(search.toLowerCase()) && (!tenant || coupon.sellerId === tenant || (coupon.scope === "platform" && (!coupon.tenantIds?.length || coupon.tenantIds.includes(tenant)))) && (!status || couponStatus(coupon) === status) && (!type || coupon.type === type) && (!from || (!!coupon.endsAt && coupon.endsAt >= from)) && (!to || (!!coupon.endsAt && coupon.endsAt <= to)) && (!flagged || couponFlags(coupon).length > 0));
  const selected = data?.coupons.find((coupon) => coupon.id === detail);
  const policy = policyDraft ?? data?.policy;
  const storeName = (id: string) => sellers.find((seller) => seller.id === id)?.shopName ?? id;
  const discount = (coupon: CouponValues) => coupon.type === "percentage" ? `${coupon.value}%` : coupon.type === "fixed" ? formatMoney(coupon.value) : "Free shipping";
  return <div className="space-y-6">
    <PageHeader title="Coupons" description="Marketplace discounts, tenant controls, and usage monitoring." actions={<Button onClick={() => edit()}>Add coupon</Button>} />
    <div className="grid gap-3 sm:grid-cols-3">{([["Redemptions", String(rows.reduce((sum, coupon) => sum + coupon.usageCount, 0))], ["Total discounts", formatMoney(rows.reduce((sum, coupon) => sum + (coupon.totalDiscount ?? 0), 0))], ["Influenced revenue", formatMoney(rows.reduce((sum, coupon) => sum + (coupon.influencedRevenue ?? 0), 0))]]).map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label} · filtered coupons</p><p className="text-xl font-semibold">{value}</p></CardContent></Card>)}</div>
    <div className="flex flex-wrap items-end gap-2">
      <Input className="w-48" aria-label="Search code" placeholder="Search code…" value={search} onChange={(event) => setSearch(event.target.value)} />
      <select className={selectClass} aria-label="Tenant filter" value={tenant} onChange={(event) => setTenant(event.target.value)}><option value="">All stores</option>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.shopName}</option>)}</select>
      <select className={selectClass} aria-label="Status filter" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{["Active", "Expired", "Disabled", "Suspended", "Scheduled", "Exhausted"].map((item) => <option key={item}>{item}</option>)}</select>
      <select className={selectClass} aria-label="Type filter" value={type} onChange={(event) => setType(event.target.value)}><option value="">All discounts</option><option value="percentage">Percentage</option><option value="fixed">Fixed amount</option><option value="free_shipping">Free shipping</option></select>
      <div><Label htmlFor="expiry-from">Expires from</Label><Input id="expiry-from" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></div><div><Label htmlFor="expiry-to">Expires to</Label><Input id="expiry-to" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></div>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={flagged} onChange={(event) => setFlagged(event.target.checked)} />Flagged only</label>
    </div>
    <p className="text-xs text-muted-foreground">Flags highlight discounts above policy and usage above the review threshold; they are review signals, not proof of fraud.</p>
    {query.isError ? <ErrorState title="Could not load coupons" /> : <DataTable<SellerCoupon> dense isLoading={query.isLoading} data={rows} columns={[
      { accessorKey: "code", header: "Code" }, { id: "seller", header: "Seller / Store", cell: ({ row }) => row.original.scope === "platform" ? `Platform · ${row.original.tenantIds?.length ? `${row.original.tenantIds.length} stores` : "All stores"}` : storeName(row.original.sellerId) },
      { id: "discount", header: "Discount", cell: ({ row }) => discount(row.original) }, { id: "status", header: "Status", cell: ({ row }) => couponStatus(row.original) },
      { id: "usage", header: "Usage", cell: ({ row }) => `${row.original.usageCount} / ${row.original.usageLimit ?? "Unlimited"}` }, { accessorKey: "endsAt", header: "Expiration" }, { id: "flags", header: "Flags", cell: ({ row }) => couponFlags(row.original).join(", ") || "—" },
      actionsColumn((coupon) => [{ label: "Details", onSelect: () => setDetail(coupon.id) }, { label: "Edit", onSelect: () => edit(coupon) }, { label: "Suspend", destructive: true, onSelect: () => setConfirm({ id: coupon.id, action: "suspend" }) }, { label: "Enable", onSelect: () => setConfirm({ id: coupon.id, action: "enable" }) }, { label: "Delete", destructive: true, onSelect: () => setConfirm({ id: coupon.id, action: "delete" }) }]),
    ]} />}
    <div className="grid gap-4 lg:grid-cols-2">
      <Card><CardHeader><CardTitle>Coupon policies</CardTitle></CardHeader><CardContent>{policy && <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); if (await run({ action: "policy", policy })) setPolicyDraft(null); }}>
        {([['maxPercentage', 'Maximum percentage discount'], ['maxValidityDays', 'Maximum validity (days)'], ['unusualUsage', 'Usage review threshold']] as const).map(([key, label]) => <div key={key}><Label htmlFor={key}>{label}</Label><Input id={key} type="number" min="1" max={key === "maxPercentage" ? 100 : undefined} value={policy[key]} onChange={(event) => setPolicyDraft({ ...policy, [key]: Number(event.target.value) })} required /></div>)}
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={policy.allowStacking} onChange={(event) => setPolicyDraft({ ...policy, allowStacking: event.target.checked })} />Allow combining coupons</label><p className="text-xs text-muted-foreground">Discount and validity limits apply to new and edited coupons. Combining rules require checkout integration.</p><Button disabled={mutation.isPending}>Save policies</Button>
      </form>}</CardContent></Card>
      <Card><CardHeader><CardTitle>Tenant restrictions</CardTitle></CardHeader><CardContent className="space-y-3">
        <select className={`${selectClass} w-full`} aria-label="Restrict tenant" value={restrictedTenant} onChange={(event) => setRestrictedTenant(event.target.value)}><option value="">Select a store</option>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.shopName}</option>)}</select>
        <Input aria-label="Restriction reason" placeholder="Reason for restricting coupon creation" value={reason} onChange={(event) => setReason(event.target.value)} />
        <div className="flex gap-2"><Button disabled={!restrictedTenant || !reason.trim() || mutation.isPending} onClick={() => void run({ action: "restriction", sellerId: restrictedTenant, blocked: true, reason })}>Restrict creation</Button><Button variant="outline" disabled={!restrictedTenant || mutation.isPending} onClick={() => void run({ action: "restriction", sellerId: restrictedTenant, blocked: false, reason })}>Restore access</Button></div>
        {Object.entries(data?.restrictions ?? {}).map(([id, text]) => <p key={id} className="text-sm"><span className="font-medium">{storeName(id)}</span>: {text}</p>)}
      </CardContent></Card>
    </div>
    <Card><CardHeader><CardTitle>Audit log</CardTitle></CardHeader><CardContent className="max-h-80 space-y-3 overflow-y-auto">{!data?.audits.length && <p className="text-sm text-muted-foreground">Coupon activity will appear here.</p>}{data?.audits.map((entry) => <div key={entry.id} className="border-b pb-2 text-sm"><p>{entry.actor} · {entry.action} · {new Date(entry.at).toLocaleString()}</p><p className="text-muted-foreground">{entry.couponId ?? "Global settings"} {entry.reason}</p></div>)}</CardContent></Card>
    <Dialog open={Boolean(detail)} onOpenChange={(isOpen) => { if (!isOpen) setDetail(null); }}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{selected?.code ?? "Coupon details"}</DialogTitle><DialogDescription>Settings and usage history</DialogDescription></DialogHeader>{selected && <div className="space-y-2 text-sm">
      <p>Scope: {selected.scope ?? "seller"} · {selected.sellerId ? storeName(selected.sellerId) : "Platform"}</p><p>Eligible stores: {selected.tenantIds?.length ? selected.tenantIds.map(storeName).join(", ") : "All within scope"}</p><p>Products: {selected.productIds?.length ? selected.productIds.map((id) => products.find((product) => product.id === id)?.name ?? id).join(", ") : "All eligible products"}</p>
      <p>Discount: {discount(selected)} · Status: {couponStatus(selected)}</p><p>Registered customers only: {selected.registeredOnly ? "Yes" : "No"}</p><p>Schedule: {selected.startsAt || "Any time"} → {selected.endsAt || "No expiry"}</p><p>Usage: {selected.usageCount} / {selected.usageLimit ?? "Unlimited"}</p><p>Total discount: {formatMoney(selected.totalDiscount ?? 0)}</p><p>Influenced revenue: {formatMoney(selected.influencedRevenue ?? 0)}</p><p>Created by: {selected.createdBy ?? "Unknown"} · {selected.createdAt ?? "Unknown"}</p>
      {data?.audits.filter((entry) => entry.couponId === selected.id).map((entry) => <p key={entry.id} className="border-t pt-2">{entry.actor} · {entry.action} · {entry.at} {entry.reason}</p>)}
    </div>}</DialogContent></Dialog>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? "Edit coupon" : "Add coupon"}</DialogTitle><DialogDescription>Choose seller or platform scope and eligibility.</DialogDescription></DialogHeader><form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); if (await run({ action: "save", id: editing?.id, values, scope, sellerId: owner, tenantIds, productIds })) setOpen(false); }}>
      <Label htmlFor="admin-code">Code</Label><Input id="admin-code" required value={values.code} onChange={(event) => setValues({ ...values, code: event.target.value.toUpperCase() })} />
      <select className={`${selectClass} w-full`} aria-label="Coupon scope" value={scope} onChange={(event) => { setScope(event.target.value as typeof scope); setProductIds([]); }}><option value="platform">Platform</option><option value="seller">Seller</option></select>
      {scope === "seller" ? <select className={`${selectClass} w-full`} aria-label="Coupon seller" required value={owner} onChange={(event) => { setOwner(event.target.value); setProductIds([]); }}><option value="">Select seller</option>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.shopName}</option>)}</select> : <div><Label htmlFor="eligible-stores">Eligible stores (none selected = all)</Label><select id="eligible-stores" multiple className="h-28 w-full rounded border bg-background p-2" value={tenantIds} onChange={(event) => { setTenantIds(Array.from(event.target.selectedOptions, (option) => option.value)); setProductIds([]); }}>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.shopName}</option>)}</select></div>}
      <div><Label htmlFor="eligible-products">Products (none selected = all eligible)</Label><select id="eligible-products" multiple className="h-28 w-full rounded border bg-background p-2" value={productIds} onChange={(event) => setProductIds(Array.from(event.target.selectedOptions, (option) => option.value))}>{products.filter((product) => scope === "seller" ? product.sellerId === owner : !tenantIds.length || tenantIds.includes(product.sellerId)).map((product) => <option key={product.id} value={product.id}>{product.name} · {product.sku}</option>)}</select></div>
      <select className={`${selectClass} w-full`} aria-label="Discount type" value={values.type} onChange={(event) => setValues({ ...values, type: event.target.value as CouponValues["type"] })}><option value="percentage">Percentage</option><option value="fixed">Fixed amount (GBP)</option><option value="free_shipping">Free shipping</option></select>
      {values.type !== "free_shipping" && <div><Label htmlFor="admin-value">Discount value</Label><Input id="admin-value" type="number" min="0.01" step="0.01" required value={values.value} onChange={(event) => setValues({ ...values, value: Number(event.target.value) })} /></div>}
      <div><Label htmlFor="admin-limit">Usage limit (blank = unlimited)</Label><Input id="admin-limit" type="number" min="1" value={values.usageLimit ?? ""} onChange={(event) => setValues({ ...values, usageLimit: event.target.value ? Number(event.target.value) : null })} /></div>
      <label className="flex gap-2 text-sm"><input type="checkbox" checked={values.registeredOnly} onChange={(event) => setValues({ ...values, registeredOnly: event.target.checked })} />Registered customers only</label><label className="flex gap-2 text-sm"><input type="checkbox" checked={values.enabled} onChange={(event) => setValues({ ...values, enabled: event.target.checked })} />Enabled</label>
      <div><Label htmlFor="admin-start">Start date</Label><Input id="admin-start" type="date" value={values.startsAt} onChange={(event) => setValues({ ...values, startsAt: event.target.value })} /></div><div><Label htmlFor="admin-end">End date</Label><Input id="admin-end" type="date" required value={values.endsAt} onChange={(event) => setValues({ ...values, endsAt: event.target.value })} /></div><Button disabled={mutation.isPending}>Save coupon</Button>
    </form></DialogContent></Dialog>
    <ConfirmDialog open={Boolean(confirm)} onOpenChange={(isOpen) => { if (!isOpen) setConfirm(null); }} title={`${confirm?.action ?? "Update"} coupon`} description="Provide a reason. Used coupons cannot be deleted; suspend them instead." requireReason destructive={confirm?.action !== "enable"} onConfirm={async (text) => { if (confirm) await run({ ...confirm, reason: text ?? "" }); }} />
  </div>;
}
