export type Category = {
  slug: string;
  name: string;
  description: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  category: string;
  categorySlug: string;
  sellerName: string;
  imageHue: number;
  featured?: boolean;
  popularity: number;
};

export type SortOption = "featured" | "price-asc" | "price-desc" | "name" | "popular";

export type CatalogFilters = {
  q?: string;
  category?: string;
  min?: number;
  max?: number;
  inStock?: boolean;
  sort?: SortOption;
};

export const categories: Category[] = [
  {
    slug: "home-kitchen",
    name: "Home & Kitchen",
    description: "Everyday essentials for a calmer home.",
  },
  {
    slug: "electronics",
    name: "Electronics",
    description: "Gadgets and gear that just work.",
  },
  {
    slug: "apparel",
    name: "Apparel",
    description: "Comfortable pieces for every season.",
  },
  {
    slug: "wellness",
    name: "Wellness",
    description: "Self-care and healthy living picks.",
  },
  {
    slug: "office",
    name: "Office",
    description: "Tools for focused, tidy workspaces.",
  },
  {
    slug: "outdoors",
    name: "Outdoors",
    description: "Ready for parks, trails, and travel.",
  },
];

const rawProducts: Omit<Product, "slug" | "categorySlug">[] = [
  {
    id: "prod-001",
    name: "Ceramic Pour-Over Set",
    description:
      "A matte ceramic dripper and carafe for slow morning coffee. Dishwasher safe.",
    price: 42,
    currency: "GBP",
    stock: 24,
    category: "Home & Kitchen",
    sellerName: "Northwind Goods",
    imageHue: 168,
    featured: true,
    popularity: 92,
  },
  {
    id: "prod-002",
    name: "Linen Throw Blanket",
    description:
      "Soft washed linen throw in mist green. Light enough for summer evenings.",
    price: 58,
    currency: "GBP",
    stock: 18,
    category: "Home & Kitchen",
    sellerName: "Harbor Home",
    imageHue: 160,
    featured: true,
    popularity: 88,
  },
  {
    id: "prod-003",
    name: "Wireless Noise Cancelling Buds",
    description:
      "Compact earbuds with adaptive ANC and 28-hour case battery life.",
    price: 129,
    currency: "GBP",
    stock: 40,
    category: "Electronics",
    sellerName: "Signal Lab",
    imageHue: 200,
    featured: true,
    popularity: 95,
  },
  {
    id: "prod-004",
    name: "USB-C Hub 7-in-1",
    description:
      "HDMI 4K, SD, USB-A, and PD pass-through in a slim aluminium body.",
    price: 49,
    currency: "GBP",
    stock: 55,
    category: "Electronics",
    sellerName: "Signal Lab",
    imageHue: 210,
    popularity: 81,
  },
  {
    id: "prod-005",
    name: "Merino Crew Neck",
    description:
      "Fine-gauge merino sweater that layers cleanly under jackets.",
    price: 78,
    currency: "GBP",
    stock: 32,
    category: "Apparel",
    sellerName: "Field & Form",
    imageHue: 30,
    featured: true,
    popularity: 86,
  },
  {
    id: "prod-006",
    name: "Organic Cotton Tee",
    description: "Midweight tee with a relaxed fit and reinforced seams.",
    price: 28,
    currency: "GBP",
    stock: 70,
    category: "Apparel",
    sellerName: "Field & Form",
    imageHue: 40,
    popularity: 74,
  },
  {
    id: "prod-007",
    name: "Yoga Mat Cork Top",
    description:
      "Natural cork surface with a grippy base. Includes a carry strap.",
    price: 54,
    currency: "GBP",
    stock: 22,
    category: "Wellness",
    sellerName: "Calm Studio",
    imageHue: 90,
    featured: true,
    popularity: 79,
  },
  {
    id: "prod-008",
    name: "Herbal Sleep Blend",
    description:
      "Chamomile, lemon balm, and lavender tea sachets — pack of 20.",
    price: 14,
    currency: "GBP",
    stock: 100,
    category: "Wellness",
    sellerName: "Calm Studio",
    imageHue: 100,
    popularity: 71,
  },
  {
    id: "prod-009",
    name: "Desk Lamp with Dimmer",
    description:
      "Warm LED task lamp with touch dimming and a weighted base.",
    price: 65,
    currency: "GBP",
    stock: 27,
    category: "Office",
    sellerName: "Deskcraft",
    imageHue: 45,
    featured: true,
    popularity: 84,
  },
  {
    id: "prod-010",
    name: "Notebook Duo Pack",
    description: "Two A5 dotted notebooks with lay-flat binding.",
    price: 18,
    currency: "GBP",
    stock: 90,
    category: "Office",
    sellerName: "Deskcraft",
    imageHue: 50,
    popularity: 68,
  },
  {
    id: "prod-011",
    name: "Insulated Water Bottle 750ml",
    description: "Double-wall steel bottle that keeps drinks cold for 24h.",
    price: 32,
    currency: "GBP",
    stock: 60,
    category: "Outdoors",
    sellerName: "Trail & Tide",
    imageHue: 195,
    featured: true,
    popularity: 90,
  },
  {
    id: "prod-012",
    name: "Packable Daypack",
    description: "18L pack that folds into its own pocket when empty.",
    price: 46,
    currency: "GBP",
    stock: 35,
    category: "Outdoors",
    sellerName: "Trail & Tide",
    imageHue: 185,
    popularity: 77,
  },
  {
    id: "prod-013",
    name: "Cast Iron Skillet 26cm",
    description: "Pre-seasoned skillet for stovetop and oven cooking.",
    price: 55,
    currency: "GBP",
    stock: 16,
    category: "Home & Kitchen",
    sellerName: "Northwind Goods",
    imageHue: 20,
    popularity: 83,
  },
  {
    id: "prod-014",
    name: "Portable Bluetooth Speaker",
    description: "IPX7 waterproof speaker with 12-hour playtime.",
    price: 79,
    currency: "GBP",
    stock: 28,
    category: "Electronics",
    sellerName: "Signal Lab",
    imageHue: 220,
    popularity: 87,
  },
  {
    id: "prod-015",
    name: "Linen Shirt Jacket",
    description: "Breathable overshirt with patch pockets and corozo buttons.",
    price: 92,
    currency: "GBP",
    stock: 14,
    category: "Apparel",
    sellerName: "Field & Form",
    imageHue: 35,
    popularity: 72,
  },
  {
    id: "prod-016",
    name: "Foam Roller Set",
    description: "Medium-density roller plus two massage balls for recovery.",
    price: 36,
    currency: "GBP",
    stock: 41,
    category: "Wellness",
    sellerName: "Calm Studio",
    imageHue: 110,
    popularity: 66,
  },
  {
    id: "prod-017",
    name: "Monitor Stand Oak",
    description: "Solid oak stand that lifts screens and hides cables.",
    price: 74,
    currency: "GBP",
    stock: 19,
    category: "Office",
    sellerName: "Deskcraft",
    imageHue: 25,
    popularity: 80,
  },
  {
    id: "prod-018",
    name: "Trail Hiking Socks 3-Pack",
    description: "Cushioned merino blend socks with arch support.",
    price: 24,
    currency: "GBP",
    stock: 85,
    category: "Outdoors",
    sellerName: "Trail & Tide",
    imageHue: 175,
    popularity: 70,
  },
  {
    id: "prod-019",
    name: "Glass Meal Prep Containers",
    description: "Set of four leak-proof glass containers with lids.",
    price: 39,
    currency: "GBP",
    stock: 48,
    category: "Home & Kitchen",
    sellerName: "Harbor Home",
    imageHue: 155,
    popularity: 75,
  },
  {
    id: "prod-020",
    name: "Mechanical Keyboard Compact",
    description: "75% layout with hot-swappable switches and RGB accents.",
    price: 119,
    currency: "GBP",
    stock: 21,
    category: "Electronics",
    sellerName: "Signal Lab",
    imageHue: 250,
    popularity: 89,
  },
  {
    id: "prod-021",
    name: "Everyday Canvas Tote",
    description: "Heavy canvas tote with interior zip pocket.",
    price: 34,
    currency: "GBP",
    stock: 52,
    category: "Apparel",
    sellerName: "Field & Form",
    imageHue: 55,
    popularity: 69,
  },
  {
    id: "prod-022",
    name: "Essential Oil Diffuser",
    description: "Ultrasonic diffuser with soft ambient light modes.",
    price: 44,
    currency: "GBP",
    stock: 30,
    category: "Wellness",
    sellerName: "Calm Studio",
    imageHue: 140,
    popularity: 73,
  },
  {
    id: "prod-023",
    name: "Cable Management Kit",
    description: "Clips, sleeves, and ties to tidy desk cables.",
    price: 16,
    currency: "GBP",
    stock: 110,
    category: "Office",
    sellerName: "Deskcraft",
    imageHue: 60,
    popularity: 64,
  },
  {
    id: "prod-024",
    name: "Camping Lantern Rechargeable",
    description: "Collapsible lantern with USB-C charging and hanging hook.",
    price: 38,
    currency: "GBP",
    stock: 33,
    category: "Outdoors",
    sellerName: "Trail & Tide",
    imageHue: 48,
    popularity: 76,
  },
  {
    id: "prod-025",
    name: "Stoneware Mug Pair",
    description: "Two hand-glazed mugs in complementary teal tones.",
    price: 26,
    currency: "GBP",
    stock: 0,
    category: "Home & Kitchen",
    sellerName: "Harbor Home",
    imageHue: 170,
    popularity: 62,
  },
  {
    id: "prod-026",
    name: "Smart Plug Twin Pack",
    description: "Wi-Fi plugs with scheduling and energy monitoring.",
    price: 29,
    currency: "GBP",
    stock: 45,
    category: "Electronics",
    sellerName: "Signal Lab",
    imageHue: 230,
    popularity: 78,
  },
];

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function categorySlugFromName(name: string) {
  const found = categories.find((c) => c.name === name);
  return found?.slug ?? toSlug(name);
}

