import { beforeEach, describe, expect, it } from "vitest";
import { mutateResource } from "./mutations";
import {
  buyers,
  orders,
  tickets,
  sitePages,
  blogPosts,
  reviews,
  transactions,
  sellers,
} from "./fixtures";
import { resetDemoData } from "./store";
import { demoSession } from "@/lib/auth/demo";
import { setSession } from "@/lib/auth/store";

beforeEach(() => {
  localStorage.clear();
  resetDemoData();
  setSession(demoSession("admin"));
});
describe("mock resource commands", () => {
  it("updates content and rejects duplicate slugs without partial writes", () => {
    mutateResource("pages", {
      title: "Returns policy",
      slug: "returns-policy",
      body: "Return items within 30 days.",
    });
    const page = sitePages.at(-1)!;
    expect(sitePages.at(-1)?.id).toBe(page?.id);
    mutateResource("pages", {
      id: page?.id,
      title: "Updated returns",
      slug: "returns-policy",
      body: "Updated copy.",
    });
    expect(sitePages.at(-1)?.title).toBe("Updated returns");
    expect(() =>
      mutateResource("pages", {
        title: "Duplicate",
        slug: "returns-policy",
        body: "Copy.",
      }),
    ).toThrow("slug");
  });
  it("records order transitions once and rejects terminal transitions", () => {
    const order = orders.find((item) => item.status === "processing")!;
    mutateResource("orders", { id: order.id, action: "advance" });
    expect(order.status).toBe("shipping");
    expect(order.history.at(-1)?.by).toBe(demoSession("admin").displayName);
    mutateResource("orders", { id: order.id, action: "advance" });
    expect(order.status).toBe("delivered");
    expect(() =>
      mutateResource("orders", { id: order.id, action: "cancel" }),
    ).toThrow("transition");
  });
  it("limits buyers to their profile, orders, and tickets", () => {
    const buyer = demoSession("buyer");
    setSession(buyer);
    mutateResource("buyers", { id: buyer.buyerId, name: "Updated buyer" });
    expect(buyers[0].name).toBe("Updated buyer");
    expect(() =>
      mutateResource("buyers", { id: buyers[1].id, name: "Other buyer" }),
    ).toThrow("account");
    const otherOrder = orders.find((order) => order.buyerId !== buyer.buyerId)!;
    expect(() =>
      mutateResource("orders", { id: otherOrder.id, action: "cancel" }),
    ).toThrow("account");
    expect(() =>
      mutateResource("pages", {
        title: "No access",
        slug: "no-access",
        body: "Copy.",
      }),
    ).toThrow("Staff");
  });
  it("persists ticket replies and prevents replying to closed tickets", () => {
    const ticket = tickets.find((item) => item.status !== "closed")!;
    mutateResource("tickets", {
      id: ticket.id,
      action: "reply",
      body: "We are investigating.",
    });
    expect(ticket.messages.at(-1)?.body).toBe("We are investigating.");
    mutateResource("tickets", {
      id: ticket.id,
      action: "status",
      status: "closed",
    });
    expect(() =>
      mutateResource("tickets", {
        id: ticket.id,
        action: "reply",
        body: "Another reply",
      }),
    ).toThrow("closed");
  });
  it("keeps support read-only on orders while allowing ticket responses", () => {
    setSession(demoSession("support"));
    expect(() =>
      mutateResource("orders", { id: orders[0].id, action: "advance" }),
    ).toThrow("permission");
    const ticket = tickets.find((item) => item.status !== "closed")!;
    mutateResource("tickets", {
      id: ticket.id,
      action: "reply",
      body: "Support response",
    });
    expect(ticket.messages.at(-1)?.authorName).toBe("Support Lead");
  });
  it("updates review and comment moderation", () => {
    mutateResource("reviews", { id: reviews[0].id, action: "hide" });
    expect(reviews[0].status).toBe("hidden");
    const post = blogPosts.find((item) => item.comments.length)!;
    mutateResource("posts", {
      id: post.id,
      commentId: post.comments[0].id,
      action: "approve",
    });
    expect(post.comments[0].status).toBe("approved");
  });
  it("creates one refund per completed payment", () => {
    const payment = transactions.find(
      (item) => item.type === "payment" && item.status === "completed",
    )!;
    mutateResource("transactions", {
      id: payment.id,
      action: "refund",
      reason: "Customer return",
    });
    expect(transactions.at(-1)?.type).toBe("refund");
    expect(() =>
      mutateResource("transactions", {
        id: payment.id,
        action: "refund",
        reason: "Again",
      }),
    ).toThrow("already");
  });
  it("limits sellers to their own settings", () => {
    setSession(demoSession("seller"));
    mutateResource("sellers", { id: sellers[0].id, shopName: "Updated store" });
    expect(sellers[0].shopName).toBe("Updated store");
    expect(() =>
      mutateResource("sellers", { id: sellers[1].id, shopName: "Other store" }),
    ).toThrow("account");
  });
});
