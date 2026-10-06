import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { getSession } from "@/router";
import { campaigns, sellers } from "@/mocks/fixtures";
import { useCampaign, useCampaigns } from "@/lib/api/resources";
import { useCampaignManagement, type CampaignValues } from "@/lib/api/campaignManagement";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable } from "@/components/patterns/DataTable";
import { actionsColumn } from "@/components/patterns/DataTableRowActions";
import { ListPagination } from "@/components/patterns/ListPagination";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { formatMoney, formatDate } from "@/lib/formats";
import type { Campaign, ListParams } from "@/types";

const selectClass = "h-10 rounded border bg-background px-2 text-sm";
const dateInput = (date: string) => date.slice(0, 16);
function CampaignEditor({ campaign, onSaved }: { campaign?: Campaign; onSaved: () => void }) {
  const [values, setValues] = useState<CampaignValues>({ name: campaign?.name ?? "", code: campaign?.code ?? "", discountType: campaign?.discountType ?? "percent", discountValue: campaign?.discountValue ?? 10, startsAt: campaign ? dateInput(campaign.startsAt) : "", endsAt: campaign ? dateInput(campaign.endsAt) : "", tenantIds: campaign?.tenantIds ?? [], channel: campaign?.channel ?? "storefront", budget: campaign?.budget ?? 0, usageLimit: campaign?.usageLimit ?? 100, description: campaign?.description ?? "" });
  const mutation = useCampaignManagement(getSession()?.displayName ?? "Admin preview");
  return <form className="space-y-4" onSubmit={async (event) => { event.preventDefault(); try { await mutation.mutateAsync({ action: "save", id: campaign?.id, values: { ...values, startsAt: `${values.startsAt}:00Z`, endsAt: `${values.endsAt}:00Z` } }); toast.success("Campaign saved"); onSaved(); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not save campaign"); } }}>
    {(["name", "code"] as const).map((key) => <div key={key}><Label htmlFor={`campaign-${key}`}>{key === "name" ? "Campaign name" : "Promotion code"}</Label><Input id={`campaign-${key}`} required value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} /></div>)}
    <div><Label htmlFor="campaign-description">Description</Label><Textarea id="campaign-description" value={values.description} onChange={(event) => setValues({ ...values, description: event.target.value })} /></div>
    <div><Label htmlFor="campaign-tenants">Participating stores (none selected = all stores)</Label><select id="campaign-tenants" multiple className="h-32 w-full rounded border bg-background p-2" value={values.tenantIds} onChange={(event) => setValues({ ...values, tenantIds: Array.from(event.target.selectedOptions, (option) => option.value) })}>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.shopName}</option>)}</select></div>
    <div className="grid gap-3 sm:grid-cols-2"><div><Label htmlFor="campaign-channel">Channel</Label><select id="campaign-channel" className={`${selectClass} w-full`} value={values.channel} onChange={(event) => setValues({ ...values, channel: event.target.value as CampaignValues["channel"] })}><option value="storefront">Storefront</option><option value="email">Email</option><option value="social">Social</option></select></div><div><Label htmlFor="campaign-type">Discount type</Label><select id="campaign-type" className={`${selectClass} w-full`} value={values.discountType} onChange={(event) => setValues({ ...values, discountType: event.target.value as CampaignValues["discountType"] })}><option value="percent">Percentage</option><option value="fixed">Fixed amount (GBP)</option></select></div></div>
    <div className="grid gap-3 sm:grid-cols-2">{([['discountValue', 'Discount value'], ['budget', 'Budget (GBP)'], ['usageLimit', 'Redemption limit']] as const).map(([key, label]) => <div key={key}><Label htmlFor={`campaign-${key}`}>{label}</Label><Input id={`campaign-${key}`} type="number" required min={key === "budget" ? 0 : key === "usageLimit" ? 1 : 0.01} step={key === "usageLimit" ? 1 : 0.01} value={values[key]} onChange={(event) => setValues({ ...values, [key]: Number(event.target.value) })} /></div>)}</div>
    <div className="grid gap-3 sm:grid-cols-2">{([['startsAt', 'Start (UTC)'], ['endsAt', 'End (UTC)']] as const).map(([key, label]) => <div key={key}><Label htmlFor={`campaign-${key}`}>{label}</Label><Input id={`campaign-${key}`} type="datetime-local" required value={values[key]} onChange={(event) => setValues({ ...values, [key]: event.target.value })} /></div>)}</div>
    <p className="text-xs text-muted-foreground">Maximum percentage discount: 70%. Maximum campaign duration: 90 days. New campaigns start as drafts.</p>
    <Button disabled={mutation.isPending}>Save campaign</Button>
  </form>;
}

