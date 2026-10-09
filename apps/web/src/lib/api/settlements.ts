import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { orders, sellers, transactions } from "@/mocks/fixtures";
import { getSession } from "@/lib/auth/store";
import { can } from "@/lib/permissions/can";
import { template } from "@/config/template";

const recordSchema = z.object({
  id: z.string(), sellerId: z.string(), amount: z.number().positive(),
  currency: z.string(), commissionRate: z.number(),
  status: z.enum(["pending", "approved", "rejected", "paid"]),
  createdAt: z.string(),
  history: z.array(z.object({ at: z.string(), by: z.string(), action: z.string(), reason: z.string(), reference: z.string().optional() })),
});
export type Settlement = z.infer<typeof recordSchema>;
export const settlements: Settlement[] = [];
export const DEMO_COMMISSION_RATE = 10;
const cents = (value: number) => Math.round(value * 100);

export function restoreSettlements(value: unknown) {
  const records = z.array(recordSchema).parse(value);
  settlements.splice(0, settlements.length, ...records);
}

/** Demo allocation: only delivered orders and completed customer payments. */
export function sellerSettlementBalance(sellerId: string, excludeId?: string) {
  let grossCents = 0;
  for (const order of orders) {
    if (order.status !== "delivered" || order.currency !== template.currency || order.total <= 0) continue;
    const subtotal = order.lineItems.filter((item) => item.sellerId === sellerId)
      .reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const ledger = transactions.filter((item) => item.orderId === order.id && item.currency === order.currency && item.status === "completed");
    const payments = ledger.filter((item) => item.type === "payment").reduce((sum, item) => sum + item.amount, 0);
    const refunds = ledger.filter((item) => item.type === "refund").reduce((sum, item) => sum + Math.abs(item.amount), 0);
    const net = Math.max(0, Math.min(order.total, payments) - refunds);
    grossCents += cents(net * subtotal / order.total);
  }
  const commissionCents = Math.round(grossCents * DEMO_COMMISSION_RATE / 100);
  const records = settlements.filter((item) => item.sellerId === sellerId && item.id !== excludeId && item.currency === template.currency);
  const paidCents = records.filter((item) => item.status === "paid").reduce((sum, item) => sum + cents(item.amount), 0);
  const reservedCents = records.filter((item) => item.status === "pending" || item.status === "approved").reduce((sum, item) => sum + cents(item.amount), 0);
  return { gross: grossCents / 100, commission: commissionCents / 100, paid: paidCents / 100, reserved: reservedCents / 100, available: (grossCents - commissionCents - paidCents - reservedCents) / 100 };
}

function authorize(action: "view" | "edit") {
  const user = getSession();
  if (!can(user, "transactions", action)) throw new Error("Settlement permission required.");
  return user!;
}

export function manageSettlement(input: { action: "create" | "approve" | "reject" | "pay"; sellerId?: string; id?: string; reason: string; reference?: string }) {
  const user = authorize("edit");
  const reason = z.string().trim().min(1).parse(input.reason);
  const at = new Date().toISOString();
  if (input.action === "create") {
    const seller = sellers.find((item) => item.id === input.sellerId);
    if (!seller || seller.status !== "enabled") throw new Error("Choose an enabled seller.");
    const amount = sellerSettlementBalance(seller.id).available;
    if (amount <= 0) throw new Error("No balance available for settlement.");
    const record: Settlement = { id: crypto.randomUUID(), sellerId: seller.id, amount, currency: template.currency, commissionRate: DEMO_COMMISSION_RATE, status: "pending", createdAt: at, history: [{ at, by: user.id, action: "create", reason }] };
    settlements.push(record);
    return record;
  }
  const record = settlements.find((item) => item.id === input.id);
  if (!record) throw new Error("Settlement not found.");
  if (input.action === "reject") {
    if (!["pending", "approved"].includes(record.status)) throw new Error("Only open settlements can be rejected.");
    record.status = "rejected";
  } else {
    if (record.status !== (input.action === "approve" ? "pending" : "approved")) throw new Error("Invalid settlement transition.");
    if (!sellers.some((item) => item.id === record.sellerId && item.status === "enabled")) throw new Error("Seller is disabled.");
    if (cents(sellerSettlementBalance(record.sellerId, record.id).available) < cents(record.amount)) throw new Error("Balance changed. Reject this settlement and recalculate.");
    if (input.action === "pay") {
      const reference = z.string().trim().min(1).parse(input.reference);
      if (settlements.some((item) => item.history.some((entry) => entry.reference === reference))) throw new Error("Payment reference already used.");
      transactions.push({ id: crypto.randomUUID(), reference: `PAYOUT-${record.id}`, type: "payout", status: "completed", amount: record.amount, currency: record.currency, sellerId: record.sellerId, externalRef: reference, createdAt: at, note: reason });
      record.status = "paid";
    } else record.status = "approved";
  }
  record.history.push({ at, by: user.id, action: input.action, reason, ...(input.action === "pay" ? { reference: input.reference!.trim() } : {}) });
  return record;
}

export function useSettlements() {
  return useQuery({ queryKey: ["settlements"], queryFn: () => {
    authorize("view");
    return { balances: sellers.map((seller) => ({ id: seller.id, name: seller.shopName, status: seller.status, ...sellerSettlementBalance(seller.id) })), records: structuredClone(settlements) };
  } });
}
export function useSettlementMutation() {
  return useMutation({ mutationFn: async (input: Parameters<typeof manageSettlement>[0]) => manageSettlement(input) });
}
