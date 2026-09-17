import Link from "next/link";
import { categories } from "@/lib/catalog";
import {
  getFeaturedProducts,
  getPopularProducts,
  getRecommendedForYou,
} from "@/lib/recommend";
import { RecommendRow } from "@/components/RecommendRow";
import { ProductGrid } from "@/components/ProductGrid";

export default function HomePage() {
  const featured = getFeaturedProducts(6);
  const recommended = getRecommendedForYou(8);
  const popular = getPopularProducts(4);

  return (
    <div className="space-y-12">
      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid gap-6 p-6 sm:p-10 md:grid-cols-[1.2fr_1fr] md:items-center">
          <div className="space-y-4">
            <p className="text-sm font-medium text-primary">Marketplace shell</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Shop calm essentials from trusted sellers
            </h1>
            <p className="max-w-lg text-muted-foreground">
              Browse featured products, explore categories, and try the
              recommendation rows — all powered by mock catalog data.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <Link
                href="/products"
                className="inline-flex h-10 items-center rounded-sm bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Browse products
              </Link>
              <Link
                href="/search"
                className="inline-flex h-10 items-center rounded-sm border border-input px-5 text-sm font-medium hover:bg-accent"
              >
                Search catalog
              </Link>
            </div>
          </div>
          <div className="hidden rounded-md bg-secondary p-4 md:block">
            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Popular right now
            </p>
            <ul className="space-y-2">
              {popular.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/product/${p.slug}`}
                    className="flex items-center justify-between gap-3 rounded-sm px-2 py-1.5 text-sm hover:bg-card"
                  >
                    <span className="truncate font-medium">{p.name}</span>
                    <span className="shrink-0 text-muted-foreground">
                      £{p.price.toFixed(0)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Shop by category
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Jump into a curated aisle
            </p>
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-primary hover:underline"
          >
            All products
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <p className="text-sm font-medium">{c.name}</p>
              <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                {c.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Featured products
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Editor picks from across the marketplace
          </p>
        </div>
        <ProductGrid products={featured} />
      </section>

      <RecommendRow
        title="Recommended for you"
        subtitle="A deterministic mix from popular categories"
        products={recommended}
        viewAllHref="/products?sort=popular"
      />
    </div>
  );
}
