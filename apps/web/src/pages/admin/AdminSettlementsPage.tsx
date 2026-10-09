import { useState } from "react";
import { toast } from "sonner";
import { useSettlements, useSettlementMutation, DEMO_COMMISSION_RATE } from "@/lib/api/settlements";
import { getSession } from "@/lib/auth/store";
import { can } from "@/lib/permissions/can";
import { formatMoney, formatDate } from "@/lib/formats";
import { PageHeader } from "@/components/patterns/PageHeader";
import { DataTable } from "@/components/patterns/DataTable";
import { ConfirmDialog } from "@/components/patterns/ConfirmDialog";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type Command = { action: "create" | "approve" | "reject" | "pay"; sellerId?: string; id?: string };
export function AdminSettlementsPage() {
  const query = useSettlements();
  const mutation = useSettlementMutation();
  const canEdit = can(getSession(), "transactions", "edit");
  const [command, setCommand] = useState<Command | null>(null);
  const [reference, setReference] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const records = query.data?.records ?? [];
  const history = records.find((item) => item.id === selected)?.history ?? [];
  function choose(next: Command) { setReference(""); setCommand(next); }
  return (
    <div className="space-y-6">
      <PageHeader title="Seller settlements" description="Platform-collected payments and seller disbursements. Demo ledger only; no bank transfers are executed." />
      <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
        Sample commission: {DEMO_COMMISSION_RATE}%. Eligibility uses delivered orders and completed payments, minus refunds. Multi-store receipts are allocated proportionally by item value. Pending and approved settlements reserve funds. Legacy sample payout transactions are not reconciled; only settlements created here count as paid balances.
      </div>
      {query.isError ? <ErrorState title="Could not load settlements" /> : <>
        <h2 className="text-lg font-semibold">Seller balances</h2>
        <DataTable data={query.data?.balances ?? []} isLoading={query.isLoading} exports={{ filename: "seller-balances", title: "Seller balances" }} columns={[
          { accessorKey: "name", header: "Store" },
          { accessorKey: "status", header: "Account status" },
          ...(["gross", "commission", "paid", "reserved", "available"] as const).map((key) => ({ accessorKey: key, header: key[0].toUpperCase() + key.slice(1), cell: ({ row }: { row: { original: Record<typeof key, number> } }) => formatMoney(row.original[key]) })),
          { id: "actions", header: "Actions", cell: ({ row }) => canEdit ? <Button variant="outline" size="sm" disabled={row.original.available <= 0 || row.original.status !== "enabled"} onClick={() => choose({ action: "create", sellerId: row.original.id })}>Create settlement</Button> : "Read only" },
        ]} />
        <h2 className="text-lg font-semibold">Settlement records</h2>
        <DataTable data={records} isLoading={query.isLoading} exports={{ filename: "settlements", title: "Settlement records" }} columns={[
          { accessorKey: "id", header: "Settlement ID" },
          { accessorKey: "sellerId", header: "Seller ID" },
          { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatMoney(row.original.amount, row.original.currency) },
          { accessorKey: "commissionRate", header: "Commission %" },
          { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant="secondary">{row.original.status}</Badge> },
          { accessorKey: "createdAt", header: "Created", cell: ({ row }) => formatDate(row.original.createdAt) },
          { id: "actions", header: "Actions", cell: ({ row }) => <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setSelected(row.original.id)}>History</Button>
            {canEdit && row.original.status === "pending" && <Button size="sm" onClick={() => choose({ action: "approve", id: row.original.id })}>Approve</Button>}
            {canEdit && row.original.status === "approved" && <Button size="sm" onClick={() => choose({ action: "pay", id: row.original.id })}>Record payment</Button>}
            {canEdit && ["pending", "approved"].includes(row.original.status) && <Button variant="outline" size="sm" onClick={() => choose({ action: "reject", id: row.original.id })}>Reject</Button>}
          </div> },
        ]} />
        {selected && <section className="space-y-3">
          <h2 className="text-lg font-semibold">History: {selected}</h2>
          <DataTable data={history} columns={[
            { accessorKey: "at", header: "When", cell: ({ row }) => formatDate(row.original.at) },
            { accessorKey: "by", header: "Actor" }, { accessorKey: "action", header: "Action" },
            { accessorKey: "reason", header: "Reason" }, { accessorKey: "reference", header: "Payment reference" },
          ]} />
        </section>}
      </>}
      <ConfirmDialog open={Boolean(command)} onOpenChange={(open) => { if (!open) setCommand(null); }} title={`${command?.action ?? ""} settlement`} description="This action is recorded with your reason. Create reserves the full available balance; record payment only simulates a completed payout." requireReason destructive={command?.action === "reject"} onConfirm={async (reason) => {
        if (!command) return;
        const record = await mutation.mutateAsync({ ...command, reason: reason ?? "", reference });
        setSelected(record.id);
        toast.success("Settlement updated (mock)");
      }}>
        {command?.action === "pay" && <div className="space-y-2">
          <Label htmlFor="settlement-reference">Payment reference (required)</Label>
          <Input id="settlement-reference" value={reference} onChange={(event) => setReference(event.target.value)} />
        </div>}
      </ConfirmDialog>
    </div>
  );
}
