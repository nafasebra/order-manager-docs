import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Store, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { setSession } from "@/lib/auth/store";
import {
  demoAccounts,
  demoSession,
  sessionHome,
  type DemoAccountKey,
} from "@/lib/auth/demo";
import { template } from "@/config/template";

const roles = demoAccounts.map((account) => ({
  id: account.key,
  title: `Login as ${account.label}`,
  description:
    account.panel === "staff"
      ? `${account.label} permissions in the admin panel.`
      : `Explore your ${account.label.toLowerCase()} account.`,
  icon:
    account.panel === "staff"
      ? LayoutDashboard
      : account.panel === "seller"
        ? Store
        : User,
  panel: account.panel,
}));

export function RoleSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<DemoAccountKey | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const role = roles.find((item) => item.id === selected)!;
    if (!template.demo) {
      void navigate({ to: "/auth/login", search: { panel: role.panel } });
      return;
    }
    const user = demoSession(selected);
    setSession(user);
    void navigate({ to: sessionHome(user) });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2 text-center sm:text-left">
          <CardTitle className="text-[28px] font-semibold leading-tight lg:text-[32px]">
            {template.brand}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose an account to explore the dashboard. Demo changes can be
            reset.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div
              role="radiogroup"
              aria-label="Select role"
              className="grid gap-3"
            >
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selected === role.id;
                return (
                  <label
                    key={role.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-md border border-border bg-card p-4 transition-colors",
                      isSelected &&
                        "border-primary bg-primary/10 ring-1 ring-primary",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.id}
                      checked={isSelected}
                      onChange={() => setSelected(role.id)}
                      className="mt-1 accent-primary"
                    />
                    <Icon
                      className={cn(
                        "mt-0.5 h-5 w-5 shrink-0 text-muted-foreground",
                        isSelected && "text-primary",
                      )}
                      aria-hidden
                    />
                    <span className="min-w-0 space-y-1">
                      <span className="block text-sm font-semibold">
                        {role.title}
                      </span>
                      <span className="block text-sm text-muted-foreground">
                        {role.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
            <Button type="submit" className="w-full" disabled={!selected}>
              Submit
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
