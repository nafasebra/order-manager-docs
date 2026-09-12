import { z } from "zod";

export const listSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  pageSize: z.number().int().min(1).max(100).catch(25),
  sort: z.string().optional(),
  q: z.string().optional(),
});

export const orderStatusSchema = z.enum([
  "processing",
  "shipping",
  "delivered",
  "canceled",
]);

export const ordersSearchSchema = listSearchSchema.extend({
  status: orderStatusSchema.optional(),
});

export type ListSearch = z.infer<typeof listSearchSchema>;
export type OrdersSearch = z.infer<typeof ordersSearchSchema>;
