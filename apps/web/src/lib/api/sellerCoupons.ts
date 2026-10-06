import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type CouponValues = {
  code: string;
  type: "percentage" | "fixed" | "free_shipping";
  value: number;
  usageLimit: number | null;
  registeredOnly: boolean;
  enabled: boolean;
  startsAt: string;
  endsAt: string;
};
export type SellerCoupon = CouponValues & { id: string; sellerId: string; usageCount: number; scope?: "seller" | "platform"; tenantIds?: string[]; productIds?: string[]; createdBy?: string; createdAt?: string; totalDiscount?: number; influencedRevenue?: number; suspended?: boolean };
const coupons: SellerCoupon[] = [];
export type CouponPolicy = { maxPercentage: number; maxValidityDays: number; allowStacking: boolean; unusualUsage: number };
let policy: CouponPolicy = { maxPercentage: 70, maxValidityDays: 90, allowStacking: false, unusualUsage: 100 };
const restrictions: Record<string, string> = {};
const audits: { id: string; couponId?: string; actor: string; action: string; at: string; reason: string }[] = [];
function audit(actor: string, action: string, reason = "", couponId?: string) { audits.unshift({ id: crypto.randomUUID(), actor, action, reason, couponId, at: new Date().toISOString() }); }
export function couponStatus(coupon: SellerCoupon) {
  const today = new Date().toISOString().slice(0, 10);
  if (coupon.suspended) return "Suspended";
  if (!coupon.enabled) return "Disabled";
  if (coupon.endsAt && coupon.endsAt < today) return "Expired";
  if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) return "Exhausted";
  if (coupon.startsAt && coupon.startsAt > today) return "Scheduled";
  return "Active";
}
export function couponFlags(coupon: SellerCoupon) {
  return [coupon.type === "percentage" && coupon.value > policy.maxPercentage ? "High discount" : "", coupon.usageCount >= policy.unusualUsage ? "Unusual usage" : ""].filter(Boolean);
}
function validatePolicy(values: CouponValues) {
  if (values.type === "percentage" && values.value > policy.maxPercentage) throw new Error(`Maximum discount is ${policy.maxPercentage}%.`);
  const start = values.startsAt || new Date().toISOString().slice(0, 10);
  if (!values.endsAt || (Date.parse(values.endsAt) - Date.parse(start)) / 86400000 > policy.maxValidityDays) throw new Error(`Set an expiration within ${policy.maxValidityDays} days of the start date.`);
  if (values.endsAt < start) throw new Error("End date must be on or after the start date.");
}

export function useAdminCoupons() {
  return useQuery({ queryKey: ["admin-coupons"], queryFn: async () => ({ coupons: [...coupons], policy: { ...policy }, restrictions: { ...restrictions }, audits: [...audits] }) });
}
type AdminAction =
  | { action: "save"; id?: string; values: CouponValues; scope: "seller" | "platform"; sellerId: string; tenantIds: string[]; productIds: string[] }
  | { action: "suspend" | "enable" | "delete"; id: string; reason: string }
  | { action: "policy"; policy: CouponPolicy }
  | { action: "restriction"; sellerId: string; blocked: boolean; reason: string };
