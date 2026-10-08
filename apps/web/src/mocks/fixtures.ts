import type {
  Address,
  AdminAccount,
  AdminStats,
  BlogPost,
  Buyer,
  Campaign,
  Category,
  CrmContact,
  Invoice,
  IncomePoint,
  Grant,
  Order,
  OrderStatus,
  Product,
  ProductReport,
  Question,
  Review,
  Seller,
  SellerProductStat,
  SellerStats,
  SiteContext,
  SitePage,
  Ticket,
  Transaction,
  WaySettingRow,
} from "@/types";

import { template } from "@/config/template";
import { readHealthSettings } from "@/config/health";
import { seedDate } from "./clock";

function pad(n: number, width = 4) {
  return String(n).padStart(width, "0");
}

function daysAgo(n: number) {
  return seedDate(-n);
}

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

const orderStatuses: OrderStatus[] = [
  "processing",
  "shipping",
  "delivered",
  "canceled",
];

const defaultWays = (prefix: string): WaySettingRow[] => [
  {
    id: `${prefix}-std`,
    name: "Standard shipping",
    enabled: true,
    label: "Standard",
    instructions: "3–5 business days",
    sortOrder: 1,
  },
  {
    id: `${prefix}-exp`,
    name: "Express",
    enabled: true,
    label: "Express",
    instructions: "1–2 business days",
    sortOrder: 2,
  },
  {
    id: `${prefix}-pickup`,
    name: "Pickup",
    enabled: false,
    label: "Store pickup",
    instructions: "",
    sortOrder: 3,
  },
];

const defaultPayments = (prefix: string): WaySettingRow[] => [
  {
    id: `${prefix}-cod`,
    name: "Cash on delivery",
    enabled: true,
    label: "COD",
    instructions: "Pay on delivery",
    sortOrder: 1,
  },
  {
    id: `${prefix}-bank`,
    name: "Bank transfer",
    enabled: true,
    label: "Bank transfer",
    instructions: "Include order number",
    sortOrder: 2,
  },
  {
    id: `${prefix}-card`,
    name: "Card",
    enabled: false,
    label: "Card",
    instructions: "",
    sortOrder: 3,
  },
];

function makeAddress(id: string, label: string): Address {
  return {
    id,
    label,
    line1: `${10 + (id.length % 80)} High Street`,
    city: pick(["London", "Manchester", "Bristol", "Leeds"], id.charCodeAt(0)),
    postalCode: `SW1A ${pad(id.charCodeAt(0) % 9, 1)}AA`,
    country: "GB",
    isDefault: label === "Home",
  };
}

const firstNames = [
  "Sarah",
  "John",
  "Emma",
  "James",
  "Olivia",
  "Liam",
  "Ava",
  "Noah",
  "Mia",
  "Ethan",
];
const lastNames = [
  "Miller",
  "Smith",
  "Brown",
  "Wilson",
  "Taylor",
  "Anderson",
  "Thomas",
  "Jackson",
  "White",
  "Harris",
];
const shopNames = [
  "Northwind Goods",
  "Cedar & Co",
  "Blue Harbor",
  "Pixel Supply",
  "Greenfield Market",
  "Atlas Outfitters",
  "Summit Home",
  "Orbit Tech",
  "Lumen Living",
  "Forge Tools",
];
const categoryNames = [
  "Electronics",
  "Home",
  "Fashion",
  "Sports",
  "Beauty",
  "Books",
];
const productNames = [
  "Wireless earbuds",
  "Desk lamp",
  "Linen throw",
  "Running shoes",
  "Ceramic mug",
  "Backpack",
  "Notebook set",
  "Yoga mat",
  "Bluetooth speaker",
  "Kitchen knife",
];

export const buyers: Buyer[] = Array.from({ length: 60 }, (_, i) => {
  const n = i + 1;
  const name = `${pick(firstNames, i)} ${pick(lastNames, i + 3)}`;
  return {
    id: `buyer-${pad(n)}`,
    name,
    email: `buyer${n}@example.com`,
    username: `buyer${n}`,
    status: i % 17 === 0 ? "suspended" : "active",
    createdAt: daysAgo(200 - i),
    orderCount: (i % 12) + 1,
    ticketCount: i % 5,
    addresses: [
      makeAddress(`buyer-${pad(n)}-home`, "Home"),
      makeAddress(`buyer-${pad(n)}-work`, "Work"),
    ],
  };
});

