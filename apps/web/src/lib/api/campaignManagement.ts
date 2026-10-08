import { useMutation, useQueryClient } from "@tanstack/react-query";
import { campaigns, sellers } from "@/mocks/fixtures";
import type { Campaign } from "@/types";

export type CampaignValues = Pick<
  Campaign,
  "name" | "code" | "discountType" | "discountValue" | "startsAt" | "endsAt"
> & {
  tenantIds: string[];
  channel: "storefront" | "email" | "social";
  budget: number;
  usageLimit: number;
  description: string;
};
export function useCampaignManagement(actor: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (
      payload:
        | { action: "save"; id?: string; values: CampaignValues }
        | { action: "status"; id: string; status: Campaign["status"] }
        | { action: "delete"; id: string },
    ) => {
      const index = payload.id
        ? campaigns.findIndex((campaign) => campaign.id === payload.id)
        : -1;
      if (payload.id && index < 0) throw new Error("Campaign not found.");
      const now = new Date().toISOString();
      if (payload.action === "delete") {
        if (campaigns[index].usageCount > 0)
          throw new Error(
            "Campaigns with usage must be ended to preserve reporting.",
          );
        campaigns.splice(index, 1);
        return;
      }
      if (payload.action === "status") {
        const campaign = campaigns[index];
        if (
          payload.status === "scheduled" &&
          Date.parse(campaign.startsAt) <= Date.now()
        )
          throw new Error(
            "Scheduling requires a future start date. Edit the dates first.",
          );
        if (
          payload.status === "paused" &&
          campaign.status !== "active" &&
          campaign.status !== "scheduled"
        )
          throw new Error("Only active or scheduled campaigns can be paused.");
        if (
          payload.status === "active" &&
          (Date.parse(campaign.endsAt) < Date.now() ||
            Date.parse(campaign.startsAt) > Date.now())
        )
          throw new Error(
            "Activation requires a current campaign schedule. Edit the dates first.",
          );
        campaign.status = payload.status;
        campaign.updatedAt = now;
        campaign.history = [
          ...(campaign.history ?? []),
          { action: `Status: ${payload.status}`, actor, at: now },
        ];
        return;
      }
      const values = {
        ...payload.values,
        name: payload.values.name.trim(),
        code: payload.values.code?.trim().toUpperCase(),
      };
      if (!values.name || !values.code || !/^[A-Z0-9_-]+$/.test(values.code))
        throw new Error("Enter a name and valid code.");
      if (
        campaigns.some(
          (campaign) =>
            campaign.id !== payload.id && campaign.code === values.code,
        )
      )
        throw new Error("Campaign code already exists.");
      if (
        !Number.isFinite(values.discountValue) ||
        values.discountValue <= 0 ||
        (values.discountType === "percent" && values.discountValue > 70)
      )
        throw new Error(
          "Enter a positive discount; percentage discounts are limited to 70%.",
        );
      const start = Date.parse(values.startsAt);
      const end = Date.parse(values.endsAt);
      if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        end <= start ||
        end - start > 90 * 86400000
      )
        throw new Error("Set a valid schedule lasting no more than 90 days.");
      if (
        !Number.isFinite(values.budget) ||
        values.budget < 0 ||
        !Number.isSafeInteger(values.usageLimit) ||
        values.usageLimit < 1
      )
        throw new Error(
          "Enter a non-negative budget and positive whole-number usage limit.",
        );
      if (
        values.tenantIds.some(
          (id) => !sellers.some((seller) => seller.id === id),
        )
      )
        throw new Error("Select valid stores.");
      const existing = index >= 0 ? campaigns[index] : undefined;
      if (existing && values.usageLimit < existing.usageCount)
        throw new Error(
          "The redemption limit cannot be lower than recorded usage.",
        );
      if (
        existing?.status === "active" &&
        (start > Date.now() || end < Date.now())
      )
        throw new Error(
          "Pause the campaign before changing its schedule outside the current time.",
        );
      if (existing?.status === "scheduled" && start <= Date.now())
        throw new Error(
          "Pause the campaign before changing its scheduled start to the past.",
        );
      const campaign: Campaign = {
        ...(existing ?? {
          id: crypto.randomUUID(),
          status: "draft",
          usageCount: 0,
          revenueAttributed: 0,
          createdAt: now,
          createdBy: actor,
        }),
        ...values,
        updatedAt: now,
        history: [
          ...(existing?.history ?? []),
          {
            action: existing ? "Updated campaign" : "Created campaign",
            actor,
            at: now,
          },
        ],
      };
      if (index >= 0) campaigns[index] = campaign;
      else campaigns.push(campaign);
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
}
