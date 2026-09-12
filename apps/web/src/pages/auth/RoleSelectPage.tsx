import { useState, type FormEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Store, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { setSession } from "@/router";
import type { ActorType, SessionUser } from "@/types";

type RoleOption = {
  id: ActorType;
  title: string;
  description: string;
  icon: typeof LayoutDashboard;
};

const roles: RoleOption[] = [
  {
    id: "staff",
    title: "Login as Admin",
    description:
      "Platform operations — orders, people, catalog, support, and settings.",
    icon: LayoutDashboard,
  },
  {
    id: "seller",
    title: "Login as Seller",
    description:
      "Shop dashboard — products, orders, delivery methods, and payment ways.",
    icon: Store,
  },
  {
    id: "buyer",
    title: "Login as Buyer",
    description:
      "Account home — profile, addresses, own orders, and support tickets.",
    icon: User,
  },
];

const panelPath: Record<ActorType, string> = {
  staff: "/admin",
  seller: "/seller",
  buyer: "/account",
};

function sessionForRole(role: ActorType): SessionUser {
  if (role === "staff") {
    return {
      id: "adm-1",
      displayName: "Nafas Admin",
      email: "admin@example.com",
      actorType: "staff",
      isSuperuser: true,
      grants: [],
    };
  }
  if (role === "seller") {
    return {
      id: "seller-0001",
      displayName: "Shop Owner",
      email: "seller1@example.com",
      actorType: "seller",
      shopName: "Northwind Goods",
      sellerId: "seller-0001",
    };
  }
  return {
    id: "buyer-0001",
    displayName: "Sarah Wilson",
    email: "buyer1@example.com",
    actorType: "buyer",
    buyerId: "buyer-0001",
  };
}

export function RoleSelectPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ActorType | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSession(sessionForRole(selected));
    void navigate({ to: panelPath[selected] });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-2 text-center sm:text-left">
          <CardTitle className="text-[28px] font-semibold leading-tight lg:text-[32px]">
            Clean Commerce
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose a panel to continue. This sets a mock session for the
            scaffold.
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
                      className="mt-1 accent-[hsl(var(--primary))]"
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
