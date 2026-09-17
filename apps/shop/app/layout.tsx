import type { Metadata } from "next";
import { Suspense } from "react";
import { Providers } from "@/components/providers";
import { ShopHeader } from "@/components/ShopHeader";
import { ShopFooter } from "@/components/ShopFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Clean Commerce Shop",
    template: "%s · Clean Commerce",
  },
  description:
    "Public storefront shell — browse products, search, filter, and checkout.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Suspense fallback={<div className="h-[7.5rem] border-b border-border bg-card" />}>
            <ShopHeader />
          </Suspense>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
            {children}
          </main>
          <ShopFooter />
        </Providers>
      </body>
    </html>
  );
}
