import { z } from "zod";
import {
  admins,
  blogPosts,
  buyers,
  invoices,
  orders,
  productReports,
  questions,
  reviews,
  sellers,
  siteContext,
  sitePages,
  tickets,
  transactions,
  roleTemplates,
} from "./fixtures";
import { getSession } from "@/lib/auth/store";
import { template } from "@/config/template";

const base = z
  .object({ id: z.string().optional(), action: z.string().optional() })
  .passthrough();
const text = z.string().trim().min(1);
const content = z.object({
  title: text,
  slug: text.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  body: text,
});
const now = () => new Date().toISOString();
const uid = () => crypto.randomUUID();
function find<T extends { id: string }>(items: T[], id?: string): T {
  const item = items.find((row) => row.id === id);
  if (!item) throw new Error("Record not found.");
  return item;
}
function authorize(resource: string, action?: string, id?: string) {
  const user = getSession();
  if (!user) throw new Error("Sign in to continue.");
  if (user.actorType !== "staff") return user;
  if (user.isSuperuser) return user;
  const areas: Record<string, string> = {
    pages: "website",
    posts: "blog",
    "site-context": "website",
    questions: "qa",
    admins: "admin_management",
    "role-templates": "admin_management",
  };
  const permission =
    action === "reply"
      ? "respond"
      : action === "status"
        ? "update_status"
        : ["approve", "hide", "resolve"].includes(action ?? "")
          ? "moderate"
          : action === "refund"
            ? "refund"
            : action === "cancel" || action === "advance"
              ? "update_status"
              : resource === "admins"
                ? "manage_admins"
                : !id && resource !== "site-context"
                  ? "create"
                  : "edit";
  if (
    !user.grants?.some(
      (grant) =>
        grant.area === (areas[resource] ?? resource) &&
        grant.actions.includes(permission),
    )
  )
    throw new Error("You do not have permission to change this record.");
  return user;
}

