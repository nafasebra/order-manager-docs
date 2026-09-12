import { Link } from "@tanstack/react-router";
import { ErrorState } from "@/components/patterns/ErrorState";
import { Button } from "@/components/ui/button";

export function ForbiddenPage() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <ErrorState
        title="403 — Forbidden"
        description="You do not have permission to view this page."
        action={
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        }
      />
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="mx-auto max-w-lg py-16">
      <ErrorState
        title="404 — Not found"
        description="This page does not exist or is no longer available."
        action={
          <Button asChild variant="outline">
            <Link to="/">Go home</Link>
          </Button>
        }
      />
    </div>
  );
}
