import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getById, listResource } from "@/mocks/mockApi";
import {
  admins,
  blogPosts,
  buildAdminStats,
  buildSellerStats,
  buyers,
  campaigns,
  categories,
  crmContacts,
  invoices,
  orders,
  productReports,
  products,
  questions,
  reviews,
  sellers,
  siteContext,
  sitePages,
  tickets,
  transactions,
} from "@/mocks/fixtures";
import type {
  AdminAccount,
  BlogPost,
  Buyer,
  Campaign,
  Category,
  CrmContact,
  Invoice,
  ListParams,
  Order,
  Product,
  ProductReport,
  Question,
  Review,
  Seller,
  SiteContext,
  SitePage,
  Ticket,
  TicketStatus,
  Transaction,
} from "@/types";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return buildAdminStats();
    },
  });
}

export function useSellerStats(sellerId: string, days?: number) {
  return useQuery({
    queryKey: ["seller-stats", sellerId, days],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 150));
      return buildSellerStats(sellerId, days);
    },
    enabled: Boolean(sellerId),
  });
}

export type BuyerSummary = {
  totalOrders: number;
  inProgressOrders: number;
  openTickets: number;
  addressCount: number;
  recentOrders: Order[];
  buyer: Buyer;
};

export function useBuyerSummary(buyerId: string) {
  return useQuery({
    queryKey: ["buyer-summary", buyerId],
    queryFn: async (): Promise<BuyerSummary> => {
      await new Promise((r) => setTimeout(r, 120));
      const buyer = buyers.find((b) => b.id === buyerId);
      if (!buyer) {
        const err = new Error("Buyer not found") as Error & { status: number };
        err.status = 404;
        throw err;
      }
      const ownOrders = orders
        .filter((o) => o.buyerId === buyerId)
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      const ownTickets = tickets.filter((t) => t.requesterId === buyerId);
      return {
        totalOrders: ownOrders.length,
        inProgressOrders: ownOrders.filter((o) =>
          ["processing", "shipping"].includes(o.status),
        ).length,
        openTickets: ownTickets.filter((t) =>
          ["open", "in_progress", "waiting"].includes(t.status),
        ).length,
        addressCount: buyer.addresses.length,
        recentOrders: ownOrders.slice(0, 5),
        buyer,
      };
    },
    enabled: Boolean(buyerId),
  });
}

export function useBuyerOrders(buyerId: string, params?: ListParams) {
  return useQuery({
    queryKey: ["buyer-orders", buyerId, params],
    queryFn: () =>
      listResource<Order>({
        items: orders.filter((o) => o.buyerId === buyerId),
        params,
        searchKeys: ["orderNumber", "sellerNames"],
        statusKey: "status",
      }),
    enabled: Boolean(buyerId),
  });
}

export function useBuyerTickets(buyerId: string, params?: ListParams) {
  return useQuery({
    queryKey: ["buyer-tickets", buyerId, params],
    queryFn: () =>
      listResource<Ticket>({
        items: tickets.filter((t) => t.requesterId === buyerId),
        params,
        searchKeys: ["ticketNumber", "subject"],
        statusKey: "status",
      }),
    enabled: Boolean(buyerId),
  });
}

export function useOrders(params?: ListParams) {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () =>
      listResource<Order>({
        items: orders,
        params,
        searchKeys: ["orderNumber", "buyerName", "buyerEmail"],
        statusKey: "status",
      }),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => getById(orders, id),
    enabled: Boolean(id),
  });
}

export function useBuyers(params?: ListParams) {
  return useQuery({
    queryKey: ["buyers", params],
    queryFn: () =>
      listResource<Buyer>({
        items: buyers,
        params,
        searchKeys: ["name", "email", "username"],
        statusKey: "status",
      }),
  });
}

export function useBuyer(id: string) {
  return useQuery({
    queryKey: ["buyers", id],
    queryFn: () => getById(buyers, id),
    enabled: Boolean(id),
  });
}

export function useSellers(params?: ListParams) {
  return useQuery({
    queryKey: ["sellers", params],
    queryFn: () =>
      listResource<Seller>({
        items: sellers,
        params,
        searchKeys: ["shopName", "email", "contactName"],
        statusKey: "status",
      }),
  });
}

export function useSeller(id: string) {
  return useQuery({
    queryKey: ["sellers", id],
    queryFn: () => getById(sellers, id),
    enabled: Boolean(id),
  });
}

export function useProducts(params?: ListParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () =>
      listResource<Product>({
        items: products,
        params,
        searchKeys: ["name", "sku", "sellerName", "category"],
        statusKey: "status",
      }),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => getById(products, id),
    enabled: Boolean(id),
  });
}