export function AdminMarketingListPage({ search, onSearchChange }: { search: ListParams; onSearchChange: (next: Partial<ListParams>) => void }) {
  const navigate = useNavigate();
  const query = useCampaigns(search);
  const [deleting, setDeleting] = useState<Campaign | null>(null);
  const mutation = useCampaignManagement(getSession()?.displayName ?? "Admin preview");
  const summaries = [ ["Campaigns", String(campaigns.length)], ["Redemptions", String(campaigns.reduce((sum, campaign) => sum + campaign.usageCount, 0))], ["Attributed revenue", formatMoney(campaigns.reduce((sum, campaign) => sum + campaign.revenueAttributed, 0))] ];
  return <div className="space-y-4">
    <PageHeader title="Campaigns" description="Coordinate promotions across marketplace stores and channels." actions={<Button asChild><Link to="/admin/marketing/new">Create campaign</Link></Button>} />
    <div className="grid gap-3 sm:grid-cols-3">{summaries.map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-semibold">{value}</p></CardContent></Card>)}</div>
    <div className="flex flex-wrap gap-2"><Input className="w-56" aria-label="Search campaigns" placeholder="Search name or code…" value={String(search.q ?? "")} onChange={(event) => onSearchChange({ q: event.target.value, page: 1 })} />
      <select className={selectClass} aria-label="Campaign status" value={String(search.status ?? "")} onChange={(event) => onSearchChange({ status: event.target.value || undefined, page: 1 })}><option value="">All statuses</option>{["draft", "scheduled", "active", "paused", "ended"].map((status) => <option key={status}>{status}</option>)}</select>
      <select className={selectClass} aria-label="Campaign store" value={String(search.tenant ?? "")} onChange={(event) => onSearchChange({ tenant: event.target.value || undefined, page: 1 })}><option value="">All stores</option>{sellers.map((seller) => <option key={seller.id} value={seller.id}>{seller.shopName}</option>)}</select>
      <select className={selectClass} aria-label="Campaign channel" value={String(search.channel ?? "")} onChange={(event) => onSearchChange({ channel: event.target.value || undefined, page: 1 })}><option value="">All channels</option><option value="storefront">Storefront</option><option value="email">Email</option><option value="social">Social</option></select>
    </div>
    {query.isError ? <ErrorState title="Could not load campaigns" /> : <DataTable<Campaign> data={query.data?.items ?? []} dense isLoading={query.isLoading} columns={[
      { accessorKey: "name", header: "Campaign" }, { accessorKey: "code", header: "Code" }, { accessorKey: "status", header: "Status" }, { accessorKey: "channel", header: "Channel", cell: ({ row }) => row.original.channel ?? "storefront" },
      { accessorKey: "discountValue", header: "Discount", cell: ({ row }) => row.original.discountType === "percent" ? `${row.original.discountValue}%` : formatMoney(row.original.discountValue) },
      { id: "storeCount", accessorFn: (campaign) => campaign.tenantIds?.length || sellers.length, header: "Stores", cell: ({ row }) => row.original.tenantIds?.length || "All" }, { accessorKey: "usageCount", header: "Redemptions" }, { accessorKey: "revenueAttributed", header: "Revenue", cell: ({ row }) => formatMoney(row.original.revenueAttributed) }, { accessorKey: "endsAt", header: "Ends", cell: ({ row }) => formatDate(row.original.endsAt) },
      actionsColumn((campaign) => [{ label: "Manage campaign", onSelect: () => { void navigate({ to: "/admin/marketing/$campaignId", params: { campaignId: campaign.id } }); } }, { label: "Delete", destructive: true, onSelect: () => setDeleting(campaign) }]),
    ]} />}
    <ListPagination page={Number(search.page ?? 1)} pageSize={Number(search.pageSize ?? 25)} total={query.data?.total ?? 0} onPageChange={(page) => onSearchChange({ page })} />
    <ConfirmDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open) setDeleting(null); }} title="Delete campaign" description="Campaigns with redemptions cannot be deleted. End them to preserve reporting." destructive onConfirm={async () => { if (deleting) { try { await mutation.mutateAsync({ action: "delete", id: deleting.id }); toast.success("Campaign deleted"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete campaign"); } } }} />
  </div>;
}

export function AdminCampaignCreatePage() {
  const navigate = useNavigate();
  return <div className="mx-auto max-w-2xl space-y-4"><Button variant="outline" asChild><Link to="/admin/marketing">Back to campaigns</Link></Button><PageHeader title="Create campaign" description="Plan a marketplace promotion." /><CampaignEditor onSaved={() => { void navigate({ to: "/admin/marketing" }); }} /></div>;
}

export function AdminCampaignDetailPage({ campaignId }: { campaignId: string }) {
  const query = useCampaign(campaignId);
  const mutation = useCampaignManagement(getSession()?.displayName ?? "Admin preview");
  const [editing, setEditing] = useState(false);
  const [nextStatus, setNextStatus] = useState<Campaign["status"] | null>(null);
  if (query.isLoading) return <Skeleton className="h-80 w-full" />;
  if (!query.data || query.isError) return <ErrorState title="Campaign not found" />;
  const campaign = query.data;
  return <div className="space-y-4"><Button variant="outline" asChild><Link to="/admin/marketing">Back to campaigns</Link></Button>
    <PageHeader title={campaign.name} description={`${campaign.code} · ${campaign.status}`} actions={<Button onClick={() => setEditing(true)}>Edit campaign</Button>} />
    <div className="flex flex-wrap gap-2">{(["scheduled", "active", "paused", "ended"] as const).map((status) => <Button key={status} variant="outline" disabled={status === campaign.status} onClick={() => setNextStatus(status)}>{status === "active" ? "Activate / Resume" : status === "scheduled" ? "Schedule" : status === "paused" ? "Pause" : "End"}</Button>)}</div>
    <Card><CardContent className="space-y-2 p-4 text-sm"><p>{campaign.description || "No description"}</p><p>Stores: {campaign.tenantIds?.length ? campaign.tenantIds.map((id) => sellers.find((seller) => seller.id === id)?.shopName ?? id).join(", ") : "All stores"}</p><p>Channel: {campaign.channel ?? "storefront"}</p><p>Schedule: {formatDate(campaign.startsAt)} – {formatDate(campaign.endsAt)}</p><p>Discount: {campaign.discountType === "percent" ? `${campaign.discountValue}%` : formatMoney(campaign.discountValue)}</p><p>Redemptions: {campaign.usageCount} / {campaign.usageLimit ?? "Unlimited"}</p><p>Attributed revenue: {formatMoney(campaign.revenueAttributed)}</p><p>Budget: {formatMoney(campaign.budget ?? 0)}</p><p>Created by: {campaign.createdBy ?? "Template admin"}</p></CardContent></Card>
    <p className="text-xs text-muted-foreground">Performance uses demo attribution data. Delivery through email/social channels and checkout discount application require integrations.</p>
    <Card><CardContent className="space-y-2 p-4"><h2 className="font-semibold">Activity</h2>{campaign.history?.length ? campaign.history.map((entry, index) => <p className="text-sm" key={index}>{entry.action} · {entry.actor} · {formatDate(entry.at)}</p>) : <p className="text-sm text-muted-foreground">New campaign changes will appear here.</p>}</CardContent></Card>
    <Dialog open={editing} onOpenChange={setEditing}><DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto"><DialogHeader><DialogTitle>Edit campaign</DialogTitle><DialogDescription>Update schedule, targeting, and promotion rules.</DialogDescription></DialogHeader><CampaignEditor campaign={campaign} onSaved={() => setEditing(false)} /></DialogContent></Dialog>
    <ConfirmDialog open={Boolean(nextStatus)} onOpenChange={(open) => { if (!open) setNextStatus(null); }} title={`Set campaign ${nextStatus ?? "status"}`} onConfirm={async () => { if (nextStatus) { try { await mutation.mutateAsync({ action: "status", id: campaign.id, status: nextStatus }); toast.success("Campaign status updated"); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not change status"); } } }} />
  </div>;
}
