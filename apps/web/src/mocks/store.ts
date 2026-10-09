import * as fixtures from "./fixtures";
import { exportCouponState, restoreCouponState } from "@/lib/api/sellerCoupons";
import { template } from "@/config/template";
import { synchronizeDerivedData } from "./derived";
import { settlements, restoreSettlements } from "@/lib/api/settlements";

const key = "clean-commerce:data:v1";
const collections = {
  admins: fixtures.admins,
  blogPosts: fixtures.blogPosts,
  buyers: fixtures.buyers,
  campaigns: fixtures.campaigns,
  categories: fixtures.categories,
  crmContacts: fixtures.crmContacts,
  invoices: fixtures.invoices,
  orders: fixtures.orders,
  productReports: fixtures.productReports,
  products: fixtures.products,
  questions: fixtures.questions,
  reviews: fixtures.reviews,
  sellers: fixtures.sellers,
  sitePages: fixtures.sitePages,
  tickets: fixtures.tickets,
  transactions: fixtures.transactions,
};
function snapshot() {
  return {
    version: 1,
    settlements,
    collections,
    siteContext: fixtures.siteContext,
    roles: fixtures.roleTemplates,
    coupons: exportCouponState(),
  };
}
synchronizeDerivedData();
const initial = structuredClone(snapshot());

export function persistDemoData(): boolean {
  if (!template.demo) return true;
  synchronizeDerivedData();
  try {
    localStorage.setItem(key, JSON.stringify(snapshot()));
    return true;
  } catch {
    return false;
  }
}
export function resetDemoData() {
  restoreSettlements(structuredClone(initial.settlements));
  for (const name of Object.keys(collections) as (keyof typeof collections)[]) {
    const target = collections[name] as { id: string }[];
    target.splice(
      0,
      target.length,
      ...structuredClone(initial.collections[name]),
    );
  }
  Object.assign(fixtures.siteContext, structuredClone(initial.siteContext));
  Object.assign(fixtures.roleTemplates, structuredClone(initial.roles));
  restoreCouponState(structuredClone(initial.coupons));
  try {
    localStorage.removeItem(key);
    localStorage.removeItem("clean-commerce:health-settings");
  } catch {
    /* Reset still works for this session. */
  }
}
function restore() {
  if (!template.demo) return;
  try {
    const stored = JSON.parse(
      localStorage.getItem(key) ?? "null",
    ) as ReturnType<typeof snapshot> | null;
    if (!stored || stored.version !== 1) return;
    // Reject incompatible snapshots rather than partially restoring a broken demo.
    for (const name of Object.keys(
      collections,
    ) as (keyof typeof collections)[]) {
      if (
        !Array.isArray(stored.collections?.[name]) ||
        !stored.collections[name].every(
          (item) => item && typeof item.id === "string",
        )
      )
        return;
    }
    if (
      !stored.siteContext ||
      typeof stored.siteContext.name !== "string" ||
      !stored.coupons ||
      !stored.roles
    )
      return;
    restoreSettlements(stored.settlements ?? []);
    restoreCouponState(stored.coupons);
    for (const name of Object.keys(
      collections,
    ) as (keyof typeof collections)[]) {
      const target = collections[name] as { id: string }[];
      target.splice(0, target.length, ...stored.collections[name]);
    }
    Object.assign(fixtures.siteContext, stored.siteContext);
    Object.assign(fixtures.roleTemplates, stored.roles);
  } catch {
    /* Invalid or unavailable storage falls back to seeded records. */
  }
}
restore();
