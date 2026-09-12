import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { ContentStatus, OrderStatus, TicketStatus } from "@/types";
import { cn } from "@/lib/utils";

type StatusVariant = NonNullable<BadgeProps["variant"]>;

type StatusEntry = { variant: StatusVariant; label: string };

const orderMap: Record<OrderStatus, StatusEntry> = {
  processing: { variant: "warning", label: "Processing" },
  shipping: { variant: "info", label: "Shipping" },
  delivered: { variant: "success", label: "Delivered" },
  canceled: { variant: "destructive", label: "Canceled" },
};

const ticketMap: Record<TicketStatus, StatusEntry> = {
  open: { variant: "info", label: "Open" },
  in_progress: { variant: "warning", label: "In progress" },
  waiting: { variant: "secondary", label: "Waiting" },
  resolved: { variant: "success", label: "Resolved" },
  closed: { variant: "secondary", label: "Closed" },
};

const contentMap: Record<ContentStatus, StatusEntry> = {
  draft: { variant: "secondary", label: "Draft" },
  published: { variant: "success", label: "Published" },
  archived: { variant: "secondary", label: "Archived" },
};

type StatusChipProps =
  | { kind: "order"; status: OrderStatus; className?: string }
  | { kind: "ticket"; status: TicketStatus; className?: string }
  | { kind: "content"; status: ContentStatus; className?: string };

export function StatusChip({ kind, status, className }: StatusChipProps) {
  const entry: StatusEntry =
    kind === "order"
      ? orderMap[status]
      : kind === "ticket"
        ? ticketMap[status]
        : contentMap[status];

  return (
    <Badge variant={entry.variant} className={cn(className)}>
      {entry.label}
    </Badge>
  );
}
