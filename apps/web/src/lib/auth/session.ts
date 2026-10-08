import { api } from "@/lib/api/client";
import type { SessionUser } from "@/types";
import { template } from "@/config/template";
import { demoLogin } from "./demo";
import { getSession, setSession } from "./store";

export async function fetchMe(): Promise<SessionUser> {
  if (template.demo) {
    const user = getSession();
    if (!user) throw new Error("Choose a demo account to continue.");
    return user;
  }
  return api.get<SessionUser>("/me");
}

export async function login(
  panel: "staff" | "seller" | "buyer",
  credentials: { email: string; password: string },
): Promise<SessionUser> {
  if (template.demo) return demoLogin(panel, credentials);
  const path =
    panel === "staff"
      ? "/auth/login"
      : panel === "seller"
        ? "/auth/seller/login"
        : "/auth/buyer/login";
  return api.post<SessionUser>(path, credentials);
}

export async function logout(
  panel: "staff" | "seller" | "buyer",
): Promise<void> {
  if (template.demo) {
    setSession(null);
    return;
  }
  const path =
    panel === "staff"
      ? "/auth/logout"
      : panel === "seller"
        ? "/auth/seller/logout"
        : "/auth/buyer/logout";
  await api.post(path);
}