export function useSellerInventory(sellerId: string) {
  return useQuery({
    queryKey: ["seller-inventory", sellerId],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 150));
      return products.filter((product) => product.sellerId === sellerId);
    },
    enabled: Boolean(sellerId),
  });
}

export function useSellerStockMutation(sellerId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      if (!Number.isSafeInteger(stock) || stock < 0) {
        throw new Error("Quantity must be a non-negative whole number.");
      }
      const product = await getById(products.filter((item) => item.sellerId === sellerId), id);
      product.stock = stock;
      product.updatedAt = new Date().toISOString();
      return product;
    },
    onSuccess: () => {
      for (const key of ["seller-inventory", "seller-stats", "products"]) {
        void qc.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}


export function useCategories(params?: ListParams) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () =>
      listResource<Category>({
        items: categories,
        params,
        searchKeys: ["name", "slug"],
      }),
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => getById(categories, id),
    enabled: Boolean(id),
  });
}

type CategoryMutation =
  | { action: "create"; name: string; slug: string }
  | { action: "update"; id: string; name: string; slug: string }
  | { action: "delete"; id: string };

export function useCategoryMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CategoryMutation) => {
      await new Promise((resolve) => setTimeout(resolve, 200));

      if (payload.action === "create") {
        const duplicate = categories.some(
          (category) =>
            category.name.toLowerCase() === payload.name.toLowerCase() ||
            category.slug === payload.slug,
        );
        if (duplicate) throw new Error("A category with this name or slug already exists.");
        const category: Category = {
          id: `category-${Date.now()}`,
          name: payload.name,
          slug: payload.slug,
          productCount: 0,
          publishedProductCount: 0,
        };
        categories.push(category);
        return category;
      }

      const index = categories.findIndex((category) => category.id === payload.id);
      if (index < 0) throw new Error("Category not found");

      if (payload.action === "delete") {
        if (categories[index].productCount > 0) {
          throw new Error("Move or remove this category's products before deleting it.");
        }
        return categories.splice(index, 1)[0];
      }

      const duplicate = categories.some(
        (category) =>
          category.id !== payload.id &&
          (category.name.toLowerCase() === payload.name.toLowerCase() ||
            category.slug === payload.slug),
      );
      if (duplicate) throw new Error("A category with this name or slug already exists.");

      const previousName = categories[index].name;
      const updated = { ...categories[index], name: payload.name, slug: payload.slug };
      categories[index] = updated;
      products.forEach((product) => {
        if (product.category === previousName) product.category = payload.name;
      });
      return updated;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["categories"] });
      void qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useTickets(params?: ListParams) {
  return useQuery({
    queryKey: ["tickets", params],
    queryFn: () =>
      listResource<Ticket>({
        items: tickets,
        params,
        searchKeys: ["ticketNumber", "subject", "requesterName"],
        statusKey: "status",
      }),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["tickets", id],
    queryFn: () => getById(tickets, id),
    enabled: Boolean(id),
  });
}

function sellerTickets(sellerId: string) {
  return tickets.filter((ticket) => ticket.channel === "buyer_seller" && ticket.sellerId === sellerId);
}

export function useSellerTickets(sellerId: string, params?: ListParams) {
  return useQuery({
    queryKey: ["seller-tickets", sellerId, params],
    queryFn: () => listResource<Ticket>({ items: sellerTickets(sellerId), params, searchKeys: ["ticketNumber", "subject", "requesterName"], statusKey: "status" }),
    enabled: Boolean(sellerId),
  });
}

export function useSellerTicket(sellerId: string, id: string) {
  return useQuery({
    queryKey: ["seller-tickets", sellerId, id],
    queryFn: async () => {
      const ticket = await getById(sellerTickets(sellerId), id);
      return { ...ticket, messages: ticket.messages.filter((message) => !message.internal) };
    },
    enabled: Boolean(sellerId && id),
  });
}

export function useSellerTicketMutation(sellerId: string, authorName: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: string; action: "reply"; body: string } | { id: string; action: "status"; status: TicketStatus }) => {
      const ticket = await getById(sellerTickets(sellerId), payload.id);
      if (payload.action === "reply") {
        if (ticket.status === "closed") throw new Error("This ticket is closed.");
        if (!payload.body.trim()) throw new Error("Write a reply first.");
        ticket.messages.push({ id: `message-${Date.now()}`, authorId: sellerId, authorName, authorType: "seller", body: payload.body.trim(), createdAt: new Date().toISOString(), internal: false });
      } else {
        ticket.status = payload.status;
      }
      ticket.updatedAt = new Date().toISOString();
      return ticket;
    },
    onSuccess: () => {
      for (const key of ["seller-tickets", "seller-stats", "tickets", "buyer-tickets", "buyer-summary"]) {
        void qc.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}

export function useInvoices(params?: ListParams) {
  return useQuery({
    queryKey: ["invoices", params],
    queryFn: () =>
      listResource<Invoice>({
        items: invoices,
        params,
        searchKeys: ["invoiceNumber", "buyerName", "orderNumber"],
        statusKey: "status",
      }),
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoices", id],
    queryFn: () => getById(invoices, id),
    enabled: Boolean(id),
  });
}

export function useTransactions(params?: ListParams) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () =>
      listResource<Transaction>({
        items: transactions,
        params,
        searchKeys: ["reference", "externalRef"],
        statusKey: "status",
      }),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => getById(transactions, id),
    enabled: Boolean(id),
  });
}

