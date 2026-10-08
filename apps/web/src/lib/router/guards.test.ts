import { describe, expect, it, vi } from "vitest";
import {
  requireBuyerSession,
  requireGrant,
  requireSellerSession,
  requireStaffSession,
} from "./guards";
import { demoSession } from "@/lib/auth/demo";
import { can } from "@/lib/permissions/can";
describe("route guards", () => {
  it("rejects missing and wrong-panel sessions", () => {
    const missing = { getSession: () => null, can };
    expect(() => requireStaffSession({ context: missing })).toThrow();
    const buyer = { getSession: () => demoSession("buyer"), can };
    expect(() => requireSellerSession({ context: buyer })).toThrow();
    expect(requireBuyerSession({ context: buyer }).user.buyerId).toBeTruthy();
  });
  it("enforces Support and Editor grants", () => {
    const support = { getSession: () => demoSession("support"), can };
    expect(() => requireGrant(support, "tickets", "respond")).not.toThrow();
    expect(() => requireGrant(support, "orders", "update_status")).toThrow();
    const editor = { getSession: () => demoSession("editor"), can };
    expect(() => requireGrant(editor, "website", "edit")).not.toThrow();
    expect(() => requireGrant(editor, "transactions", "view")).toThrow();
  });
  it("disables a feature route when configured off", async () => {
    vi.doMock("@/config/template", () => ({
      template: {
        modules: {
          marketing: false,
          coupons: true,
          health: true,
          content: true,
        },
      },
    }));
    vi.resetModules();
    const guards = await import("./guards");
    expect(() => guards.requireFeature("marketing")).toThrow();
    vi.doUnmock("@/config/template");
    vi.resetModules();
  });
});