export function useAdminCouponMutation(actor: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AdminAction) => {
      if (payload.action === "policy") {
        if (!Number.isFinite(payload.policy.maxPercentage) || payload.policy.maxPercentage <= 0 || payload.policy.maxPercentage > 100 || !Number.isInteger(payload.policy.maxValidityDays) || payload.policy.maxValidityDays < 1 || !Number.isInteger(payload.policy.unusualUsage) || payload.policy.unusualUsage < 1) throw new Error("Enter valid policy limits.");
        policy = { ...payload.policy }; audit(actor, "Updated coupon policies"); return;
      }
      if (payload.action === "restriction") {
        if (payload.blocked && !payload.reason.trim()) throw new Error("A restriction reason is required.");
        if (payload.blocked) restrictions[payload.sellerId] = payload.reason.trim(); else delete restrictions[payload.sellerId];
        audit(actor, payload.blocked ? "Restricted tenant creation" : "Restored tenant creation", `${payload.sellerId}: ${payload.reason}`); return;
      }
      const index = payload.id ? coupons.findIndex((coupon) => coupon.id === payload.id) : -1;
      if (payload.id && index < 0) throw new Error("Coupon not found.");
      if (payload.action !== "save") {
        if (!payload.reason.trim()) throw new Error("A reason is required.");
        if (payload.action === "delete") { if (coupons[index].usageCount > 0) throw new Error("Used coupons must be suspended to preserve history."); coupons.splice(index, 1); }
        else { coupons[index].enabled = payload.action === "enable"; coupons[index].suspended = payload.action === "suspend"; }
        audit(actor, payload.action, payload.reason, payload.id); return;
      }
      const values = { ...payload.values, code: payload.values.code.trim().toUpperCase() };
      validatePolicy(values);
      if (!/^[A-Z0-9_-]+$/.test(values.code)) throw new Error("Enter a valid coupon code.");
      if (values.type !== "free_shipping" && (!Number.isFinite(values.value) || values.value <= 0)) throw new Error("Enter a positive discount value.");
      if (values.usageLimit !== null && (!Number.isSafeInteger(values.usageLimit) || values.usageLimit < 1)) throw new Error("Enter a positive usage limit.");
      if (payload.scope === "seller" && !payload.sellerId) throw new Error("Select a seller.");
      const sellerId = payload.scope === "platform" ? "" : payload.sellerId;
      if (coupons.some((coupon) => coupon.id !== payload.id && coupon.code === values.code && (coupon.scope === "platform" || payload.scope === "platform" || coupon.sellerId === sellerId))) throw new Error("This code conflicts with an existing coupon.");
      const id = payload.id ?? crypto.randomUUID();
      const coupon: SellerCoupon = { ...(index >= 0 ? coupons[index] : { usageCount: 0, createdBy: actor, createdAt: new Date().toISOString(), totalDiscount: 0, influencedRevenue: 0 }), ...values, value: values.type === "free_shipping" ? 0 : values.value, id, sellerId, scope: payload.scope, tenantIds: payload.tenantIds, productIds: payload.productIds };
      if (index >= 0) coupons[index] = coupon; else coupons.push(coupon);
      audit(actor, index >= 0 ? "Updated coupon" : "Created coupon", "", id);
    },
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["admin-coupons"] }); void client.invalidateQueries({ queryKey: ["seller-coupons"] }); },
  });
}

export function useSellerCoupons(sellerId: string) {
  return useQuery({
    queryKey: ["seller-coupons", sellerId],
    queryFn: async () => coupons.filter((coupon) => coupon.sellerId === sellerId),
    enabled: Boolean(sellerId),
  });
}

export function useSellerCouponMutation(sellerId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { action: "save"; id?: string; values: CouponValues } | { action: "delete"; id: string }) => {
      if (!sellerId) throw new Error("Shop not found.");
      const index = payload.id ? coupons.findIndex((coupon) => coupon.id === payload.id && coupon.sellerId === sellerId) : -1;
      if (payload.id && index < 0) throw new Error("Coupon not found.");
      if (payload.action === "delete") { if (coupons[index].usageCount > 0) throw new Error("Used coupons cannot be deleted."); coupons.splice(index, 1); audit(sellerId, "Deleted coupon", "", payload.id); return; }
      if (!payload.id && restrictions[sellerId]) throw new Error(`Coupon creation is restricted: ${restrictions[sellerId]}`);
      if (index >= 0 && coupons[index].suspended) throw new Error("This coupon was suspended by an admin.");
      const values = { ...payload.values, code: payload.values.code.trim().toUpperCase() };
      validatePolicy(values);
      if (!/^[A-Z0-9_-]+$/.test(values.code)) throw new Error("Use letters, numbers, hyphens, or underscores for the code.");
      if (coupons.some((coupon) => (coupon.sellerId === sellerId || coupon.scope === "platform") && coupon.id !== payload.id && coupon.code === values.code)) throw new Error("This coupon code already exists.");
      if (values.type !== "free_shipping" && (!Number.isFinite(values.value) || values.value <= 0 || (values.type === "percentage" && values.value > 100))) throw new Error("Enter a valid discount value (percentage cannot exceed 100).");
      if (values.usageLimit !== null && (!Number.isSafeInteger(values.usageLimit) || values.usageLimit < 1)) throw new Error("Usage limit must be a positive whole number.");
      if (values.startsAt && values.endsAt && values.endsAt < values.startsAt) throw new Error("End date must be on or after start date.");
      if (values.type === "free_shipping") values.value = 0;
      if (index >= 0) coupons[index] = { ...coupons[index], ...values };
      else coupons.push({ ...values, id: crypto.randomUUID(), sellerId, scope: "seller", usageCount: 0, createdBy: sellerId, createdAt: new Date().toISOString(), totalDiscount: 0, influencedRevenue: 0 });
      audit(sellerId, index >= 0 ? "Updated coupon" : "Created coupon", "", index >= 0 ? payload.id : coupons[coupons.length - 1].id);
    },
    onSuccess: () => { void client.invalidateQueries({ queryKey: ["seller-coupons", sellerId] }); void client.invalidateQueries({ queryKey: ["admin-coupons"] }); },
  });
}