export function useReviews(params?: ListParams) {
  return useQuery({
    queryKey: ["reviews", params],
    queryFn: () =>
      listResource<Review>({
        items: reviews,
        params,
        searchKeys: ["productName", "buyerName", "title"],
        statusKey: "status",
      }),
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: ["reviews", id],
    queryFn: () => getById(reviews, id),
    enabled: Boolean(id),
  });
}

export function useQuestions(params?: ListParams) {
  return useQuery({
    queryKey: ["questions", params],
    queryFn: () =>
      listResource<Question>({
        items: questions,
        params,
        searchKeys: ["productName", "askerName", "body"],
        statusKey: "status",
      }),
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ["questions", id],
    queryFn: () => getById(questions, id),
    enabled: Boolean(id),
  });
}

export function useReports(params?: ListParams) {
  return useQuery({
    queryKey: ["product_reports", params],
    queryFn: () =>
      listResource<ProductReport>({
        items: productReports,
        params,
        searchKeys: ["productName", "reporterName", "reason"],
        statusKey: "status",
      }),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ["product_reports", id],
    queryFn: () => getById(productReports, id),
    enabled: Boolean(id),
  });
}

export function useCampaigns(params?: ListParams) {
  return useQuery({
    queryKey: ["campaigns", params],
    queryFn: () =>
      listResource<Campaign>({
        items: campaigns
          .filter((campaign) => !params?.tenant || !campaign.tenantIds?.length || campaign.tenantIds.includes(String(params.tenant)))
          .filter((campaign) => !params?.channel || (campaign.channel ?? "storefront") === params.channel)
          .map((campaign) => ({ ...campaign, channel: campaign.channel ?? "storefront", storeCount: campaign.tenantIds?.length || sellers.length })),
        params,
        searchKeys: ["name", "code"],
        statusKey: "status",
      }),
  });
}

export function useCampaign(id: string) {
  return useQuery({
    queryKey: ["campaigns", id],
    queryFn: () => getById(campaigns, id),
    enabled: Boolean(id),
  });
}

export function useContacts(params?: ListParams) {
  return useQuery({
    queryKey: ["crm", params],
    queryFn: () =>
      listResource<CrmContact>({
        items: crmContacts,
        params,
        searchKeys: ["name", "email"],
        statusKey: "type",
      }),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: ["crm", id],
    queryFn: () => getById(crmContacts, id),
    enabled: Boolean(id),
  });
}

export function useSiteContext() {
  return useQuery({
    queryKey: ["site-context"],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 100));
      return siteContext as SiteContext;
    },
  });
}

export function usePages(params?: ListParams) {
  return useQuery({
    queryKey: ["pages", params],
    queryFn: () =>
      listResource<SitePage>({
        items: sitePages,
        params,
        searchKeys: ["title", "slug"],
        statusKey: "status",
      }),
  });
}

export function usePage(id: string) {
  return useQuery({
    queryKey: ["pages", id],
    queryFn: () => getById(sitePages, id),
    enabled: Boolean(id),
  });
}

export function usePosts(params?: ListParams) {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () =>
      listResource<BlogPost>({
        items: blogPosts,
        params,
        searchKeys: ["title", "slug", "excerpt"],
        statusKey: "status",
      }),
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: ["posts", id],
    queryFn: () => getById(blogPosts, id),
    enabled: Boolean(id),
  });
}

export function useAdmins(params?: ListParams) {
  return useQuery({
    queryKey: ["admins", params],
    queryFn: () =>
      listResource<AdminAccount>({
        items: admins,
        params,
        searchKeys: ["name", "email", "role"],
        statusKey: "status",
      }),
  });
}

export function useAdmin(id: string) {
  return useQuery({
    queryKey: ["admins", id],
    queryFn: () => getById(admins, id),
    enabled: Boolean(id),
  });
}

/** Mock mutation that invalidates a resource key after success. */
export function useMockMutation(resourceKey: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: unknown) => {
      await new Promise((r) => setTimeout(r, 200));
      return payload;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [resourceKey] });
    },
  });
}