/** Mock commands implement the same visible outcomes expected from an API. */
export function mutateResource(resource: string, input: unknown) {
  const payload = base.parse(input);
  const user = authorize(resource, payload.action, payload.id);
  const at = now();
  if (resource === "buyers") {
    const buyer = find(buyers, payload.id);
    if (
      user.actorType === "seller" ||
      (user.actorType === "buyer" && user.buyerId !== buyer.id)
    )
      throw new Error("This profile is not available on your account.");
    if (payload.action === "password")
      throw new Error(
        "Demo accounts use fixed passwords. Connect your authentication API to change passwords.",
      );
    const values = z
      .object({
        name: text.optional(),
        username: text.optional(),
        email: z.string().email().optional(),
        addresses: z
          .array(
            z.object({
              id: text,
              label: text,
              line1: text,
              line2: z.string().optional(),
              city: text,
              region: z.string().optional(),
              postalCode: z.string().optional(),
              country: text,
              isDefault: z.boolean().optional(),
            }),
          )
          .optional(),
      })
      .parse(payload);
    Object.assign(buyer, values);
    return buyer;
  }
  if (resource === "orders") {
    const order = find(orders, payload.id);
    if (user.actorType === "buyer" && user.buyerId !== order.buyerId)
      throw new Error("This order is not available on your account.");
    if (
      user.actorType === "seller" &&
      !order.sellerIds.includes(user.sellerId ?? "")
    )
      throw new Error("This order is not available in your shop.");
    const status =
      payload.action === "cancel"
        ? "canceled"
        : payload.action === "advance"
          ? order.status === "processing"
            ? "shipping"
            : "delivered"
          : z
              .enum(["processing", "shipping", "delivered", "canceled"])
              .parse(payload.status);
    if (
      user.actorType === "buyer" &&
      (status !== "canceled" || order.status !== "processing")
    )
      throw new Error("Only processing orders can be canceled.");
    if (user.actorType === "seller" && order.sellerIds.length !== 1)
      throw new Error(
        "Marketplace staff manage fulfillment for orders containing multiple stores.",
      );
    const allowed = {
      processing: ["shipping", "canceled"],
      shipping: ["delivered"],
      delivered: [],
      canceled: [],
    };
    if (!allowed[order.status].includes(status as never))
      throw new Error("This order status transition is not allowed.");
    order.status = status;
    order.updatedAt = at;
    order.version += 1;
    order.history.push({
      id: uid(),
      status,
      at,
      note: typeof payload.reason === "string" ? payload.reason : undefined,
      by: user.displayName,
    });
    return order;
  }
  if (resource === "tickets") {
    const ticket = find(tickets, payload.id);
    if (user.actorType === "buyer" && ticket.requesterId !== user.buyerId)
      throw new Error("This ticket is not available on your account.");
    if (
      user.actorType === "seller" &&
      (ticket.sellerId !== user.sellerId || ticket.channel !== "buyer_seller")
    )
      throw new Error("This ticket is not available in your shop.");
    if (payload.action === "reply") {
      if (ticket.status === "closed") throw new Error("This ticket is closed.");
      ticket.messages.push({
        id: uid(),
        authorId: user.id,
        authorName: user.displayName,
        authorType: user.actorType,
        body: text.parse(payload.body),
        createdAt: at,
        internal: false,
      });
    } else {
      if (user.actorType === "buyer")
        throw new Error("Only staff can change ticket status.");
      ticket.status = z
        .enum(["open", "in_progress", "waiting", "resolved", "closed"])
        .parse(payload.status);
    }
    ticket.updatedAt = at;
    return ticket;
  }
  if (user.actorType !== "staff" && resource !== "sellers")
    throw new Error("Staff access is required.");
  if (resource === "role-templates") {
    if (!user.isSuperuser)
      throw new Error("Only superusers can save role templates.");
    const role = z.enum(["support", "editor", "custom"]).parse(payload.role);
    const grants = z
      .array(z.object({ area: text, actions: z.array(text) }))
      .parse(payload.grants);
    roleTemplates[role] = grants as (typeof roleTemplates)[typeof role];
    return roleTemplates[role];
  }
  if (resource === "sellers") {
    const values = z
      .object({
        shopName: text.optional(),
        contactName: text.optional(),
        email: z.string().email().optional(),
        deliveryMethods: z
          .array(
            z.object({
              id: text,
              name: text,
              enabled: z.boolean(),
              label: z.string(),
              instructions: z.string(),
              sortOrder: z.number(),
            }),
          )
          .optional(),
        paymentWays: z
          .array(
            z.object({
              id: text,
              name: text,
              enabled: z.boolean(),
              label: z.string(),
              instructions: z.string(),
              sortOrder: z.number(),
            }),
          )
          .optional(),
        workplaceAddress: z
          .object({
            id: text,
            label: text,
            line1: text,
            city: text,
            postalCode: z.string().optional(),
            country: text,
          })
          .optional(),
      })
      .parse(payload);
    if (payload.id) {
      if (
        user.actorType === "buyer" ||
        (user.actorType === "seller" && user.sellerId !== payload.id)
      )
        throw new Error("This shop is not available on your account.");
      const seller = find(sellers, payload.id);
      Object.assign(seller, values);
      return seller;
    }
    if (user.actorType !== "staff")
      throw new Error("Only staff can create stores.");
    const required = z
      .object({ shopName: text, contactName: text, email: z.string().email() })
      .parse(values);
    const seller = {
      ...required,
      id: uid(),
      status: "enabled" as const,
      createdAt: at,
      productCount: 0,
      orderCount: 0,
      deliveryMethods: structuredClone(sellers[0]?.deliveryMethods ?? []),
      paymentWays: structuredClone(sellers[0]?.paymentWays ?? []),
    };
    sellers.push(seller);
    return seller;
  }
  if (resource === "site-context") {
    Object.assign(
      siteContext,
      z
        .object({
          name: text,
          tagline: z.string(),
          contactEmail: z.string().email(),
          contactPhone: z.string().optional(),
          defaultSeoTitle: text,
          defaultSeoDescription: text,
          homepageCopy: z.string(),
        })
        .partial()
        .parse(payload),
    );
    return siteContext;
  }
  if (resource === "pages" || resource === "posts") {
    if (resource === "posts" && payload.commentId) {
      const comment = find(
        find(blogPosts, payload.id).comments,
        String(payload.commentId),
      );
      comment.status = payload.action === "approve" ? "approved" : "hidden";
      return comment;
    }
    const values = content.parse(payload);
    const items = resource === "pages" ? sitePages : blogPosts;
    if (
      items.some((item) => item.id !== payload.id && item.slug === values.slug)
    )
      throw new Error("This slug is already in use.");
    if (payload.id) {
      const item = find(items, payload.id);
      Object.assign(
        item,
        values,
        { updatedAt: at },
        resource === "posts" ? { excerpt: text.parse(payload.excerpt) } : {},
      );
      return item;
    }
    if (resource === "pages") {
      const item = {
        ...values,
        id: uid(),
        status: "draft" as const,
        updatedAt: at,
      };
      sitePages.push(item);
      return item;
    }
    const item = {
      ...values,
      excerpt: text.parse(payload.excerpt),
      id: uid(),
      status: "draft" as const,
      updatedAt: at,
      createdAt: at,
      comments: [],
    };
    blogPosts.push(item);
    return item;
  }
  if (resource === "admins") {
    if (!user.isSuperuser) throw new Error("Only superusers can manage staff.");
    if (payload.id) {
      const admin = find(admins, payload.id);
      if (admin.isSuperuser)
        throw new Error("Superuser permissions cannot be changed.");
      const grants = z
        .array(z.object({ area: text, actions: z.array(text) }))
        .parse(payload.grants);
      admin.grants = grants as typeof admin.grants;
      return admin;
    }
    const values = z
      .object({
        name: text,
        email: z.string().email(),
        role: z.enum(["admin", "support", "editor", "custom"]),
      })
      .parse(payload);
    if (admins.some((admin) => admin.email === values.email))
      throw new Error("This email is already in use.");
    const preset = values.role === "admin" ? [] : roleTemplates[values.role];
    const admin = {
      ...values,
      id: uid(),
      status: "active" as const,
      isSuperuser: false,
      grants: structuredClone(preset),
      createdAt: at,
    };
    admins.push(admin);
    return admin;
  }
  if (resource === "reviews" || resource === "questions") {
    const item =
      resource === "reviews"
        ? find(reviews, payload.id)
        : find(questions, payload.id);
    item.status = payload.action === "approve" ? "approved" : "hidden";
    return item;
  }
  if (resource === "product_reports") {
    const report = find(productReports, payload.id);
    report.status = "resolved";
    report.resolution = text.parse(payload.reason);
    return report;
  }
  if (resource === "invoices") {
    if (payload.action === "void") {
      const invoice = find(invoices, payload.id);
      if (invoice.status === "paid")
        throw new Error("Paid invoices cannot be voided.");
      invoice.status = "void";
      return invoice;
    }
    const values = z
      .object({
        buyerName: text,
        description: text,
        amount: z.coerce.number().positive(),
      })
      .parse(payload);
    const buyer = buyers.find(
      (item) => item.name.toLowerCase() === values.buyerName.toLowerCase(),
    );
    const invoice = {
      id: uid(),
      invoiceNumber: `INV-DEMO-${invoices.length + 1}`,
      status: "draft" as const,
      buyerId: buyer?.id ?? "",
      buyerName: values.buyerName,
      total: values.amount,
      currency: template.currency,
      createdAt: at,
      lines: [
        {
          id: uid(),
          description: values.description,
          quantity: 1,
          unitPrice: values.amount,
        },
      ],
    };
    invoices.push(invoice);
    return invoice;
  }
  if (resource === "transactions") {
    const payment = find(transactions, payload.id);
    if (payment.type !== "payment" || payment.status !== "completed")
      throw new Error("Only completed payments can be refunded.");
    if (
      transactions.some((item) => item.externalRef === `refund:${payment.id}`)
    )
      throw new Error("This payment has already been refunded.");
    const refund = {
      ...payment,
      id: uid(),
      reference: `REF-${payment.reference}`,
      type: "refund" as const,
      externalRef: `refund:${payment.id}`,
      note: text.parse(payload.reason),
      createdAt: at,
    };
    transactions.push(refund);
    return refund;
  }
  throw new Error(`No mock command is configured for ${resource}.`);
}
