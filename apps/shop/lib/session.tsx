"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const STORAGE_KEY = "clean-commerce-shop-session";

export type ShopUser = {
  id: string;
  displayName: string;
  email: string;
};

type SessionContextValue = {
  user: ShopUser | null;
  login: (email: string, displayName?: string) => void;
  signup: (email: string, displayName: string) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

function readSession(): ShopUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ShopUser;
    if (!parsed?.email || !parsed?.displayName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ShopUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(readSession());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [user, hydrated]);

  const login = useCallback((email: string, displayName?: string) => {
    const name =
      displayName?.trim() ||
      email.split("@")[0]?.replace(/[._]/g, " ") ||
      "Buyer";
    setUser({
      id: `buyer-${Date.now()}`,
      email: email.trim().toLowerCase(),
      displayName: name.replace(/\b\w/g, (c) => c.toUpperCase()),
    });
  }, []);

  const signup = useCallback((email: string, displayName: string) => {
    setUser({
      id: `buyer-${Date.now()}`,
      email: email.trim().toLowerCase(),
      displayName: displayName.trim(),
    });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const value = useMemo(
    () => ({ user, login, signup, logout }),
    [user, login, signup, logout],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return ctx;
}
