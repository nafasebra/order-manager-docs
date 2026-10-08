import {
  buyers,
  categories,
  orders,
  products,
  sellers,
  tickets,
} from "./fixtures";
/** Keep counts in selectors and detail pages consistent with mutable records. */
export function synchronizeDerivedData() {
  for (const category of categories) {
    const items = products.filter(
      (product) => product.category === category.name,
    );
    category.productCount = items.length;
    category.publishedProductCount = items.filter(
      (product) =>
        product.status === "published" && !product.moderation?.blocked,
    ).length;
  }
  for (const seller of sellers) {
    seller.productCount = products.filter(
      (product) => product.sellerId === seller.id,
    ).length;
    seller.orderCount = orders.filter((order) =>
      order.lineItems.some((line) => line.sellerId === seller.id),
    ).length;
    for (const product of products.filter(
      (item) => item.sellerId === seller.id,
    ))
      product.sellerName = seller.shopName;
  }
  for (const buyer of buyers) {
    buyer.orderCount = orders.filter(
      (order) => order.buyerId === buyer.id,
    ).length;
    buyer.ticketCount = tickets.filter(
      (ticket) => ticket.requesterId === buyer.id,
    ).length;
  }
}