export const sellers: Seller[] = Array.from({ length: 40 }, (_, i) => {
  const n = i + 1;
  const shopName = pick(shopNames, i);
  return {
    id: `seller-${pad(n)}`,
    shopName: `${shopName} ${n > 10 ? n : ""}`.trim(),
    contactName: `${pick(firstNames, i + 2)} ${pick(lastNames, i)}`,
    email: `seller${n}@example.com`,
    status: i % 11 === 0 ? "disabled" : "enabled",
    createdAt: daysAgo(300 - i * 2),
    productCount: 5 + (i % 20),
    orderCount: 10 + (i % 40),
    deliveryMethods: defaultWays(`seller-${pad(n)}`),
    paymentWays: defaultPayments(`seller-${pad(n)}`),
    workplaceAddress: makeAddress(`seller-${pad(n)}-hq`, "HQ"),
  };
});

export const products: Product[] = Array.from({ length: 80 }, (_, i) => {
  const n = i + 1;
  const seller = pick(sellers, i);
  const status =
    i % 15 === 0 ? "draft" : i % 23 === 0 ? "archived" : "published";
  return {
    id: `prod-${pad(n)}`,
    name: `${pick(productNames, i)} ${n}`,
    sku: `SKU-${pad(n, 5)}`,
    sellerId: seller.id,
    sellerName: seller.shopName,
    price: 12 + ((i * 7) % 200) + (i % 10) * 0.5,
    currency: template.currency,
    stock: (i * 3) % 120,
    status,
    category: pick(categoryNames, i),
    createdAt: daysAgo(180 - (i % 160)),
    updatedAt: daysAgo(i % 40),
    description: `Quality ${pick(productNames, i).toLowerCase()} from ${seller.shopName}.`,
  };
});

export const categories: Category[] = categoryNames.map((name, index) => ({
  id: `category-${pad(index + 1)}`,
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  productCount: products.filter((product) => product.category === name).length,
  publishedProductCount: products.filter(
    (product) => product.category === name && product.status === "published",
  ).length,
}));

export const orders: Order[] = Array.from({ length: 120 }, (_, i) => {
  const n = i + 1;
  const buyer = pick(buyers, i);
  const sellerA = pick(sellers, i);
  const sellerB = pick(sellers, i + 5);
  const status = pick(orderStatuses, i);
  const product = products.find((item) => item.sellerId === sellerA.id)!;
  const secondProduct = products.find((item) => item.sellerId === sellerB.id)!;
  const qty = (i % 3) + 1;
  const unitPrice = product.price;
  const lineItems = [
    {
      id: `li-${pad(n)}-1`,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      quantity: qty,
      unitPrice,
      sellerId: sellerA.id,
      sellerName: sellerA.shopName,
    },
    ...(i % 8 === 0
      ? [
          {
            id: `li-${pad(n)}-2`,
            productId: secondProduct.id,
            productName: secondProduct.name,
            sku: secondProduct.sku,
            quantity: 1,
            unitPrice: secondProduct.price,
            sellerId: sellerB.id,
            sellerName: sellerB.shopName,
          },
        ]
      : []),
  ];
  const total =
    Math.round(
      lineItems.reduce((sum, line) => sum + line.quantity * line.unitPrice, 0) *
        100,
    ) / 100;
  const createdAt = daysAgo(90 - (i % 90));
  return {
    id: `order-${pad(n)}`,
    orderNumber: `ORD-${10000 + n}`,
    status,
    buyerId: buyer.id,
    buyerName: buyer.name,
    buyerEmail: buyer.email,
    sellerIds: [sellerA.id, ...(i % 8 === 0 ? [sellerB.id] : [])],
    sellerNames: [sellerA.shopName, ...(i % 8 === 0 ? [sellerB.shopName] : [])],
    total,
    currency: template.currency,
    createdAt,
    updatedAt: daysAgo(Math.max(0, 90 - (i % 90) - 1)),
    shippingAddress: buyer.addresses[0],
    deliveryMethodSnapshot: "Standard shipping — 3–5 business days",
    paymentWaySnapshot: "Bank transfer — Include order number",
    lineItems,
    history: [
      {
        id: `oh-${pad(n)}-1`,
        status: "processing",
        at: createdAt,
        by: "system",
      },
      ...(status !== "processing"
        ? [
            {
              id: `oh-${pad(n)}-2`,
              status,
              at: daysAgo(Math.max(0, 90 - (i % 90) - 1)),
              by: "staff",
              note: status === "canceled" ? "Customer request" : undefined,
            },
          ]
        : []),
    ],
    version: 1 + (i % 3),
  };
});

