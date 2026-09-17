"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState, type FormEvent } from "react";
import { categories, type SortOption } from "@/lib/catalog";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Most popular" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "name", label: "Name A–Z" },
];

type FilterSidebarProps = {
  showCategory?: boolean;
  lockedCategory?: string;
};

export function FilterSidebar({
  showCategory = true,
  lockedCategory,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [min, setMin] = useState(searchParams.get("min") ?? "");
  const [max, setMax] = useState(searchParams.get("max") ?? "");
  const [category, setCategory] = useState(
    lockedCategory ?? searchParams.get("category") ?? "",
  );
  const [sort, setSort] = useState(searchParams.get("sort") ?? "featured");
  const [inStock, setInStock] = useState(
    searchParams.get("inStock") === "1" ||
      searchParams.get("inStock") === "true",
  );

  const apply = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault();
      const params = new URLSearchParams(searchParams.toString());
      if (min) params.set("min", min);
      else params.delete("min");
      if (max) params.set("max", max);
      else params.delete("max");
      if (!lockedCategory) {
        if (category) params.set("category", category);
        else params.delete("category");
      }
      if (sort && sort !== "featured") params.set("sort", sort);
      else params.delete("sort");
      if (inStock) params.set("inStock", "1");
      else params.delete("inStock");
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname);
    },
    [
      router,
      pathname,
      searchParams,
      min,
      max,
      category,
      sort,
      inStock,
      lockedCategory,
    ],
  );

  function clearFilters() {
    setMin("");
    setMax("");
    if (!lockedCategory) setCategory("");
    setSort("featured");
    setInStock(false);
    const q = searchParams.get("q");
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <form
      onSubmit={apply}
      className="space-y-5 rounded-md border border-border bg-card p-4"
    >
      <div>
        <h2 className="text-sm font-semibold">Filters</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Refine the catalog
        </p>
      </div>

      {showCategory && !lockedCategory && (
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-foreground">Category</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-9 w-full rounded-sm border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <fieldset className="space-y-1.5">
        <legend className="text-xs font-medium text-foreground">
          Price range (£)
        </legend>
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            className="h-9 w-full rounded-sm border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            className="h-9 w-full rounded-sm border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </fieldset>

      <label className="block space-y-1.5">
        <span className="text-xs font-medium text-foreground">Sort by</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="h-9 w-full rounded-sm border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={inStock}
          onChange={(e) => setInStock(e.target.checked)}
          className="size-4 rounded border-input accent-primary"
        />
        In stock only
      </label>

      <div className="flex flex-col gap-2 pt-1">
        <button
          type="submit"
          className="h-9 rounded-sm bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Apply filters
        </button>
        <button
          type="button"
          onClick={clearFilters}
          className="h-9 rounded-sm border border-input text-sm hover:bg-accent"
        >
          Clear
        </button>
      </div>
    </form>
  );
}
