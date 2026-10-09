import { beforeEach, describe, expect, it } from "vitest";
import { manageSettlement, sellerSettlementBalance, settlements } from "./settlements";
import { resetDemoData } from "@/mocks/store";
import { orders, transactions } from "@/mocks/fixtures";
import { demoSession } from "@/lib/auth/demo";
import { setSession } from "@/lib/auth/store";

beforeEach(() => {
  resetDemoData();
  setSession(demoSession("admin"));
  const order = orders[0];
  order.status = "delivered";
  transactions.splice(0, transactions.length, {
    id: "settlement-payment", reference: "PAY-TEST", type: "payment", status: "completed",
    amount: order.total, currency: order.currency, sellerId: order.sellerIds[0], orderId: order.id,
    createdAt: new Date().toISOString(),
  });
});

describe("mock settlements", () => {
  it("reserves funds and pays only after approval with a reference", () => {
    const sellerId = orders[0].sellerIds[0];
    const before = sellerSettlementBalance(sellerId).available;
    expect(before).toBeGreaterThan(0);
    const record = manageSettlement({ action: "create", sellerId, reason: "Monthly settlement" });
    expect(sellerSettlementBalance(sellerId).available).toBe(0);
    expect(() => manageSettlement({ action: "pay", id: record.id, reason: "Pay", reference: "BANK-1" })).toThrow();
    manageSettlement({ action: "approve", id: record.id, reason: "Checked" });
    expect(() => manageSettlement({ action: "pay", id: record.id, reason: "Pay" })).toThrow();
    manageSettlement({ action: "pay", id: record.id, reason: "Paid", reference: "BANK-1" });
    expect(record.status).toBe("paid");
    expect(transactions.at(-1)?.type).toBe("payout");
    expect(sellerSettlementBalance(sellerId).paid).toBe(before);
    expect(() => manageSettlement({ action: "pay", id: record.id, reason: "Duplicate", reference: "BANK-2" })).toThrow();
  });

  it("rejection releases reserved funds", () => {
    const sellerId = orders[0].sellerIds[0];
    const before = sellerSettlementBalance(sellerId).available;
    const record = manageSettlement({ action: "create", sellerId, reason: "Review" });
    manageSettlement({ action: "reject", id: record.id, reason: "Incorrect details" });
    expect(sellerSettlementBalance(sellerId).available).toBe(before);
    expect(record.history.at(-1)?.reason).toBe("Incorrect details");
  });

  it("prevents non-staff settlement management and resets records", () => {
    setSession(demoSession("seller"));
    expect(() => manageSettlement({ action: "create", sellerId: orders[0].sellerIds[0], reason: "Self payout" })).toThrow("permission");
    resetDemoData();
    expect(settlements).toEqual([]);
  });
});
