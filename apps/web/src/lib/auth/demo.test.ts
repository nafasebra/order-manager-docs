import { afterEach, describe, expect, it, vi } from "vitest";
import { demoAccounts, demoLogin, demoSession } from "./demo";
import { login } from "./session";
import { setSession } from "./store";
afterEach(() => {
  localStorage.clear();
  setSession(null);
  vi.restoreAllMocks();
});
describe("demo authentication", () => {
  it("signs in every demo role without a network request", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    for (const account of demoAccounts) {
      const user = await login(account.panel, account);
      expect(user.actorType).toBe(account.panel);
      if (account.panel === "buyer") expect(user.buyerId).toBeTruthy();
      if (account.panel === "seller") expect(user.sellerId).toBeTruthy();
    }
    expect(fetchSpy).not.toHaveBeenCalled();
  });
  it("rejects credentials for another panel", () => {
    expect(() => demoLogin("buyer", demoAccounts[0])).toThrow("credentials");
  });
  it("restores the selected session after a module reload", async () => {
    const user = demoSession("buyer");
    setSession(user);
    vi.resetModules();
    const restored = await import("./store");
    expect(restored.getSession()?.buyerId).toBe(user.buyerId);
    restored.setSession(null);
  });
});
