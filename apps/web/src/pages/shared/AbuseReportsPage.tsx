import { useState } from "react";
import { toast } from "sonner";
import { reportTargets, useAbuseReports, useSubmitAbuseReport, useReviewAbuseReport } from "@/lib/api/abuseReports";
import { getSession } from "@/lib/auth/store";
import { can } from "@/lib/permissions/can";
import { DataTable } from "@/components/patterns/DataTable";
import { PageHeader } from "@/components/patterns/PageHeader";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/formats";
import type { ReportStatus } from "@/types";

export function AbuseReportsPage({ reportId }: { reportId?: string }) {
  const user = getSession();
  const staff = user?.actorType === "staff";
  const query = useAbuseReports();
  const submit = useSubmitAbuseReport();
  const review = useReviewAbuseReport();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [selected, setSelected] = useState(reportId ?? "");
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [evidence, setEvidence] = useState("");
  const [decision, setDecision] = useState<ReportStatus>("investigating");
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState("");
  const targets = staff ? [] : reportTargets();
  const record = query.data?.find((item) => item.id === selected);
  const rows = (query.data ?? []).filter((item) => (!status || item.status === status) && `${item.reason} ${item.productName} ${item.reporterName}`.toLowerCase().includes(q.toLowerCase()));
  return <div className="space-y-6">
    <PageHeader title={staff ? "Abuse reports" : "My reports"} description={staff ? "Investigate marketplace reports. Only an explicitly shared outcome is visible to the reporter." : "Submit and track your own reports. Platform staff review and decide the outcome."} />
    {!staff && <Card><CardHeader><CardTitle>Submit a report</CardTitle></CardHeader><CardContent>
      <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); try { const created = await submit.mutateAsync({ target, reason, evidence }); setSelected(created.id); setReason(""); setEvidence(""); toast.success("Report submitted"); } catch { /* Global mutation handler displays errors. */ } }}>
        <Label htmlFor="report-target">Report subject</Label>
        <select id="report-target" required className="block h-10 w-full rounded-md border bg-background px-3" value={target} onChange={(event) => setTarget(event.target.value)}>
          <option value="">Choose a subject</option>{targets.map((item) => <option key={`${item.type}:${item.id}`} value={`${item.type}:${item.id}`}>{item.type}: {item.name}</option>)}
        </select>
        <Label htmlFor="report-reason">Reason</Label><Textarea id="report-reason" required minLength={5} maxLength={1000} value={reason} onChange={(event) => setReason(event.target.value)} />
        <Label htmlFor="report-evidence">Evidence / description</Label><Textarea id="report-evidence" maxLength={4000} value={evidence} onChange={(event) => setEvidence(event.target.value)} />
        <Button disabled={submit.isPending || !targets.length}>Submit report</Button>
      </form>
    </CardContent></Card>}
    <div className="flex flex-wrap gap-3"><Input className="max-w-sm" aria-label="Search reports" placeholder="Search reports…" value={q} onChange={(event) => setQ(event.target.value)} />
      <select aria-label="Report status" className="h-10 rounded-md border bg-background px-3" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option>{["open", "investigating", "resolved", "dismissed"].map((value) => <option key={value}>{value}</option>)}</select>
    </div>
    {query.isError ? <ErrorState title="Could not load reports" /> : <DataTable data={rows} isLoading={query.isLoading} exports={{ filename: "abuse-reports", title: "Abuse reports" }} columns={[
      { accessorKey: "productName", header: "Subject" },
      { id: "targetType", accessorFn: (item) => item.targetType ?? "product", header: "Type" },
      { accessorKey: "reason", header: "Reason" },
      ...(staff ? [{ accessorKey: "reporterName", header: "Reporter" }] : []),
      { accessorKey: "status", header: "Status" },
      { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
      { id: "actions", header: "Actions", cell: ({ row }) => <Button size="sm" variant="outline" onClick={() => { setSelected(row.original.id); setNote(""); setOutcome(""); setDecision("investigating"); }}>Details</Button> },
    ]} />}
    {selected && !query.isLoading && !record && <ErrorState title="Report not found or unavailable" />}
    {record && <Card><CardHeader><CardTitle>Report details</CardTitle></CardHeader><CardContent className="space-y-4">
      <p className="font-medium">{record.productName}: {record.reason}</p><p className="whitespace-pre-wrap text-sm">{record.evidence || "No evidence supplied."}</p>
      <p className="text-sm">Status: {record.status}</p><p className="text-sm">Shared outcome: {record.publicOutcome || "Awaiting review"}</p>
      {staff && <>
        {record.resolution && <p className="text-sm">Legacy internal resolution: {record.resolution}</p>}
        <DataTable data={record.history ?? []} columns={[{ accessorKey: "at", header: "When", cell: ({ row }) => formatDate(row.original.at) }, { accessorKey: "by", header: "Staff" }, { accessorKey: "status", header: "Status" }, { accessorKey: "internalNote", header: "Internal note" }]} />
        {can(user, "product_reports", "moderate") && !["resolved", "dismissed"].includes(record.status) && <form className="space-y-3" onSubmit={async (event) => { event.preventDefault(); try { await review.mutateAsync({ id: record.id, status: decision, internalNote: note, publicOutcome: outcome }); setNote(""); setOutcome(""); toast.success("Review recorded"); } catch { /* Global mutation handler displays errors. */ } }}>
          <Label htmlFor="report-decision">Decision</Label><select id="report-decision" className="block h-10 rounded-md border bg-background px-3" value={decision} onChange={(event) => setDecision(event.target.value as ReportStatus)}><option value="investigating">Investigating</option><option value="resolved">Resolved</option><option value="dismissed">Dismissed</option></select>
          <Label htmlFor="report-note">Internal staff note (private)</Label><Textarea id="report-note" required maxLength={4000} value={note} onChange={(event) => setNote(event.target.value)} />
          <Label htmlFor="report-outcome">Outcome shared with reporter</Label><Textarea id="report-outcome" required={decision !== "investigating"} maxLength={2000} value={outcome} onChange={(event) => setOutcome(event.target.value)} />
          <Button disabled={review.isPending}>Save review</Button>
        </form>}
        <p className="text-xs text-muted-foreground">Reviewing a report does not automatically block a product or suspend an account. Apply sanctions separately through the existing catalog/user controls after investigation.</p>
      </>}
    </CardContent></Card>}
  </div>;
}
