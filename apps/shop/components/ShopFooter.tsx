import Link from "next/link";
import { categories } from "@/lib/catalog";

export function ShopFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-lg font-semibold tracking-tight">
            Clean<span className="text-primary">Commerce</span>
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            A marketplace storefront shell — browse, filter, and checkout with
            mock data.
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Categories</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {categories.slice(0, 4).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/category/${c.slug}`}
                  className="hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/login" className="hover:text-primary">
                Log in
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-primary">
                Sign up
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-primary">
                Checkout
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-primary">
                All products
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        Storefront shell — no payments or live inventory.
      </div>
    </footer>
  );
}
