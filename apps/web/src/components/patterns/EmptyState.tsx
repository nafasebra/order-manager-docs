import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <h2 className="text-lg font-semibold">{title}</h2>
        {description ? (
          <p className="max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        ) : null}
        {action}
      </CardContent>
    </Card>
  );
}
