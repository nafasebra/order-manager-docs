"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useCart } from "@/lib/cart";
import { useSession } from "@/lib/session";
import { formatMoney } from "@/lib/utils";

export default function CheckoutPage() {
  const { lines, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const { user } = useSession();
  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [postal, setPostal] = useState("");

  useEffect(() => {
    if (user) {
      setName((n) => n || user.displayName);
      setEmail((e) => e || user.email);
    }
  }, [user]);
  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    if (!name.trim() || !email.trim() || !line1.trim() || !city.trim() || !postal.trim()) {
      setError("Please fill in all shipping fields.");
      return;
    }

    const id = `ORD-${10000 + Math.floor(Math.random() * 90000)}`;
    setOrderId(id);
    clearCart();
    setPlaced(true);
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm font-medium text-primary">Order placed</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Thank you for your order
        </h1>
        <p className="text-sm text-muted-foreground">
          This is a mock confirmation. Reference{" "}
          <span className="font-medium text-foreground">{orderId}</span>. No
          payment was collected.
        </p>
        <div className="flex justify-center gap-3 pt-4">
          <Link
            href="/"
            className="inline-flex h-10 items-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Back to home
          </Link>
          <Link
            href="/products"
            className="inline-flex h-10 items-center rounded-sm border border-input px-5 text-sm hover:bg-accent"
          >
            Keep shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your cart and enter a shipping address (mock — no payment)
        </p>
      </div>

      {lines.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-card px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          <Link
            href="/products"
            className="mt-4 inline-flex h-9 items-center rounded-sm bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold">Cart ({lines.length})</h2>
            <ul className="divide-y divide-border rounded-md border border-border bg-card">
              {lines.map((line) => (
                <li
                  key={line.productId}
                  className="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
                >
                  <div
                    className="size-14 shrink-0 rounded-sm"
                    style={{
                      background: `linear-gradient(145deg, hsl(${line.product.imageHue} 45% 88%), hsl(${line.product.imageHue} 55% 72%))`,
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${line.product.slug}`}
                      className="text-sm font-medium hover:text-primary"
                    >
                      {line.product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {formatMoney(line.product.price, line.product.currency)} each
                    </p>
                  </div>
                  <input
                    type="number"
                    min={1}
                    value={line.quantity}
                    onChange={(e) =>
                      updateQuantity(
                        line.productId,
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                    className="h-8 w-14 rounded-sm border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Quantity for ${line.product.name}`}
                  />
                  <p className="w-20 text-right text-sm font-medium">
                    {formatMoney(line.lineTotal, line.product.currency)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(line.productId)}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-right text-sm font-semibold">
              Subtotal {formatMoney(subtotal)}
            </p>
          </div>

          <form
            onSubmit={onSubmit}
            className="space-y-4 rounded-md border border-border bg-card p-5"
          >
            <h2 className="text-sm font-semibold">Shipping</h2>
            {!user && (
              <p className="text-xs text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Log in
                </Link>
              </p>
            )}
            <label className="block space-y-1">
              <span className="text-xs font-medium">Full name</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">Email</span>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">Address</span>
              <input
                required
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1">
                <span className="text-xs font-medium">City</span>
                <input
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium">Postal code</span>
                <input
                  required
                  value={postal}
                  onChange={(e) => setPostal(e.target.value)}
                  className="h-9 w-full rounded-sm border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="h-10 w-full rounded-sm bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Place order · {formatMoney(subtotal)}
            </button>
            <p className="text-center text-xs text-muted-foreground">
              Shell only — no card capture or payment gateway.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
