import { describe, expect, it } from "vitest";
import { sellerOrderView, sellerOrderTransactions } from "./sellerCommerce";
import { orders } from "@/mocks/fixtures";
describe("seller order privacy", () => {
  it("hides whole-order transactions on multi-store orders", () => {
    const order = orders.find((item) => item.sellerIds.length > 1)!;
    expect(sellerOrderTransactions(order.sellerIds[0], order.id)).toEqual([]);
  });

  it("rejects transactions belonging to another seller's order", () => {
    expect(() => sellerOrderTransactions("unknown-seller", orders[0].id)).toThrow(
      "Order not found in your shop.",
    );
  });

  it("returns only the store's payment and refund records", () => {
    const order = orders.find((item) => item.sellerIds.length === 1)!;
    const records = sellerOrderTransactions(order.sellerIds[0], order.id);
    expect(records.length).toBeGreaterThan(0);
    expect(records.every((item) => item.sellerId === order.sellerIds[0] && item.orderId === order.id && ["payment", "refund"].includes(item.type))).toBe(true);
  });

  it("returns only the selected store's items and subtotal", () => {
    const order = orders.find((item) => item.sellerIds.length > 1)!;
    const sellerId = order.sellerIds[0];
    const view = sellerOrderView(order, sellerId);
    expect(view.lineItems.length).toBeGreaterThan(0);
    expect(view.lineItems.every((line) => line.sellerId === sellerId)).toBe(
      true,
    );
    expect(view.total).toBe(
      view.lineItems.reduce(
        (sum, line) => sum + line.unitPrice * line.quantity,
        0,
      ),
    );
    expect(order.lineItems.length).toBeGreaterThan(view.lineItems.length);
  });
});
