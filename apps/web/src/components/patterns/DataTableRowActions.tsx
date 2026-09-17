import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DataTableAction = {
  label: string;
  icon?: LucideIcon;
  onSelect: () => void;
  destructive?: boolean;
};

type DataTableRowActionsProps = {
  actions: DataTableAction[];
};

export function DataTableRowActions({ actions }: DataTableRowActionsProps) {
  if (!actions.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Open row actions"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        {actions.map((action) => (
          <DropdownMenuItem
            key={action.label}
            className={
              action.destructive
                ? "text-destructive focus:text-destructive"
                : undefined
            }
            onSelect={(e) => {
              e.stopPropagation();
              action.onSelect();
            }}
          >
            {action.icon ? <action.icon /> : null}
            {action.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function copyIdAction(id: string): DataTableAction {
  return {
    label: "Copy ID",
    onSelect: () => {
      void navigator.clipboard.writeText(id);
      toast.success("ID copied");
    },
  };
}

export function actionsColumn<TData>(
  getActions: (row: TData) => DataTableAction[],
): ColumnDef<TData, unknown> {
  return {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    enableSorting: false,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DataTableRowActions actions={getActions(row.original)} />
      </div>
    ),
  };
}
