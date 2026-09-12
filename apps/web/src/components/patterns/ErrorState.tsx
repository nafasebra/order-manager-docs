import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ErrorStateProps = {
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this page. Try again or contact support.",
  action,
  className,
}: ErrorStateProps) {
  return (
    <Card className={cn(className)}>
      <CardContent className="py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>{description}</AlertDescription>
        </Alert>
        {action ? <div className="mt-4">{action}</div> : null}
      </CardContent>
    </Card>
  );
}
