import { can } from "@/lib/permissions/can";
import type { Action, PermissionArea, SessionUser } from "@/types";

// Authentication and permission guards are intentionally disabled while the
// dashboard is being developed without authentication. To restore them, add
// the redirect import from @tanstack/react-router and uncomment the checks in
// the guard functions below.

export type RouterContext = {
  getSession: () => SessionUser | null;
  can: typeof can;
};

export function requireStaffSession({ context }: { context: RouterContext }) {
  const user = context.getSession();
  // if (!user || user.actorType !== "staff") {
  //   throw redirect({ to: "/auth/login", search: { panel: "staff" } });
  // }
  return { user };
}

export function requireSellerSession({ context }: { context: RouterContext }) {
  const user = context.getSession();
  // if (!user || user.actorType !== "seller") {
  //   throw redirect({ to: "/auth/login", search: { panel: "seller" } });
  // }
  return { user };
}

export function requireBuyerSession({ context }: { context: RouterContext }) {
  const user = context.getSession();
  // if (!user || user.actorType !== "buyer") {
  //   throw redirect({ to: "/auth/login", search: { panel: "buyer" } });
  // }
  return { user };
}

export function requireGrant(
  context: RouterContext,
  area: PermissionArea,
  action: Action,
) {
  // const user = context.getSession();
  // if (!can(user, area, action)) {
  //   throw redirect({ to: "/403" });
  // }
  void context;
  void area;
  void action;
}