export const tickets: Ticket[] = Array.from({ length: 50 }, (_, i) => {
  const n = i + 1;
  const buyer = pick(buyers, i);
  const statuses = [
    "open",
    "in_progress",
    "waiting",
    "resolved",
    "closed",
  ] as const;
  const status = pick(statuses, i);
  const channel = i % 3 === 0 ? "buyer_seller" : "site";
  const seller = channel === "buyer_seller" ? pick(sellers, i) : undefined;
  const order = pick(orders, i);
  return {
    id: `ticket-${pad(n)}`,
    ticketNumber: `TKT-${900 + n}`,
    subject: pick(
      [
        "Order delayed",
        "Wrong item received",
        "Refund question",
        "Account access",
        "Product inquiry",
      ],
      i,
    ),
    status,
    priority: pick(["low", "medium", "high", "urgent"] as const, i),
    channel,
    requesterId: buyer.id,
    requesterName: buyer.name,
    sellerId: seller?.id,
    sellerName: seller?.shopName,
    assigneeId: i % 2 === 0 ? "adm-1" : undefined,
    assigneeName: i % 2 === 0 ? "Nafas Admin" : undefined,
    relatedOrderId: i % 2 === 0 ? order.id : undefined,
    relatedProductId: i % 5 === 0 ? pick(products, i).id : undefined,
    createdAt: daysAgo(60 - (i % 60)),
    updatedAt: daysAgo(i % 20),
    messages: Array.from({ length: 3 + (i % 5) }, (_, m) => ({
      id: `tm-${pad(n)}-${m}`,
      authorId: m % 2 === 0 ? buyer.id : "adm-1",
      authorName: m % 2 === 0 ? buyer.name : "Nafas Admin",
      authorType: (m % 2 === 0 ? "buyer" : "staff") as "buyer" | "staff",
      body:
        m === 0
          ? `Hello, I need help with ${order.orderNumber}.`
          : `Update ${m}: we are looking into this.`,
      createdAt: daysAgo(60 - (i % 60) - m),
      internal: m === 2 && i % 4 === 0,
    })),
  };
});

export const invoices: Invoice[] = Array.from({ length: 40 }, (_, i) => {
  const n = i + 1;
  const order = pick(orders, i);
  const statuses = ["draft", "issued", "paid", "void"] as const;
  const status = pick(statuses, i);
  return {
    id: `inv-${pad(n)}`,
    invoiceNumber: `INV-${2000 + n}`,
    status,
    buyerId: order.buyerId,
    buyerName: order.buyerName,
    orderId: order.id,
    orderNumber: order.orderNumber,
    total: order.total,
    currency: template.currency,
    issuedAt: status === "draft" ? undefined : daysAgo(50 - (i % 50)),
    createdAt: daysAgo(55 - (i % 50)),
    lines: order.lineItems.map((li) => ({
      id: `il-${li.id}`,
      description: li.productName,
      quantity: li.quantity,
      unitPrice: li.unitPrice,
    })),
  };
});

