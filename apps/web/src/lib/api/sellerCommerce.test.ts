import { describe, expect, it } from "vitest";
import { sellerOrderView } from "./sellerCommerce";
import { orders } from "@/mocks/fixtures";
describe("seller order privacy", () => {
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
