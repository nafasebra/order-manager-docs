import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable } from "@/components/patterns/DataTable";
import { actionsColumn, copyIdAction } from "@/components/patterns/DataTableRowActions";
import { ListPagination } from "@/components/patterns/ListPagination";
import { StatusChip } from "@/components/patterns/StatusChip";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSellerTicket, useSellerTickets, useSellerTicketMutation } from "@/lib/api/resources";
import { formatDate } from "@/lib/formats";
import { getSession } from "@/router";
import type { ListParams, Ticket, TicketStatus } from "@/types";

const statuses: TicketStatus[] = ["open", "in_progress", "waiting", "resolved", "closed"];
const statusLabel = (status: string) => status.replace(/_/g, " ");
const columns: ColumnDef<Ticket>[] = [
  { accessorKey: "ticketNumber", header: "Ticket" },
  { accessorKey: "subject", header: "Subject" },
  { accessorKey: "requesterName", header: "Buyer" },
  { accessorKey: "priority", header: "Priority" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <StatusChip kind="ticket" status={row.original.status} /> },
  { accessorKey: "updatedAt", header: "Updated", cell: ({ row }) => formatDate(row.original.updatedAt) },
];

export function SellerTicketsListPage({ search, onSearchChange }: { search: ListParams; onSearchChange: (next: Partial<ListParams>) => void }) {
  const navigate = useNavigate();
  const sellerId = getSession()?.sellerId ?? "";
  const query = useSellerTickets(sellerId, search);
  const openTicket = (ticket: Ticket) => void navigate({ to: "/seller/tickets/$ticketId", params: { ticketId: ticket.id } });
  return (
    <div className="space-y-4">
      <PageHeader title="Tickets" description="Buyer support conversations for your shop." />
      <FilterBar search={String(search.q ?? "")} onSearchChange={(q) => onSearchChange({ q: q || undefined, page: 1 })} searchPlaceholder="Search ticket, subject, or buyer…">
        <Select value={String(search.status ?? "all")} onValueChange={(status) => onSearchChange({ status: status === "all" ? undefined : status, page: 1 })}>
          <SelectTrigger className="w-[160px]" aria-label="Filter ticket status"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="all">All statuses</SelectItem>{statuses.map((status) => <SelectItem key={status} value={status}>{statusLabel(status)}</SelectItem>)}</SelectContent>
        </Select>
      </FilterBar>
      {query.isError ? <ErrorState title="Could not load tickets" /> : <>
        <DataTable columns={[...columns, actionsColumn<Ticket>((ticket) => [{ label: "View details", onSelect: () => openTicket(ticket) }, copyIdAction(ticket.id)])]} data={query.data?.items ?? []} isLoading={query.isLoading} dense onRowClick={openTicket} />
        <ListPagination page={Number(search.page ?? 1)} pageSize={Number(search.pageSize ?? 25)} total={query.data?.total ?? 0} onPageChange={(page) => onSearchChange({ page })} />
      </>}
    </div>
  );
}

export function SellerTicketDetailPage({ ticketId }: { ticketId: string }) {
  const session = getSession();
  const sellerId = session?.sellerId ?? "";
  const query = useSellerTicket(sellerId, ticketId);
  const mutate = useSellerTicketMutation(sellerId, session?.displayName ?? "Shop support");
  const [reply, setReply] = useState("");
  if (query.isLoading) return <Skeleton className="h-96 w-full" />;
  if (query.isError || !query.data) return <ErrorState title="Ticket not found" description="This ticket is not available for your shop." />;
  const ticket = query.data;
  const showError = (error: unknown) => toast.error(error instanceof Error ? error.message : "Could not update ticket");
  return (
    <div className="space-y-4">
      <Button variant="outline" asChild><Link to="/seller/tickets">Back to tickets</Link></Button>
      <PageHeader title={ticket.subject} description={ticket.ticketNumber} actions={<StatusChip kind="ticket" status={ticket.status} />} />
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader><CardTitle className="text-base">Thread</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="max-h-[440px] space-y-3 overflow-y-auto" role="log" aria-label="Ticket messages">
              {ticket.messages.map((message) => <div key={message.id} className="border-b border-border py-3">
                <div className="mb-1 flex items-center justify-between gap-2"><p className="text-sm font-medium">{message.authorName}</p><span className="text-xs text-muted-foreground">{formatDate(message.createdAt)}</span></div>
                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{message.body}</p>
              </div>)}
            </div>
            <form className="space-y-2" onSubmit={async (event) => {
              event.preventDefault();
              try { await mutate.mutateAsync({ id: ticket.id, action: "reply", body: reply }); setReply(""); toast.success("Reply sent"); } catch (error) { showError(error); }
            }}>
              <Label htmlFor="seller-reply">Reply to buyer</Label>
              <Textarea id="seller-reply" value={reply} onChange={(event) => setReply(event.target.value)} rows={3} disabled={ticket.status === "closed" || mutate.isPending} placeholder={ticket.status === "closed" ? "This ticket is closed" : "Write a reply…"} />
              <Button type="submit" disabled={!reply.trim() || ticket.status === "closed" || mutate.isPending}>Send reply</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2"><Label>Status</Label>
              <Select value={ticket.status} disabled={mutate.isPending} onValueChange={async (status) => {
                try { await mutate.mutateAsync({ id: ticket.id, action: "status", status: status as TicketStatus }); toast.success("Status updated"); } catch (error) { showError(error); }
              }}><SelectTrigger aria-label="Ticket status"><SelectValue /></SelectTrigger><SelectContent>{statuses.map((status) => <SelectItem key={status} value={status}>{statusLabel(status)}</SelectItem>)}</SelectContent></Select>
            </div>
            <div><p className="text-muted-foreground">Buyer</p><p>{ticket.requesterName}</p></div>
            <div><p className="text-muted-foreground">Priority</p><p className="capitalize">{ticket.priority}</p></div>
            <div><p className="text-muted-foreground">Created</p><p>{formatDate(ticket.createdAt)}</p></div>
            <div><p className="text-muted-foreground">Updated</p><p>{formatDate(ticket.updatedAt)}</p></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