export const transactions: Transaction[] = Array.from(
  { length: 70 },
  (_, i) => {
    const n = i + 1;
    const order = pick(orders, i);
    const types = ["payment", "refund", "payout", "adjustment"] as const;
    const type = pick(types, i);
    const statuses = ["pending", "completed", "failed"] as const;
    return {
      id: `txn-${pad(n)}`,
      reference: `TXN-${5000 + n}`,
      type,
      status: pick(statuses, i),
      amount: type === "refund" ? -order.total * 0.5 : order.total,
      currency: template.currency,
      orderId: order.id,
      invoiceId: pick(invoices, i).id,
      buyerId: order.buyerId,
      sellerId: order.sellerIds[0],
      externalRef: `ext_${pad(n, 6)}`,
      createdAt: daysAgo(45 - (i % 45)),
      note: type === "refund" ? "Partial refund" : undefined,
    };
  },
);

export const reviews: Review[] = Array.from({ length: 45 }, (_, i) => {
  const n = i + 1;
  const product = pick(products, i);
  const buyer = pick(buyers, i);
  const statuses = ["pending", "approved", "hidden", "deleted"] as const;
  return {
    id: `rev-${pad(n)}`,
    productId: product.id,
    productName: product.name,
    buyerId: buyer.id,
    buyerName: buyer.name,
    rating: 1 + (i % 5),
    title: pick(["Great", "Okay", "Not as expected", "Love it", "Solid"], i),
    body: "Detailed customer feedback about the product quality and shipping.",
    status: pick(statuses, i),
    createdAt: daysAgo(40 - (i % 40)),
    response: i % 4 === 0 ? "Thanks for your feedback!" : undefined,
  };
});

export const questions: Question[] = Array.from({ length: 35 }, (_, i) => {
  const n = i + 1;
  const product = pick(products, i + 2);
  const buyer = pick(buyers, i + 1);
  const statuses = ["pending", "approved", "hidden"] as const;
  return {
    id: `qa-${pad(n)}`,
    productId: product.id,
    productName: product.name,
    askerId: buyer.id,
    askerName: buyer.name,
    body: "Does this come with a warranty / size guide?",
    answer: i % 3 === 0 ? "Yes — 12 month warranty included." : undefined,
    status: pick(statuses, i),
    createdAt: daysAgo(35 - (i % 35)),
  };
});

export const productReports: ProductReport[] = Array.from(
  { length: 25 },
  (_, i) => {
    const n = i + 1;
    const product = pick(products, i + 4);
    const buyer = pick(buyers, i + 2);
    const statuses = [
      "open",
      "investigating",
      "resolved",
      "dismissed",
    ] as const;
    return {
      id: `rpt-${pad(n)}`,
      productId: product.id,
      productName: product.name,
      reporterId: buyer.id,
      reporterName: buyer.name,
      reason: pick(
        ["Misleading listing", "Counterfeit concern", "Unsafe product", "Spam"],
        i,
      ),
      evidence: "Screenshot attached (mock).",
      status: pick(statuses, i),
      createdAt: daysAgo(30 - (i % 30)),
      resolution: i % 4 === 2 ? "Seller asked to edit listing" : undefined,
    };
  },
);

export const campaigns: Campaign[] = Array.from({ length: 20 }, (_, i) => {
  const n = i + 1;
  const statuses = ["draft", "scheduled", "active", "paused", "ended"] as const;
  const status = pick(statuses, i);
  const campaignDate = seedDate;
  return {
    id: `camp-${pad(n)}`,
    name:
      pick(
        ["Spring sale", "Welcome 10%", "Free ship weekend", "Flash deal"],
        i,
      ) + ` ${n}`,
    status,
    discountType: i % 2 === 0 ? "percent" : "fixed",
    discountValue: i % 2 === 0 ? 10 + (i % 15) : 5 + (i % 20),
    code: `SAVE${pad(n, 3)}`,
    tenantIds:
      i % 3 === 0
        ? []
        : sellers.slice(i % 5, (i % 5) + 2).map((seller) => seller.id),
    channel: pick(["storefront", "email", "social"] as const, i),
    budget: 500 + i * 100,
    usageLimit: 500,
    description: "Marketplace promotion with participating store targeting.",
    createdBy: "Template admin",
    startsAt: campaignDate(status === "scheduled" ? 2 : -14),
    endsAt: campaignDate(status === "ended" ? -1 : 14),
    usageCount: i * 12,
    revenueAttributed: i * 340.5,
    createdAt: daysAgo(25 - (i % 20)),
  };
});

