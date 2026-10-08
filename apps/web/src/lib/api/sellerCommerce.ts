import { useQuery } from "@tanstack/react-query";
import { orders } from "@/mocks/fixtures";
import { listResource } from "@/mocks/mockApi";
import type { ListParams, Order } from "@/types";

/** Keep other stores' line items and revenue out of seller responses. */
export function sellerOrderView(order: Order, sellerId: string): Order {
  const lineItems = order.lineItems.filter(
    (line) => line.sellerId === sellerId,
  );
  return {
    ...order,
    lineItems,
    total: lineItems.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0,
    ),
  };
}
export function useSellerOrders(sellerId: string, params: ListParams) {
  return useQuery({
    queryKey: ["seller-orders", sellerId, params],
    queryFn: () =>
      listResource({
        items: orders
          .filter((order) => order.sellerIds.includes(sellerId))
          .map((order) => sellerOrderView(order, sellerId)),
        params,
        searchKeys: ["orderNumber", "buyerName"],
        statusKey: "status",
      }),
  });
}
export function useSellerOrder(sellerId: string, id: string) {
  return useQuery({
    queryKey: ["seller-orders", sellerId, id],
    queryFn: () => {
      const order = orders.find(
        (item) => item.id === id && item.sellerIds.includes(sellerId),
      );
      if (!order) throw new Error("Order not found in your shop.");
      return sellerOrderView(order, sellerId);
    },
  });
}
