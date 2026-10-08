import { campaigns, products, sellers, transactions } from "@/mocks/fixtures";

export type HealthSettings = { lowStock: number; staleDays: number };
export const defaultHealthSettings: HealthSettings = { lowStock: 5, staleDays: 30 };
export type HealthIssue = {
  id: string;
  severity: "critical" | "warning";
  area: string;
  tenantId: string;
  store: string;
  title: string;
  detail: string;
  recommendation: string;
  detectedAt: string;
  target: "/admin/products" | "/admin/sellers" | "/admin/transactions" | "/admin/marketing" | "/admin/coupons";
};

export function buildHealthSnapshot(settings: HealthSettings, now = new Date()) {
  const issues: HealthIssue[] = [];
  const at = now.toISOString();
  const add = (issue: Omit<HealthIssue, "detectedAt">) => issues.push({ ...issue, detectedAt: at });
  for (const seller of sellers.filter((store) => store.status === "enabled")) {
    const base = { tenantId: seller.id, store: seller.shopName, area: "Store configuration", target: "/admin/sellers" as const };
    if (!seller.paymentWays.some((way) => way.enabled)) {
      add({ ...base, id: `payment-${seller.id}`, severity: "critical", title: "No payment method enabled", detail: "Buyers cannot select a payment method for this store.", recommendation: "Review the seller's payment settings and enable an available payment method." });
    }
    if (!seller.deliveryMethods.some((way) => way.enabled)) {
      add({ ...base, id: `delivery-${seller.id}`, severity: "critical", title: "No delivery method enabled", detail: "This store has no enabled delivery options.", recommendation: "Review the seller's delivery settings and enable an available delivery method." });
    }
  }
  for (const product of products.filter((item) => item.status === "published" && !item.moderation?.blocked)) {
    const base = { tenantId: product.sellerId, store: product.sellerName, target: "/admin/products" as const };
    if (product.stock <= settings.lowStock) {
      add({ ...base, id: `stock-${product.id}`, severity: product.stock <= 0 ? "critical" : "warning", area: "Inventory", title: `${product.name}: ${product.stock <= 0 ? "out of stock" : "low stock"}`, detail: `SKU ${product.sku} has ${product.stock} units available.`, recommendation: "Contact the seller to confirm stock and replenish inventory." });
    }
    if (!product.description.trim() || !product.category.trim() || !Number.isFinite(product.price) || product.price <= 0) {
      add({ ...base, id: `catalog-${product.id}`, severity: "warning", area: "Catalog", title: `${product.name}: incomplete product information`, detail: "A published product is missing a description, category, or valid price.", recommendation: "Ask the seller to correct the product information; review platform eligibility." });
    }
    if (Date.parse(product.updatedAt) < now.getTime() - settings.staleDays * 86400000) {
      add({ ...base, id: `stale-${product.id}`, severity: "warning", area: "Inventory", title: `${product.name}: update overdue`, detail: `Product was last updated on ${product.updatedAt.slice(0, 10)}. This signals a review is due; it does not confirm a sync failure.`, recommendation: "Ask the seller to verify product details and current stock." });
    }
  }
  for (const transaction of transactions.filter((item) => item.status === "failed")) {
    add({ id: `transaction-${transaction.id}`, severity: "critical", area: "Payments", tenantId: transaction.sellerId ?? "", store: sellers.find((seller) => seller.id === transaction.sellerId)?.shopName ?? "Platform", title: `Failed ${transaction.type}: ${transaction.reference}`, detail: transaction.note || "A transaction has a recorded failure status.", recommendation: "Review the transaction and payment provider before retrying or contacting the seller.", target: "/admin/transactions" });
  }
  for (const campaign of campaigns.filter((item) => item.status === "active" && Date.parse(item.endsAt) < now.getTime())) {
    add({ id: `campaign-${campaign.id}`, severity: "warning", area: "Promotions", tenantId: "", store: "Platform", title: `${campaign.code}: active campaign past end date`, detail: "The campaign is still marked active after its configured end date.", recommendation: "Review the campaign schedule and end the expired promotion.", target: "/admin/marketing" });
  }
  const stores = sellers.map((seller) => {
    const rows = issues.filter((issue) => issue.tenantId === seller.id);
    const critical = rows.filter((issue) => issue.severity === "critical").length;
    return { id: seller.id, name: seller.shopName, status: seller.status === "disabled" ? "Disabled" : critical ? "Critical" : rows.length ? "Needs attention" : "Healthy", critical, warnings: rows.length - critical, products: products.filter((product) => product.sellerId === seller.id).length };
  });
  return { issues, stores, checkedAt: at };
}

// Fixture monitor values; no live network probes or background job retries.
export const healthServices = [
  { name: "Storefront API", status: "Operational", metric: "142 ms response", detail: "Demo response-time monitor." },
  { name: "Payment provider", status: "Operational", metric: "Connected", detail: "Demo gateway connectivity monitor." },
  { name: "Order webhooks", status: "Degraded", metric: "3 deliveries pending", detail: "Demo delivery queue; inspect delivery logs in the connected provider." },
  { name: "Email delivery", status: "Degraded", metric: "12 messages queued", detail: "Demo email queue monitor." },
  { name: "Inventory sync job", status: "Degraded", metric: "Last run failed", detail: "Demo scheduled job monitor." },
  { name: "Staff security", status: "Unknown", metric: "2FA data unavailable", detail: "Connect an identity provider to report staff security status." },
];
