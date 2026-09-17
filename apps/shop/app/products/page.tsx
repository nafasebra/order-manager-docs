import { Suspense } from "react";
import type { Metadata } from "next";
import {
  filterProducts,
  parseCatalogSearchParams,
} from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterSidebar } from "@/components/FilterSidebar";

export const metadata: Metadata = {
  title: "Products",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);
  const results = filterProducts(filters);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">All products</h1>
        <p className="text-sm text-muted-foreground">
          Filter by category, price, and stock — {results.length} shown
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-muted" />}>
          <FilterSidebar />
        </Suspense>
        <ProductGrid
          products={results}
          emptyMessage="No products match these filters. Try clearing them."
        />
      </div>
    </div>
  );
}
