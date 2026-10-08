import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSellerStockMutation, useSellerTicketMutation } from "./resources";
import { products, tickets } from "@/mocks/fixtures";
import { resetDemoData } from "@/mocks/store";
beforeEach(() => {
  localStorage.clear();
  resetDemoData();
});
afterEach(cleanup);
function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      {children}
    </QueryClientProvider>
  );
}
describe("specialized mock mutations", () => {
  it("updates the actual stock record and refuses another seller's product", async () => {
    const product = products.find((item) => item.sellerId === "seller-0001")!;
    const other = products.find((item) => item.sellerId !== "seller-0001")!;
    const { result } = renderHook(() => useSellerStockMutation("seller-0001"), {
      wrapper,
    });
    await act(async () => {
      await result.current.mutateAsync({ id: product.id, stock: 123 });
    });
    expect(product.stock).toBe(123);
    await act(async () => {
      await expect(
        result.current.mutateAsync({ id: other.id, stock: 0 }),
      ).rejects.toThrow("your shop");
    });
  });
  it("writes replies to the shared seller ticket", async () => {
    const ticket = tickets.find(
      (item) =>
        item.channel === "buyer_seller" &&
        item.sellerId === "seller-0001" &&
        item.status !== "closed",
    )!;
    const { result } = renderHook(
      () => useSellerTicketMutation("seller-0001", "Demo seller"),
      { wrapper },
    );
    await act(async () => {
      await result.current.mutateAsync({
        id: ticket.id,
        action: "reply",
        body: "Shared reply",
      });
    });
    expect(ticket.messages.at(-1)?.body).toBe("Shared reply");
  });
});
