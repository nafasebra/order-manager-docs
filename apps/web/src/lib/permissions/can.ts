import type { Action, Grant, PermissionArea, SessionUser } from "@/types";

export function can(
  user: SessionUser | null | undefined,
  area: PermissionArea,
  action: Action,
): boolean {
  if (!user || user.actorType !== "staff") return false;
  if (user.isSuperuser) return true;
  const grant = user.grants?.find((g: Grant) => g.area === area);
  return Boolean(grant?.actions.includes(action));
}

export function filterNavByGrants(
  user: SessionUser | null | undefined,
  area: PermissionArea,
): boolean {
  return can(user, area, "view");
}