export const crmContacts: CrmContact[] = [
  ...buyers.slice(0, 30).map((b, i) => ({
    id: `crm-b-${pad(i + 1)}`,
    name: b.name,
    email: b.email,
    type: "buyer" as const,
    linkedId: b.id,
    tags: i % 3 === 0 ? ["vip"] : i % 2 === 0 ? ["repeat"] : ["new"],
    notes: "",
    lastActivityAt: daysAgo(i % 25),
    createdAt: b.createdAt,
  })),
  ...sellers.slice(0, 20).map((s, i) => ({
    id: `crm-s-${pad(i + 1)}`,
    name: s.shopName,
    email: s.email,
    type: "seller" as const,
    linkedId: s.id,
    tags: ["vendor"],
    notes: "",
    lastActivityAt: daysAgo(i % 20),
    createdAt: s.createdAt,
  })),
];

export const siteContext: SiteContext = {
  name: "Clean Commerce Market",
  tagline: "Trusted marketplace for modern shops",
  contactEmail: "hello@cleancommerce.example",
  contactPhone: "+44 20 7946 0000",
  defaultSeoTitle: "Clean Commerce Market",
  defaultSeoDescription: "Buy and sell with confidence.",
  homepageCopy: "Discover products from independent sellers.",
};

export const sitePages: SitePage[] = [
  {
    id: "page-1",
    title: "About",
    slug: "about",
    status: "published",
    updatedAt: daysAgo(10),
    body: "About our marketplace.",
  },
  {
    id: "page-2",
    title: "Terms",
    slug: "terms",
    status: "published",
    updatedAt: daysAgo(20),
    body: "Terms of service…",
  },
  {
    id: "page-3",
    title: "Privacy",
    slug: "privacy",
    status: "published",
    updatedAt: daysAgo(20),
    body: "Privacy policy…",
  },
  {
    id: "page-4",
    title: "FAQ",
    slug: "faq",
    status: "draft",
    updatedAt: daysAgo(2),
    body: "Frequently asked questions…",
  },
];

export const blogPosts: BlogPost[] = Array.from({ length: 18 }, (_, i) => {
  const n = i + 1;
  const statuses = ["draft", "published", "archived"] as const;
  const status = pick(statuses, i);
  return {
    id: `post-${pad(n)}`,
    title: `Marketplace tips ${n}`,
    slug: `marketplace-tips-${n}`,
    status,
    excerpt: "Short excerpt for the post list.",
    body: "Full post body (plain text placeholder for TipTap).",
    publishedAt: status === "published" ? daysAgo(15 - (i % 15)) : undefined,
    createdAt: daysAgo(30 - (i % 25)),
    updatedAt: daysAgo(i % 10),
    comments: Array.from({ length: i % 4 }, (_, c) => ({
      id: `bc-${pad(n)}-${c}`,
      authorName: pick(firstNames, c + i),
      body: "Interesting read!",
      status: pick(["pending", "approved", "hidden"] as const, c),
      createdAt: daysAgo(c),
    })),
  };
});

export const admins: AdminAccount[] = [
  {
    id: "adm-1",
    name: "Nafas Admin",
    email: "admin@example.com",
    role: "admin",
    isSuperuser: true,
    status: "active",
    grants: [],
    createdAt: daysAgo(400),
  },
  {
    id: "adm-2",
    name: "Support Lead",
    email: "support@example.com",
    role: "support",
    isSuperuser: false,
    status: "active",
    grants: [
      { area: "tickets", actions: ["view", "respond", "update_status"] },
      { area: "buyers", actions: ["view"] },
      { area: "sellers", actions: ["view"] },
      { area: "orders", actions: ["view"] },
    ],
    createdAt: daysAgo(200),
  },
  {
    id: "adm-3",
    name: "Content Editor",
    email: "editor@example.com",
    role: "editor",
    isSuperuser: false,
    status: "active",
    grants: [
      { area: "website", actions: ["view", "edit", "create"] },
      { area: "blog", actions: ["view", "edit", "create", "moderate"] },
    ],
    createdAt: daysAgo(100),
  },
];

