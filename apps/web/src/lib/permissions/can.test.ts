import { describe, expect, it } from "vitest";
import { can } from "@/lib/permissions/can";
import type { SessionUser } from "@/types";

const superuser: SessionUser = {
  id: "1",
  displayName: "Super",
  email: "s@example.com",
  actorType: "staff",
  isSuperuser: true,
};

const support: SessionUser = {
  id: "2",
  displayName: "Support",
  email: "t@example.com",
  actorType: "staff",
  grants: [{ area: "tickets", actions: ["view", "respond"] }],
};

describe("can", () => {
  it("allows superuser everything", () => {
    expect(can(superuser, "orders", "refund")).toBe(true);
  });

  it("respects grants for staff", () => {
    expect(can(support, "tickets", "view")).toBe(true);
    expect(can(support, "orders", "view")).toBe(false);
  });

  it("denies non-staff", () => {
    expect(
      can(
        { ...support, actorType: "seller", grants: undefined },
        "orders",
        "view",
      ),
    ).toBe(false);
  });
});
