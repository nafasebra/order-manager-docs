import { redirect } from "@tanstack/react-router";
import { can } from "@/lib/permissions/can";
import type { Action, PermissionArea, SessionUser } from "@/types";

export type RouterContext = {
  getSession: () => SessionUser | null;
  can: typeof can;
};

export function requireStaffSession({ context }: { context: RouterContext }) {
  const user = context.getSession();
  if (!user || user.actorType !== "staff") {
    throw redirect({ to: "/auth/login", search: { panel: "staff" } });
  }
  return { user };
}

export function requireSellerSession({ context }: { context: RouterContext }) {
  const user = context.getSession();
  if (!user || user.actorType !== "seller") {
    throw redirect({ to: "/auth/login", search: { panel: "seller" } });
  }
  return { user };
}

export function requireBuyerSession({ context }: { context: RouterContext }) {
  const user = context.getSession();
  if (!user || user.actorType !== "buyer") {
    throw redirect({ to: "/auth/login", search: { panel: "buyer" } });
  }
  return { user };
}

export function requireGrant(
  context: RouterContext,
  area: PermissionArea,
  action: Action,
) {
  const user = context.getSession();
  if (!can(user, area, action)) {
    throw redirect({ to: "/403" });
  }
}