export const roleTemplates: Record<"support" | "editor" | "custom", Grant[]> = {
  support: structuredClone(admins[1].grants),
  editor: structuredClone(admins[2].grants),
  custom: [],
};

function buildIncomeStats(sellerId?: string): IncomePoint[] {
  const scoped = transactions.filter(
    (transaction) => !sellerId || transaction.sellerId === sellerId,
  );
  return Array.from({ length: 90 }, (_, index) => {
    const date = daysAgo(89 - index).slice(0, 10);
    const daily = scoped.filter((transaction) =>
      transaction.createdAt.startsWith(date),
    );
    const sum = (type: Transaction["type"], status: Transaction["status"]) =>
      Math.round(
        daily
          .filter(
            (transaction) =>
              transaction.type === type && transaction.status === status,
          )
          .reduce(
            (total, transaction) => total + Math.abs(transaction.amount),
            0,
          ) * 100,
      ) / 100;
    const collected = sum("payment", "completed");
    const refunds = sum("refund", "completed");
    return {
      date,
      collected,
      refunds,
      net: Math.round((collected - refunds) * 100) / 100,
      pending: sum("payment", "pending"),
    };
  });
}

export function buildAdminStats(): AdminStats {
  const delivered = orders.filter((o) => o.status === "delivered");
  const revenue = delivered.reduce((s, o) => s + o.total, 0);
  const salesSeries = Array.from({ length: 30 }, (_, i) => {
    const date = daysAgo(29 - i).slice(0, 10);
    const dayOrders = orders.filter((o) => o.createdAt.startsWith(date));
    return {
      date,
      revenue:
        Math.round(dayOrders.reduce((s, o) => s + o.total, 0) * 100) / 100,
      orders: dayOrders.length,
    };
  });
  const statusMix = orderStatuses.map((status) => ({
    status,
    count: orders.filter((o) => o.status === status).length,
    label:
      status === "processing"
        ? "Processing"
        : status === "shipping"
          ? "Shipping"
          : status === "delivered"
            ? "Delivered"
            : "Canceled",
  }));
  const productTotals = new Map<string, { name: string; value: number }>();
  for (const o of orders) {
    for (const li of o.lineItems) {
      const cur = productTotals.get(li.productId) ?? {
        name: li.productName,
        value: 0,
      };
      cur.value += li.unitPrice * li.quantity;
      productTotals.set(li.productId, cur);
    }
  }
  const topProducts = [...productTotals.entries()]
    .map(([id, v]) => ({
      id,
      name: v.name,
      value: Math.round(v.value * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
  const sellerTotals = new Map<string, { name: string; value: number }>();
  for (const o of orders) {
    o.sellerIds.forEach((sid, idx) => {
      const cur = sellerTotals.get(sid) ?? {
        name: o.sellerNames[idx] ?? sid,
        value: 0,
      };
      cur.value += o.total / o.sellerIds.length;
      sellerTotals.set(sid, cur);
    });
  }
  const topSellers = [...sellerTotals.entries()]
    .map(([id, v]) => ({
      id,
      name: v.name,
      value: Math.round(v.value * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return {
    income: buildIncomeStats(),
    revenue: Math.round(revenue * 100) / 100,
    revenueChange: 7.2,
    orders: orders.length,
    ordersChange: 8.1,
    aov: Math.round((revenue / Math.max(delivered.length, 1)) * 100) / 100,
    aovChange: 3.4,
    openTickets: tickets.filter((t) =>
      ["open", "in_progress", "waiting"].includes(t.status),
    ).length,
    pendingReviews: reviews.filter((r) => r.status === "pending").length,
    salesSeries,
    statusMix,
    topProducts,
    topSellers,
  };
}

export function buildSellerStats(sellerId: string, days?: number): SellerStats {
  const startDate = days ? daysAgo(days - 1).slice(0, 10) : undefined;
  const sellerOrders = orders.filter(
    (o) =>
      o.lineItems.some((item) => item.sellerId === sellerId) &&
      (!startDate || o.createdAt.slice(0, 10) >= startDate),
  );
  const sellerProducts = products.filter((p) => p.sellerId === sellerId);
  const sellerTickets = tickets.filter((t) => t.sellerId === sellerId);

  const delivered = sellerOrders.filter((o) => o.status === "delivered");
  const revenue = delivered.reduce((s, o) => {
    const share = o.lineItems
      .filter((li) => li.sellerId === sellerId)
      .reduce((sum, li) => sum + li.unitPrice * li.quantity, 0);
    return s + (share || o.total / Math.max(o.sellerIds.length, 1));
  }, 0);

  const seriesDays = days ?? 30;
  const salesSeries = Array.from({ length: seriesDays }, (_, i) => {
    const date = daysAgo(seriesDays - 1 - i).slice(0, 10);
    const dayOrders = sellerOrders.filter((o) => o.createdAt.startsWith(date));
    const dayRevenue = dayOrders.reduce((s, o) => {
      const share = o.lineItems
        .filter((li) => li.sellerId === sellerId)
        .reduce((sum, li) => sum + li.unitPrice * li.quantity, 0);
      return s + (share || o.total / Math.max(o.sellerIds.length, 1));
    }, 0);
    return {
      date,
      revenue: Math.round(dayRevenue * 100) / 100,
      orders: dayOrders.length,
    };
  });

  const statusMix = orderStatuses.map((status) => ({
    status,
    count: sellerOrders.filter((o) => o.status === status).length,
    label:
      status === "processing"
        ? "Processing"
        : status === "shipping"
          ? "Shipping"
          : status === "delivered"
            ? "Delivered"
            : "Canceled",
  }));

  const productTotals = new Map<string, { name: string; value: number }>();
  for (const o of sellerOrders) {
    for (const li of o.lineItems) {
      if (li.sellerId !== sellerId) continue;
      const cur = productTotals.get(li.productId) ?? {
        name: li.productName,
        value: 0,
      };
      cur.value += li.unitPrice * li.quantity;
      productTotals.set(li.productId, cur);
    }
  }
  const topProducts = [...productTotals.entries()]
    .map(([id, v]) => ({
      id,
      name: v.name,
      value: Math.round(v.value * 100) / 100,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const productStats = new Map<
    string,
    SellerProductStat & { orderIds: Set<string> }
  >();
  for (const order of sellerOrders) {
    for (const lineItem of order.lineItems) {
      if (lineItem.sellerId !== sellerId) continue;
      const current = productStats.get(lineItem.productId) ?? {
        productId: lineItem.productId,
        name: lineItem.productName,
        sku: lineItem.sku,
        unitsSold: 0,
        orderCount: 0,
        revenue: 0,
        orderIds: new Set<string>(),
      };
      current.unitsSold += lineItem.quantity;
      current.revenue += lineItem.unitPrice * lineItem.quantity;
      current.orderIds.add(order.id);
      current.orderCount = current.orderIds.size;
      productStats.set(lineItem.productId, current);
    }
  }
  const topSellingProducts: SellerProductStat[] = [...productStats.values()]
    .map(({ orderIds: _orderIds, ...stat }) => ({
      ...stat,
      revenue: Math.round(stat.revenue * 100) / 100,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  return {
    income: buildIncomeStats(sellerId),
    itemsOrdered: sellerOrders.reduce(
      (total, order) =>
        total +
        order.lineItems
          .filter((item) => item.sellerId === sellerId)
          .reduce((quantity, item) => quantity + item.quantity, 0),
      0,
    ),
    revenue: Math.round(revenue * 100) / 100,
    revenueChange: 5.4,
    orders: sellerOrders.length,
    ordersChange: 6.2,
    aov: Math.round((revenue / Math.max(delivered.length, 1)) * 100) / 100,
    aovChange: 2.1,
    openTickets: sellerTickets.filter((t) =>
      ["open", "in_progress", "waiting"].includes(t.status),
    ).length,
    salesSeries,
    statusMix,
    topProducts,
    topSellingProducts,
    lowStock: sellerProducts
      .filter(
        (p) =>
          p.stock <= readHealthSettings().lowStock && p.status === "published",
      )
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 8),
    recentTickets: [...sellerTickets]
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      )
      .slice(0, 6),
  };
}