export const products: Product[] = rawProducts.map((p) => ({
  ...p,
  slug: toSlug(p.name),
  categorySlug: categorySlugFromName(p.category),
}));

export function getCategoryBySlug(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getProductBySlug(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function filterProducts(filters: CatalogFilters = {}): Product[] {
  let list = [...products];

  if (filters.q?.trim()) {
    const q = filters.q.trim().toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q),
    );
  }

  if (filters.category) {
    list = list.filter(
      (p) =>
        p.categorySlug === filters.category || p.category === filters.category,
    );
  }

  if (typeof filters.min === "number" && !Number.isNaN(filters.min)) {
    list = list.filter((p) => p.price >= filters.min!);
  }

  if (typeof filters.max === "number" && !Number.isNaN(filters.max)) {
    list = list.filter((p) => p.price <= filters.max!);
  }

  if (filters.inStock) {
    list = list.filter((p) => p.stock > 0);
  }

  const sort = filters.sort ?? "featured";
  switch (sort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "name":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "popular":
      list.sort((a, b) => b.popularity - a.popularity);
      break;
    case "featured":
    default:
      list.sort((a, b) => {
        const fa = a.featured ? 1 : 0;
        const fb = b.featured ? 1 : 0;
        if (fb !== fa) return fb - fa;
        return b.popularity - a.popularity;
      });
      break;
  }

  return list;
}

export function parseCatalogSearchParams(
  params: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const get = (key: string) => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const minRaw = get("min");
  const maxRaw = get("max");
  const sortRaw = get("sort") as SortOption | undefined;
  const inStockRaw = get("inStock");

  return {
    q: get("q") || undefined,
    category: get("category") || undefined,
    min: minRaw ? Number(minRaw) : undefined,
    max: maxRaw ? Number(maxRaw) : undefined,
    inStock: inStockRaw === "1" || inStockRaw === "true",
    sort: sortRaw || "featured",
  };
}
