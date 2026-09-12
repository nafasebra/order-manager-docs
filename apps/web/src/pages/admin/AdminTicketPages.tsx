import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { PageHeader } from "@/components/patterns/PageHeader";
import { FilterBar } from "@/components/patterns/FilterBar";
import { DataTable } from "@/components/patterns/DataTable";
import { ListPagination } from "@/components/patterns/ListPagination";
import { StatusChip } from "@/components/patterns/StatusChip";
import { VirtualList } from "@/components/patterns/VirtualList";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMockMutation, useTicket, useTickets } from "@/lib/api/resources";
import { formatDate } from "@/lib/formats";
import type { ListParams, Ticket, TicketStatus } from "@/types";

const columns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "ticketNumber",
    header: "Ticket",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.ticketNumber}</span>
    ),
  },
  { accessorKey: "subject", header: "Subject" },
  { accessorKey: "requesterName", header: "Requester" },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.channel}</Badge>
    ),
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.priority}</Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusChip kind="ticket" status={row.original.status} />
    ),
  },
];

type ListProps = {
  search: ListParams;
  onSearchChange: (next: Partial<ListParams>) => void;
};

export function AdminTicketsListPage({ search, onSearchChange }: ListProps) {
  const navigate = useNavigate();
  const [q, setQ] = useState(String(search.q ?? ""));
  const debouncedQ = useDebouncedValue(q);
  const query = useTickets({ ...search, q: debouncedQ || undefined });

  return (
    <div>
      <PageHeader
        title="Tickets"
        description="Site and buyer–seller support queue."
      />
      <FilterBar search={q} onSearchChange={setQ} searchPlaceholder="Search tickets…">
        <Select
          value={String(search.status ?? "all")}
          onValueChange={(v) =>
            onSearchChange({ status: v === "all" ? undefined : v, page: 1 })
          }
        >
          <SelectTrigger className="w-[160px]" aria-label="Status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>
      <DataTable
        columns={columns}
        data={query.data?.items ?? []}
        isLoading={query.isLoading}
        dense
        onRowClick={(row) =>
          void navigate({
            to: "/admin/support/tickets/$ticketId",
            params: { ticketId: row.id },
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

export function AdminTicketDetailPage({ ticketId }: { ticketId: string }) {
  const { data, isLoading, isError } = useTicket(ticketId);
  const mutate = useMockMutation("tickets");
  const [reply, setReply] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");

  if (isLoading) return <Skeleton className="h-96 w-full" />;
  if (isError || !data) return <ErrorState title="Ticket not found" />;

  const currentStatus = status || data.status;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${data.ticketNumber} · ${data.subject}`}
        description={`Requester ${data.requesterName}`}
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thread</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <VirtualList
              items={data.messages}
              estimateSize={88}
              height={360}
              getKey={(m) => m.id}
              renderItem={(msg) => (
                <div className="border-b border-border px-1 py-3">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {msg.authorName}
                      {msg.internal ? (
                        <Badge variant="outline" className="ml-2">
                          Internal
                        </Badge>
                      ) : null}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.body}</p>
                </div>
              )}
            />
            <div className="space-y-2">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Reply…"
                rows={3}
                disabled={data.status === "closed"}
              />
              <Button
                type="button"
                disabled={!reply.trim() || data.status === "closed"}
                onClick={async () => {
                  await mutate.mutateAsync({
                    id: data.id,
                    action: "reply",
                    body: reply,
                  });
                  setReply("");
                  toast.success("Reply sent (mock)");
                }}
              >
                Send
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-xs uppercase text-muted-foreground">Status</p>
              <Select
                value={currentStatus}
                onValueChange={async (v) => {
                  setStatus(v as TicketStatus);
                  await mutate.mutateAsync({
                    id: data.id,
                    action: "status",
                    status: v,
                  });
                  toast.success("Status updated (mock)");
                }}
              >
                <SelectTrigger aria-label="Ticket status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In progress</SelectItem>
                  <SelectItem value="waiting">Waiting</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Priority</p>
              <p className="capitalize">{data.priority}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Assignee</p>
              <p>{data.assigneeName ?? "Unassigned"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Channel</p>
              <p>{data.channel}</p>
            </div>
            {data.relatedOrderId ? (
              <div>
                <p className="text-xs uppercase text-muted-foreground">
                  Related order
                </p>
                <Link
                  to="/admin/orders/$orderId"
                  params={{ orderId: data.relatedOrderId }}
                  className="text-primary hover:underline"
                >
                  View order
                </Link>
              </div>
            ) : null}
            {data.sellerName ? (
              <div>
                <p className="text-xs uppercase text-muted-foreground">Seller</p>
                <p>{data.sellerName}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
