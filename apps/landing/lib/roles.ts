export const roles = ["admin", "seller", "buyer"] as const;
export type Role = (typeof roles)[number];

export const experiences = {
  admin: {
    label: "Admin", eyebrow: "THE BIG PICTURE", title: "Complete Control Over Your Marketplace.",
    description: "Monitor performance, manage sellers, and keep your entire marketplace running smoothly.",
    features: ["Marketplace overview", "Seller management", "Order monitoring", "Platform analytics"],
    short: "Bring every moving part into focus.",
  },
  seller: {
    label: "Seller", eyebrow: "YOUR NEXT CHAPTER", title: "Everything Sellers Need to Grow.",
    description: "Manage products, track orders, understand sales, and grow your store from one powerful dashboard.",
    features: ["Product management", "Inventory management", "Order processing", "Sales insights"],
    short: "Less busywork. More room to grow.",
  },
  buyer: {
    label: "Buyer", eyebrow: "A LITTLE DISCOVERY", title: "A Better Way to Discover and Shop.",
    description: "Explore products, manage purchases, and enjoy a seamless shopping experience.",
    features: ["Product discovery", "Shopping cart", "Demo checkout", "Order status & history"],
    short: "From a great find to your next order.",
  },
} as const;
