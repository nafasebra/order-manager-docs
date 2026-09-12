import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function SessionExpiredPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Session expired</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your session timed out. Sign in again to continue.
          </p>
          <Button asChild>
            <Link to="/auth/login">Return to login</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
