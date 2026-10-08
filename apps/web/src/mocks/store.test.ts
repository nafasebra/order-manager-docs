import { describe, expect, it, vi } from "vitest";
describe("demo storage", () => {
  it("restores saved changes after reload and resets records and coupons", async () => {
    localStorage.clear();
    vi.resetModules();
    const store = await import("./store");
    const fixtures = await import("./fixtures");
    const coupons = await import("@/lib/api/sellerCoupons");
    const original = fixtures.products[0].stock;
    fixtures.products[0].stock = 765;
    const couponState = coupons.exportCouponState();
    couponState.coupons[0].enabled = false;
    coupons.restoreCouponState(couponState);
    expect(store.persistDemoData()).toBe(true);
    vi.resetModules();
    const restored = await import("./store");
    const restoredFixtures = await import("./fixtures");
    const restoredCoupons = await import("@/lib/api/sellerCoupons");
    expect(restoredFixtures.products[0].stock).toBe(765);
    expect(restoredCoupons.exportCouponState().coupons[0].enabled).toBe(false);
    restored.resetDemoData();
    expect(restoredFixtures.products[0].stock).toBe(original);
    expect(restoredCoupons.exportCouponState().coupons[0].enabled).toBe(true);
    expect(localStorage.getItem("clean-commerce:data:v1")).toBeNull();
  });
  it("ignores malformed saved data", async () => {
    localStorage.setItem("clean-commerce:data:v1", "{broken");
    vi.resetModules();
    await import("./store");
    expect((await import("./fixtures")).products.length).toBeGreaterThan(0);
    localStorage.clear();
  });
});
