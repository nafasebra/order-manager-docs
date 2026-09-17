"use client";

import Link from "next/link";
import { ShoppingBag, User } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { SearchBar } from "./SearchBar";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/products", label: "Shop" },
  { href: "/category/electronics", label: "Electronics" },
  { href: "/category/home-kitchen", label: "Home" },
  { href: "/category/wellness", label: "Wellness" },
];

export function ShopHeader() {
  const { itemCount } = useCart();
  const { user, logout } = useSession();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="shrink-0 text-lg font-semibold tracking-tight text-foreground"
          >
            Clean<span className="text-primary">Commerce</span>
          </Link>

          <div className="hidden flex-1 md:block">
            <SearchBar />
          </div>

          <nav className="ml-auto flex items-center gap-1 sm:gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:inline-flex">
                  <User className="size-4" />
                  {user.displayName}
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-sm px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="rounded-sm bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Sign up
                </Link>
              </>
            )}
            <Link
              href="/checkout"
              className={cn(
                "relative inline-flex items-center gap-1.5 rounded-sm px-2 py-1.5 text-sm",
                "hover:bg-accent hover:text-accent-foreground",
              )}
              aria-label={`Cart, ${itemCount} items`}
            >
              <ShoppingBag className="size-5" />
              <span className="hidden sm:inline">Cart</span>
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
          </nav>
        </div>

        <div className="md:hidden">
          <SearchBar />
        </div>

        <nav className="flex gap-1 overflow-x-auto pb-0.5 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-sm px-2.5 py-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
