"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart";
import { formatMoney } from "@/lib/utils";
import type { Product } from "@/lib/catalog";

export function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const disabled = product.stock <= 0;

  function handleAdd() {
    if (disabled) return;
    addItem(product.id, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Qty</span>
          <input
            type="number"
            min={1}
            max={Math.max(product.stock, 1)}
            value={qty}
            disabled={disabled}
            onChange={(e) =>
              setQty(Math.max(1, Number(e.target.value) || 1))
            }
            className="h-9 w-16 rounded-sm border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
        </label>
        <button
          type="button"
          onClick={handleAdd}
          disabled={disabled}
          className="h-10 rounded-sm bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {disabled ? "Out of stock" : added ? "Added to cart" : "Add to cart"}
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        {formatMoney(product.price * qty, product.currency)}
        {product.stock > 0
          ? ` · ${product.stock} in stock`
          : " · Currently unavailable"}
      </p>
    </div>
  );
}
