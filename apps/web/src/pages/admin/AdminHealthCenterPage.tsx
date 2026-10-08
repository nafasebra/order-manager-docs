import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Activity, RefreshCw, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { buildHealthSnapshot, defaultHealthSettings, healthServices, type HealthIssue, type HealthSettings } from "@/mocks/healthCenter";
import { sellers } from "@/mocks/fixtures";
import { useAdminCoupons, couponFlags } from "@/lib/api/sellerCoupons";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable } from "@/components/patterns/DataTable";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const settingsKey = "clean-commerce:health-settings";
function readSettings(): HealthSettings {
  try {
    const value = JSON.parse(localStorage.getItem(settingsKey) ?? "null");
    if (Number.isSafeInteger(value?.lowStock) && value.lowStock >= 0 && value.lowStock <= 10000 &&
        Number.isSafeInteger(value?.staleDays) && value.staleDays >= 1 && value.staleDays <= 365) return value;
  } catch { /* Use defaults when saved preferences are unavailable. */ }
  return defaultHealthSettings;
}
const selectClass = "h-10 rounded-md border bg-background px-3 text-sm";
function HealthBadge({ status }: { status: string }) {
  return <Badge variant={status === "Critical" || status === "critical" ? "destructive" : "secondary"}>{status}</Badge>;
}

