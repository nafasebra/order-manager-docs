import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { formatMoney, cn } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  className?: string;
};

export function ProductCard({ product, className }: ProductCardProps) {
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/40",
        className,
      )}
    >
      <div
        className="relative aspect-[4/3] w-full"
        style={{
          background: `linear-gradient(145deg, hsl(${product.imageHue} 45% 88%), hsl(${product.imageHue} 55% 72%))`,
        }}
      >
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded-sm bg-foreground/80 px-2 py-0.5 text-xs text-background">
            Out of stock
          </span>
        )}
        {product.featured && !outOfStock && (
          <span className="absolute left-2 top-2 rounded-sm bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs text-muted-foreground">{product.category}</p>
        <h3 className="text-sm font-medium leading-snug text-foreground group-hover:text-primary">
          {product.name}
        </h3>
        <p className="mt-auto pt-2 text-sm font-semibold">
          {formatMoney(product.price, product.currency)}
        </p>
        <p className="text-xs text-muted-foreground">{product.sellerName}</p>
      </div>
    </Link>
  );
}
