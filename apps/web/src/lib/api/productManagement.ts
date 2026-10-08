import { template } from "@/config/template";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  products,
  categories,
  orders,
  reviews,
  sellers,
} from "@/mocks/fixtures";
import { listResource } from "@/mocks/mockApi";
import type { Product, ListParams } from "@/types";

export type ProductValues = Pick<
  Product,
  "name" | "sku" | "price" | "stock" | "description" | "category" | "status"
>;
export function useSellerProducts(sellerId: string, params: ListParams) {
  return useQuery({
    queryKey: ["seller-products", sellerId, params],
    queryFn: () =>
      listResource({
        items: products
          .filter((product) => product.sellerId === sellerId)
          .map((product) => ({
            ...product,
            moderationStatus: product.moderation?.blocked
              ? "Restricted"
              : "Allowed",
          })),
        params,
        searchKeys: ["name", "sku", "category"],
        statusKey: "status",
      }),
  });
}
function recount() {
  categories.forEach((category) => {
    category.productCount = products.filter(
      (product) => product.category === category.name,
    ).length;
    category.publishedProductCount = products.filter(
      (product) =>
        product.category === category.name &&
        product.status === "published" &&
        !product.moderation?.blocked,
    ).length;
  });
}
export function useSellerProductManagement(sellerId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload:
        | { action: "save"; id?: string; values: ProductValues }
        | { action: "delete"; id: string },
    ) => {
      const seller = sellers.find((item) => item.id === sellerId);
      if (!seller) throw new Error("Seller not found.");
      const index = payload.id
        ? products.findIndex(
            (product) =>
              product.id === payload.id && product.sellerId === sellerId,
          )
        : -1;
      if (payload.id && index < 0)
        throw new Error("Product not found in your shop.");
      if (payload.action === "delete") {
        products.splice(index, 1);
        recount();
        return;
      }
      const values = {
        ...payload.values,
        name: payload.values.name.trim(),
        sku: payload.values.sku.trim(),
        description: payload.values.description.trim(),
      };
      if (
        !values.name ||
        !values.sku ||
        !values.description ||
        !Number.isFinite(values.price) ||
        values.price <= 0 ||
        !Number.isSafeInteger(values.stock) ||
        values.stock < 0
      )
        throw new Error("Enter valid product details, price, and stock.");
      if (!categories.some((category) => category.name === values.category))
        throw new Error("Select a valid category.");
      if (
        products.some(
          (product) =>
            product.id !== payload.id &&
            product.sku.toLowerCase() === values.sku.toLowerCase(),
        )
      )
        throw new Error("This SKU already exists.");
      if (
        values.status === "published" &&
        (seller.status === "disabled" ||
          (index >= 0 && products[index].moderation?.blocked))
      )
        throw new Error(
          "This listing cannot be published while the shop or product is restricted.",
        );
      const now = new Date().toISOString();
      if (index >= 0)
        products[index] = { ...products[index], ...values, updatedAt: now };
      else
        products.push({
          ...values,
          id: crypto.randomUUID(),
          sellerId,
          sellerName: seller.shopName,
          currency: template.currency,
          createdAt: now,
          updatedAt: now,
        });
      recount();
    },
    onSuccess: () => {
      for (const key of [
        "products",
        "seller-products",
        "seller-inventory",
        "seller-stats",
        "categories",
        "sellers",
      ])
        void client.invalidateQueries({ queryKey: [key] });
    },
  });
}
export function useProductModeration(actor: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      blocked,
      reason,
    }: {
      id: string;
      blocked: boolean;
      reason: string;
    }) => {
      const product = products.find((item) => item.id === id);
      if (!product) throw new Error("Product not found.");
      if (!reason.trim()) throw new Error("A moderation reason is required.");
      product.moderation = {
        blocked,
        reason: reason.trim(),
        by: actor,
        at: new Date().toISOString(),
      };
      if (blocked) product.status = "draft";
      recount();
    },
    onSuccess: () => {
      for (const key of [
        "products",
        "seller-products",
        "seller-inventory",
        "seller-stats",
        "categories",
      ])
        void client.invalidateQueries({ queryKey: [key] });
    },
  });
}
export function productSales(id: string) {
  return orders
    .filter((order) => order.status === "delivered")
    .flatMap((order) => order.lineItems)
    .filter((item) => item.productId === id)
    .reduce((total, item) => total + item.quantity, 0);
}
export function productReviews(id: string) {
  return reviews.filter((review) => review.productId === id);
}