export function AdminHealthCenterPage() {
  const [settings, setSettings] = useState(readSettings);
  const [draft, setDraft] = useState(settings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selected, setSelected] = useState<HealthIssue | null>(null);
  const [search, setSearch] = useState("");
  const [tenant, setTenant] = useState("");
  const [severity, setSeverity] = useState("");
  const [area, setArea] = useState("");
  const health = useQuery({
    queryKey: ["admin-health-center", settings],
    queryFn: () => buildHealthSnapshot(settings),
  });
  const coupons = useAdminCoupons();
  const snapshot = health.data;
  const couponIssues: HealthIssue[] = (coupons.data?.coupons ?? []).flatMap((coupon) => {
    const flags = couponFlags(coupon);
    if (!flags.length || !coupon.enabled) return [];
    return [{
      id: `coupon-${coupon.id}`, severity: "warning" as const, area: "Promotions",
      tenantId: coupon.sellerId ?? "", store: sellers.find((seller) => seller.id === coupon.sellerId)?.shopName ?? "Platform",
      title: `${coupon.code}: coupon requires review`, detail: flags.join(", "),
      recommendation: "Review the coupon settings and usage. Suspend the coupon if the promotion violates platform policy.",
      detectedAt: snapshot?.checkedAt ?? new Date().toISOString(), target: "/admin/coupons" as const,
    }];
  });
  const issues = [...(snapshot?.issues ?? []), ...couponIssues];
  const critical = issues.filter((issue) => issue.severity === "critical").length;
  const warnings = issues.length - critical;
  const rows = issues.filter((issue) =>
    (!tenant || issue.tenantId === tenant) && (!severity || issue.severity === severity) &&
    (!area || issue.area === area) && `${issue.title} ${issue.store} ${issue.detail}`.toLowerCase().includes(search.trim().toLowerCase()));
  const stores = (snapshot?.stores ?? []).map((store) => {
    const storeIssues = issues.filter((issue) => issue.tenantId === store.id);
    const storeCritical = storeIssues.filter((issue) => issue.severity === "critical").length;
    return { ...store, critical: storeCritical, warnings: storeIssues.length - storeCritical,
      status: store.status === "Disabled" ? "Disabled" : storeCritical ? "Critical" : storeIssues.length ? "Needs attention" : "Healthy" };
  });
  const refreshing = health.isFetching || coupons.isFetching;

  return <div className="space-y-6">
    <PageHeader title="Health Center" description="Review marketplace issues, store readiness, and service status."
      actions={<>
        <Button variant="outline" onClick={() => { setDraft(settings); setSettingsOpen(true); }}><Settings2 className="mr-2 h-4 w-4" />Alert settings</Button>
        <Button variant="outline" disabled={refreshing} onClick={() => { void health.refetch(); void coupons.refetch(); }}>
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh checks
        </Button>
      </>} />
    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Badge variant="outline">Demo monitoring</Badge>
      <span>Checks use current dashboard records. Service metrics are examples.</span>
      {snapshot && <span>Last checked: {new Date(snapshot.checkedAt).toLocaleString()}</span>}
    </div>
    {(health.isError || coupons.isError) && <ErrorState title="Some health checks could not load" description="Refresh checks to try again. Available results are shown below." />}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[
        ["Platform status", health.isError || coupons.isError ? "Checks incomplete" : health.isLoading || coupons.isLoading ? "Checking…" : critical ? "Critical issues" : warnings || healthServices.some((service) => service.status === "Degraded") ? "Needs attention" : "Healthy"],
        ["Critical issues", critical], ["Warnings", warnings],
        ["Stores needing attention", stores.filter((store) => store.status === "Critical" || store.status === "Needs attention").length],
      ].map(([label, value]) => <Card key={String(label)}><CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 text-2xl font-semibold">{health.isLoading ? "…" : value}</p>
      </CardContent></Card>)}
    </div>
    <section className="space-y-3" aria-label="Service monitors">
      <h2 className="text-lg font-semibold">Services & integrations</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {healthServices.map((service) => <Card key={service.name}>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{service.name}</CardTitle><HealthBadge status={service.status} />
          </CardHeader>
          <CardContent><p className="font-semibold">{service.metric}</p><p className="mt-1 text-xs text-muted-foreground">{service.detail}</p></CardContent>
        </Card>)}
      </div>
    </section>
    <section className="space-y-3" aria-label="Health issues">
      <h2 className="text-lg font-semibold">Issues <span className="text-sm font-normal text-muted-foreground">({rows.length} of {issues.length})</span></h2>
      <div className="flex flex-wrap gap-2">
        <Input className="w-64" aria-label="Search health issues" placeholder="Search issues or store…" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className={selectClass} aria-label="Filter by store" value={tenant} onChange={(event) => setTenant(event.target.value)}>
          <option value="">All stores</option>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.shopName}</option>)}
        </select>
        <select className={selectClass} aria-label="Filter by severity" value={severity} onChange={(event) => setSeverity(event.target.value)}>
          <option value="">All severities</option><option value="critical">Critical</option><option value="warning">Warning</option>
        </select>
        <select className={selectClass} aria-label="Filter by area" value={area} onChange={(event) => setArea(event.target.value)}>
          <option value="">All areas</option>{Array.from(new Set(issues.map((issue) => issue.area))).sort().map((name) => <option key={name}>{name}</option>)}
        </select>
        <Button variant="ghost" onClick={() => { setSearch(""); setTenant(""); setSeverity(""); setArea(""); }}>Clear filters</Button>
      </div>
      <DataTable<HealthIssue> data={rows} isLoading={health.isLoading || coupons.isLoading} dense emptyMessage="No issues match the current checks and filters."
        columns={[
          { accessorKey: "severity", header: "Severity", cell: ({ row }) => <HealthBadge status={row.original.severity} /> },
          { accessorKey: "area", header: "Area" }, { accessorKey: "store", header: "Store" },
          { accessorKey: "title", header: "Issue" },
          { accessorKey: "detectedAt", header: "Checked", cell: ({ row }) => new Date(row.original.detectedAt).toLocaleString() },
          { id: "actions", header: "Actions", enableSorting: false, cell: ({ row }) => <Button variant="ghost" size="sm" onClick={() => setSelected(row.original)}>Investigate</Button> },
        ]} />
    </section>
    <section className="space-y-3" aria-label="Store health">
      <h2 className="text-lg font-semibold">Store health</h2>
      <DataTable data={stores.filter((store) => !tenant || store.id === tenant)} isLoading={health.isLoading} dense columns={[
        { accessorKey: "name", header: "Store" },
        { accessorKey: "status", header: "Status", cell: ({ row }) => <HealthBadge status={row.original.status} /> },
        { accessorKey: "products", header: "Products" }, { accessorKey: "critical", header: "Critical" }, { accessorKey: "warnings", header: "Warnings" },
        { id: "actions", header: "Actions", enableSorting: false, cell: ({ row }) => <Button asChild variant="ghost" size="sm"><Link to="/admin/sellers/$sellerId" params={{ sellerId: row.original.id }}>View store</Link></Button> },
      ]} />
    </section>
    <Dialog open={Boolean(selected)} onOpenChange={(open) => { if (!open) setSelected(null); }}>
      <DialogContent><DialogHeader><DialogTitle>{selected?.title}</DialogTitle><DialogDescription>{selected?.store} · {selected?.area}</DialogDescription></DialogHeader>
        {selected && <div className="space-y-4"><HealthBadge status={selected.severity} /><p className="text-sm">{selected.detail}</p>
          <div className="rounded-md bg-muted p-3"><h3 className="mb-1 text-sm font-semibold">Recommended action</h3><p className="text-sm">{selected.recommendation}</p></div>
          <Button asChild><Link to={selected.target}>Open {selected.area === "Store configuration" ? "stores" : selected.target.split("/").at(-1)}</Link></Button>
        </div>}
      </DialogContent>
    </Dialog>
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent><DialogHeader><DialogTitle>Alert settings</DialogTitle><DialogDescription>Set thresholds for inventory checks. Preferences are saved in this browser.</DialogDescription></DialogHeader>
        <form className="space-y-4" onSubmit={(event) => {
          event.preventDefault();
          if (!Number.isSafeInteger(draft.lowStock) || draft.lowStock < 0 || draft.lowStock > 10000 || !Number.isSafeInteger(draft.staleDays) || draft.staleDays < 1 || draft.staleDays > 365) {
            toast.error("Enter valid whole-number thresholds."); return;
          }
          try { localStorage.setItem(settingsKey, JSON.stringify(draft)); } catch { toast.error("Preferences could not be saved in this browser."); return; }
          setSettings(draft); setSettingsOpen(false); toast.success("Health alert settings saved");
        }}>
          <div className="space-y-2"><Label htmlFor="health-low-stock">Low stock threshold (units)</Label><Input id="health-low-stock" type="number" min={0} max={10000} step={1} required value={draft.lowStock} onChange={(event) => setDraft({ ...draft, lowStock: Number(event.target.value) })} /></div>
          <div className="space-y-2"><Label htmlFor="health-stale-days">Product review interval (days)</Label><Input id="health-stale-days" type="number" min={1} max={365} step={1} required value={draft.staleDays} onChange={(event) => setDraft({ ...draft, staleDays: Number(event.target.value) })} /></div>
          <p className="text-xs text-muted-foreground">Products that have not been updated within this interval are flagged for review.</p>
          <div className="flex justify-between"><Button type="button" variant="outline" onClick={() => setDraft(defaultHealthSettings)}>Restore defaults</Button><Button type="submit"><Activity className="mr-2 h-4 w-4" />Save settings</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </div>;
}
