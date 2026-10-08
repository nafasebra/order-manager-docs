import type { SessionUser } from "@/types";
import { template } from "@/config/template";

const key = "clean-commerce:session:v1";
function restore(): SessionUser | null {
  if (!template.demo) return null;
  try {
    const value = JSON.parse(localStorage.getItem(key) ?? "null");
    if (
      !value ||
      !["staff", "seller", "buyer"].includes(value.actorType) ||
      !value.id ||
      !value.displayName
    )
      return null;
    if (value.actorType === "seller" && !value.sellerId) return null;
    if (value.actorType === "buyer" && !value.buyerId) return null;
    return value;
  } catch {
    return null;
  }
}
let session: SessionUser | null = restore();
export function getSession() {
  return session;
}
export function setSession(user: SessionUser | null) {
  session = user;
  if (template.demo) {
    try {
      if (user) localStorage.setItem(key, JSON.stringify(user));
      else localStorage.removeItem(key);
    } catch {
      /* The session still works when browser storage is unavailable. */
    }
  }
}
