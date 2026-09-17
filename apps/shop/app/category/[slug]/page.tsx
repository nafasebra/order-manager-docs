import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  filterProducts,
  getCategoryBySlug,
  parseCatalogSearchParams,
} from "@/lib/catalog";
import { ProductGrid } from "@/components/ProductGrid";
import { FilterSidebar } from "@/components/FilterSidebar";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  return {
    title: category?.name ?? "Category",
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  const raw = await searchParams;
  const filters = parseCatalogSearchParams(raw);
  const results = filterProducts({
    ...filters,
    category: slug,
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <nav className="text-xs text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Home
          </Link>
          <span className="mx-1.5">/</span>
          <Link href="/products" className="hover:text-primary">
            Products
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>
        <h1 className="text-2xl font-semibold tracking-tight">
          {category.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {category.description} — {results.length} product
          {results.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-muted" />}>
          <FilterSidebar showCategory={false} lockedCategory={slug} />
        </Suspense>
        <ProductGrid
          products={results}
          emptyMessage={`No products in ${category.name} match these filters.`}
        />
      </div>
    </div>
  );
}
