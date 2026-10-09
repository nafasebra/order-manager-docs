import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { buyers, orders, productReports, products, reviews, sellers } from "@/mocks/fixtures";
import { getSession } from "@/lib/auth/store";
import { can } from "@/lib/permissions/can";
import type { ProductReport, ReportStatus } from "@/types";

export function reportTargets() {
  const user = getSession();
  if (!user || user.actorType === "staff") return [];
  const ownProducts = products.filter((item) => item.sellerId === user.sellerId).map((item) => item.id);
  if (user.actorType === "seller") return [
    ...buyers.filter((buyer) => orders.some((order) => order.buyerId === buyer.id && order.sellerIds.includes(user.sellerId!))).map((item) => ({ id: item.id, type: "buyer" as const, name: item.name })),
    ...reviews.filter((item) => ownProducts.includes(item.productId)).map((item) => ({ id: item.id, type: "review" as const, name: `Review ${item.id}` })),
  ];
  return [
    ...products.map((item) => ({ id: item.id, type: "product" as const, name: item.name })),
    ...sellers.map((item) => ({ id: item.id, type: "seller" as const, name: item.shopName })),
    ...reviews.map((item) => ({ id: item.id, type: "review" as const, name: `Review ${item.id}` })),
  ];
}

export function submitAbuseReport(input: { target: string; reason: string; evidence: string }) {
  const user = getSession();
  if (!user || user.actorType === "staff") throw new Error("A marketplace account is required.");
  if (user.actorType === "seller" && !sellers.some((item) => item.id === user.sellerId && item.status === "enabled")) throw new Error("Account is suspended.");
  if (user.actorType === "buyer" && !buyers.some((item) => item.id === user.buyerId && item.status === "active")) throw new Error("Account is suspended.");
  const target = reportTargets().find((item) => `${item.type}:${item.id}` === input.target);
  if (!target) throw new Error("This target is not available to your account.");
  const reason = z.string().trim().min(5).max(1000).parse(input.reason);
  const evidence = z.string().trim().max(4000).parse(input.evidence);
  if (productReports.some((item) => item.reporterId === user.id && item.productId === target.id && (item.targetType ?? "product") === target.type && ["open", "investigating"].includes(item.status))) throw new Error("An open report already exists for this target.");
  const record: ProductReport = { id: crypto.randomUUID(), productId: target.id, productName: target.name, targetType: target.type, reporterId: user.id, reporterName: user.displayName, reporterType: user.actorType, reason, evidence, status: "open", createdAt: new Date().toISOString(), history: [] };
  productReports.push(record);
  return record;
}

export function visibleAbuseReports() {
  const user = getSession();
  if (!user) throw new Error("Sign in to continue.");
  if (user.actorType === "staff") {
    if (!can(user, "product_reports", "view")) throw new Error("Report access denied.");
    return structuredClone(productReports);
  }
  // Explicit projection: never return staff history, resolution, or other reporters.
  return productReports.filter((item) => item.reporterId === user.id && (!item.reporterType || item.reporterType === user.actorType)).map((item): ProductReport => ({
    id: item.id, productId: item.productId, productName: item.productName,
    targetType: item.targetType, reporterId: item.reporterId, reporterName: item.reporterName,
    reporterType: item.reporterType, reason: item.reason, evidence: item.evidence,
    status: item.status, createdAt: item.createdAt, publicOutcome: item.publicOutcome,
  }));
}

export function reviewAbuseReport(input: { id: string; status: ReportStatus; internalNote: string; publicOutcome: string }) {
  const user = getSession();
  if (!can(user, "product_reports", "moderate")) throw new Error("Report moderation permission required.");
  const record = productReports.find((item) => item.id === input.id);
  if (!record) throw new Error("Report not found.");
  const status = z.enum(["investigating", "resolved", "dismissed"]).parse(input.status);
  if (["resolved", "dismissed"].includes(record.status)) throw new Error("This report is already closed.");
  const internalNote = z.string().trim().min(1).max(4000).parse(input.internalNote);
  const publicOutcome = z.string().trim().max(2000).parse(input.publicOutcome);
  if (status !== "investigating" && !publicOutcome) throw new Error("A public outcome is required when closing a report.");
  record.status = status;
  record.publicOutcome = publicOutcome;
  (record.history ??= []).push({ at: new Date().toISOString(), by: user!.id, status, internalNote });
  return record;
}

export function useAbuseReports() {
  const user = getSession();
  return useQuery({ queryKey: ["abuse-reports", user?.id, user?.actorType], queryFn: visibleAbuseReports });
}
export function useSubmitAbuseReport() {
  return useMutation({ mutationFn: async (input: Parameters<typeof submitAbuseReport>[0]) => submitAbuseReport(input) });
}
export function useReviewAbuseReport() {
  return useMutation({ mutationFn: async (input: Parameters<typeof reviewAbuseReport>[0]) => reviewAbuseReport(input) });
}
