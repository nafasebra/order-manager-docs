import { admins, buyers, sellers } from "@/mocks/fixtures";
import type { ActorType, SessionUser } from "@/types";

export const demoAccounts = [
  {
    key: "admin",
    label: "Admin",
    panel: "staff",
    email: "admin@example.com",
    password: "Admin123!",
  },
  {
    key: "support",
    label: "Support",
    panel: "staff",
    email: "support@example.com",
    password: "Support123!",
  },
  {
    key: "editor",
    label: "Editor",
    panel: "staff",
    email: "editor@example.com",
    password: "Editor123!",
  },
  {
    key: "seller",
    label: "Seller",
    panel: "seller",
    email: "seller1@example.com",
    password: "Seller123!",
  },
  {
    key: "buyer",
    label: "Buyer",
    panel: "buyer",
    email: "buyer1@example.com",
    password: "Buyer123!",
  },
] as const;
export type DemoAccountKey = (typeof demoAccounts)[number]["key"];
export function demoSession(key: DemoAccountKey): SessionUser {
  if (key === "seller") {
    const seller = sellers[0];
    return {
      id: seller.id,
      sellerId: seller.id,
      displayName: seller.contactName,
      email: seller.email,
      actorType: "seller",
      shopName: seller.shopName,
    };
  }
  if (key === "buyer") {
    const buyer = buyers[0];
    return {
      id: buyer.id,
      buyerId: buyer.id,
      displayName: buyer.name,
      email: buyer.email,
      actorType: "buyer",
    };
  }
  const admin = admins.find(
    (item) =>
      item.email === demoAccounts.find((account) => account.key === key)?.email,
  );
  if (!admin || admin.status !== "active")
    throw new Error(
      "This demo staff account is unavailable. Reset demo data to restore it.",
    );
  return {
    id: admin.id,
    displayName: admin.name,
    email: admin.email,
    actorType: "staff",
    isSuperuser: admin.isSuperuser,
    grants: admin.grants,
  };
}
export function demoLogin(
  panel: ActorType,
  credentials: { email: string; password: string },
) {
  const account = demoAccounts.find(
    (item) =>
      item.panel === panel &&
      item.email === credentials.email.trim().toLowerCase() &&
      item.password === credentials.password,
  );
  if (!account)
    throw new Error("Use the displayed demo credentials for this panel.");
  return demoSession(account.key);
}
export function sessionHome(user: SessionUser): string {
  if (user.actorType === "seller") return "/seller";
  if (user.actorType === "buyer") return "/account";
  if (user.isSuperuser) return "/admin";
  const paths: Record<string, string> = {
    tickets: "/admin/support/tickets",
    website: "/admin/website",
    orders: "/admin/orders",
    products: "/admin/products",
    blog: "/admin/blog",
    sellers: "/admin/sellers",
    buyers: "/admin/buyers",
  };
  return (
    paths[
      user.grants?.find(
        (grant) => grant.actions.includes("view") && paths[grant.area],
      )?.area ?? ""
    ] ?? "/403"
  );
}
