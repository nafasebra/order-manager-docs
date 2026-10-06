import type { ReactNode } from "react";
import {
  LayoutDashboard,
  BarChart3,
  Megaphone,
  Contact,
  ShoppingCart,
  FileText,
  ArrowLeftRight,
  Users,
  Store,
  Package,
  Tags,
  TicketPercent,
  Star,
  MessageCircleQuestion,
  Flag,
  Globe,
  Newspaper,
  LifeBuoy,
  Shield,
  KeyRound,
  BadgeCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AppShell,
  type NavItem,
  type NavSection,
} from "@/components/shells/AppShell";
import { filterNavByGrants } from "@/lib/permissions/can";
import type { PermissionArea, SessionUser } from "@/types";

type AdminShellProps = {
  user: SessionUser | null;
  onLogout?: () => void;
  children: ReactNode;
};

function canView(user: SessionUser | null, area: PermissionArea) {
  return Boolean(user?.isSuperuser || filterNavByGrants(user, area));
}

function section(
  title: string,
  items: NavItem[],
): NavSection | null {
  return items.length ? { title, items } : null;
}

export function AdminShell({ user, onLogout, children }: AdminShellProps) {
  const sections: NavSection[] = [
    {
      items: [{ label: "Overview", to: "/admin", icon: LayoutDashboard }],
    },
    section("Insights", [
      ...(canView(user, "analytics")
        ? [{ label: "Analytics", to: "/admin/analytics", icon: BarChart3 }]
        : []),
      ...(canView(user, "marketing")
        ? [{ label: "Campaigns", to: "/admin/marketing", icon: Megaphone }]
        : []),
      ...(canView(user, "crm")
        ? [{ label: "CRM", to: "/admin/crm", icon: Contact }]
        : []),
    ] as NavItem[]),
    section("Commerce", [
      { label: "Coupons", to: "/admin/coupons", icon: TicketPercent },
      ...(canView(user, "orders")
        ? [{ label: "Orders", to: "/admin/orders", icon: ShoppingCart }]
        : []),
      ...(canView(user, "invoices")
        ? [{ label: "Invoices", to: "/admin/invoices", icon: FileText }]
        : []),
      ...(canView(user, "transactions")
        ? [
            {
              label: "Transactions",
              to: "/admin/transactions",
              icon: ArrowLeftRight,
            },
          ]
        : []),
    ] as NavItem[]),
    section("People", [
      ...(canView(user, "buyers")
        ? [{ label: "Buyers", to: "/admin/buyers", icon: Users }]
        : []),
      ...(canView(user, "sellers")
        ? [{ label: "Sellers", to: "/admin/sellers", icon: Store }]
        : []),
    ] as NavItem[]),
    section("Catalog", [
      ...(canView(user, "products")
        ? [{ label: "Products", to: "/admin/products", icon: Package }]
        : []),
      ...(canView(user, "products")
        ? [{ label: "Categories", to: "/admin/categories", icon: Tags }]
        : []),
      ...(canView(user, "reviews")
        ? [{ label: "Reviews", to: "/admin/reviews", icon: Star }]
        : []),
      ...(canView(user, "qa")
        ? [
            {
              label: "Q&A",
              to: "/admin/questions",
              icon: MessageCircleQuestion,
            },
          ]
        : []),
      ...(canView(user, "product_reports")
        ? [
            {
              label: "Reports",
              to: "/admin/product-reports",
              icon: Flag,
            },
          ]
        : []),
    ] as NavItem[]),
    section("Content", [
      ...(canView(user, "website")
        ? [{ label: "Website", to: "/admin/website", icon: Globe }]
        : []),
      ...(canView(user, "blog")
        ? [{ label: "Blog", to: "/admin/blog", icon: Newspaper }]
        : []),
    ] as NavItem[]),
    section("Support", [
      ...(canView(user, "tickets")
        ? [
            {
              label: "Tickets",
              to: "/admin/support/tickets",
              icon: LifeBuoy,
            },
          ]
        : []),
    ] as NavItem[]),
    section("Settings", [
      ...(canView(user, "admin_management")
        ? [
            {
              label: "Admins",
              to: "/admin/settings/admins",
              icon: Shield,
            },
            {
              label: "Roles",
              to: "/admin/settings/roles",
              icon: KeyRound,
            },
          ]
        : []),
    ] as NavItem[]),
  ].filter((s): s is NavSection => Boolean(s));

  return (
    <AppShell
      panel="admin"
      brand="Clean Commerce"
      subtitle="Admin"
      sections={sections}
      user={user}
      onLogout={onLogout}
      badge={
        user?.isSuperuser ? (
          <Badge variant="secondary" className="gap-1">
            <BadgeCheck className="h-3 w-3" />
            Super
          </Badge>
        ) : null
      }
    >
      {children}
    </AppShell>
  );
}
