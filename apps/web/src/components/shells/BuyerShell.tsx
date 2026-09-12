import type { ReactNode } from "react";
import {
  Home,
  User,
  MapPin,
  ShoppingBag,
  LifeBuoy,
} from "lucide-react";
import { AppShell, type NavSection } from "@/components/shells/AppShell";
import type { SessionUser } from "@/types";

type BuyerShellProps = {
  user: SessionUser | null;
  onLogout?: () => void;
  children: ReactNode;
};

export function BuyerShell({ user, onLogout, children }: BuyerShellProps) {
  const sections: NavSection[] = [
    {
      items: [
        { label: "Home", to: "/account", icon: Home },
        { label: "Profile", to: "/account/profile", icon: User },
        { label: "Addresses", to: "/account/addresses", icon: MapPin },
        { label: "Orders", to: "/account/orders", icon: ShoppingBag },
        { label: "Tickets", to: "/account/tickets", icon: LifeBuoy },
      ],
    },
  ];

  return (
    <AppShell
      panel="buyer"
      brand="My account"
      subtitle="Buyer"
      sections={sections}
      user={user}
      onLogout={onLogout}
    >
      {children}
    </AppShell>
  );
}
