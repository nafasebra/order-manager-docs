"use client";

import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart";
import { SessionProvider } from "@/lib/session";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartProvider>{children}</CartProvider>
    </SessionProvider>
  );
}
