import type { ReactNode } from "react";
import { Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

type SnapshotBlockProps = {
  title: string;
  children: ReactNode;
  className?: string;
};

export function SnapshotBlock({
  title,
  children,
  className,
}: SnapshotBlockProps) {
  return (
    <Alert className={cn("bg-muted/50", className)}>
      <Lock className="h-4 w-4" aria-hidden />
      <AlertTitle className="flex items-center gap-2">{title}</AlertTitle>
      <AlertDescription className="mt-2 text-foreground">
        {children}
      </AlertDescription>
    </Alert>
  );
}
