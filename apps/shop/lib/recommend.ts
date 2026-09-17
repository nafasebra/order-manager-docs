import { products, type Product } from "./catalog";

/** Popular products by popularity score. */
export function getPopularProducts(limit = 8): Product[] {
  return [...products]
    .filter((p) => p.stock > 0)
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/** Featured products for homepage hero grid. */
export function getFeaturedProducts(limit = 6): Product[] {
  return products.filter((p) => p.featured && p.stock > 0).slice(0, limit);
}

/** Same-category related items, excluding the current product. */
export function getRelatedProducts(product: Product, limit = 4): Product[] {
  return products
    .filter(
      (p) =>
        p.id !== product.id &&
        p.categorySlug === product.categorySlug &&
        p.stock > 0,
    )
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit);
}

/**
 * Deterministic “for you” mix: take top items from a few seed categories.
 * Not ML — just a stable rotation for the shell.
 */
export function getRecommendedForYou(limit = 8): Product[] {
  const seedCategories = [
    "electronics",
    "home-kitchen",
    "wellness",
    "outdoors",
  ];
  const picked: Product[] = [];
  const seen = new Set<string>();

  for (const slug of seedCategories) {
    const fromCat = products
      .filter((p) => p.categorySlug === slug && p.stock > 0)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 2);
    for (const p of fromCat) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        picked.push(p);
      }
    }
  }

  if (picked.length < limit) {
    for (const p of getPopularProducts(limit * 2)) {
      if (!seen.has(p.id)) {
        seen.add(p.id);
        picked.push(p);
      }
      if (picked.length >= limit) break;
    }
  }

  return picked.slice(0, limit);
}
