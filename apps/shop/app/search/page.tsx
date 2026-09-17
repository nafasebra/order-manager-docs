import { Suspense } from "react";
import type { Metadata } from "next";
import {
  filterProducts,
  parseCatalogSearchParams,
} from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterSidebar } from "@/components/FilterSidebar";
import { SearchBar } from "@/components/SearchBar";

export const metadata: Metadata = {
  title: "Search",
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = parseCatalogSearchParams(params);
  const results = filterProducts(filters);
  const q = filters.q ?? "";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Search</h1>
        <p className="text-sm text-muted-foreground">
          {q
            ? `Results for “${q}” — ${results.length} product${results.length === 1 ? "" : "s"}`
            : "Search the catalog by name, category, or seller"}
        </p>
      </div>

      <div className="max-w-xl md:hidden">
        <SearchBar initialQuery={q} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-muted" />}>
          <FilterSidebar />
        </Suspense>
        <ProductGrid
          products={results}
          emptyMessage={
            q
              ? `No products match “${q}”. Try another term or clear filters.`
              : "Enter a search term or browse all products."
          }
        />
      </div>
    </div>
  );
}
