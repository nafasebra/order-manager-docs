import { api } from "@/lib/api/client";
import type { SessionUser } from "@/types";

/** Dev stub session until backend is wired. Swap for real GET /me. */
export const DEV_SESSION_USER: SessionUser = {
  id: "adm-1",
  displayName: "Nafas Admin",
  email: "admin@example.com",
  actorType: "staff",
  isSuperuser: true,
  grants: [],
};

export async function fetchMe(): Promise<SessionUser> {
  try {
    return await api.get<SessionUser>("/me");
  } catch {
    // Scaffold fallback for offline UI work
    return DEV_SESSION_USER;
  }
}

export async function login(
  panel: "staff" | "seller" | "buyer",
  credentials: { email: string; password: string },
): Promise<SessionUser> {
  const path =
    panel === "staff"
      ? "/auth/login"
      : panel === "seller"
        ? "/auth/seller/login"
        : "/auth/buyer/login";
  return api.post<SessionUser>(path, credentials);
}

export async function logout(panel: "staff" | "seller" | "buyer"): Promise<void> {
  const path =
    panel === "staff"
      ? "/auth/logout"
      : panel === "seller"
        ? "/auth/seller/logout"
        : "/auth/buyer/logout";
  await api.post(path);
}
