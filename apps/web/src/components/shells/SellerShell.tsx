import type { ReactNode } from "react";
import { template } from "@/config/template";
import {
  LayoutDashboard,
  Package,
  Boxes,
  TicketPercent,
  ShoppingCart,
  Settings,
  BarChart3,
  LifeBuoy,
  Flag,
} from "lucide-react";
import { AppShell, type NavSection } from "@/components/shells/AppShell";
import type { SessionUser } from "@/types";

type SellerShellProps = {
  user: SessionUser | null;
  onLogout?: () => void;
  children: ReactNode;
};

export function SellerShell({ user, onLogout, children }: SellerShellProps) {
  const sections: NavSection[] = [
    {
      items: [
        { label: "Overview", to: "/seller", icon: LayoutDashboard },
        {
          label: "Analytics",
          to: "/seller/analytics",
          icon: BarChart3,
        },
        { label: "Products", to: "/seller/products", icon: Package },
        { label: "Inventory", to: "/seller/inventory", icon: Boxes },
        ...(template.modules.coupons
          ? [{ label: "Coupons", to: "/seller/coupons", icon: TicketPercent }]
          : []),
        { label: "Orders", to: "/seller/orders", icon: ShoppingCart },
        { label: "My reports", to: "/seller/reports", icon: Flag },
        {
          label: "Tickets",
          to: "/seller/tickets",
          icon: LifeBuoy,
        },
        { label: "Settings", to: "/seller/settings", icon: Settings },
      ],
    },
  ];

  return (
    <AppShell
      panel="seller"
      brand={user?.shopName ?? "Seller shop"}
      subtitle="Seller"
      sections={sections}
      user={user}
      onLogout={onLogout}
    >
      {children}
    </AppShell>
  );
}
