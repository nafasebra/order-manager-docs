import { z } from 'zod'

const sortField = z.string().optional().catch(undefined)

export const listSearchSchema = z.object({
  page: z.number().int().min(1).catch(1),
  pageSize: z.number().int().min(1).max(100).catch(25),
  search: z.string().optional().catch(undefined),
  status: z.string().optional().catch(undefined),
  sort: sortField,
})

export type ListSearch = z.infer<typeof listSearchSchema>

export const ordersSearchSchema = listSearchSchema.extend({
  status: z.enum(['processing', 'shipping', 'delivered', 'canceled']).optional().catch(undefined),
})

export type OrdersSearch = z.infer<typeof ordersSearchSchema>

export const productsSearchSchema = listSearchSchema.extend({
  status: z.enum(['draft', 'published', 'out_of_stock', 'archived']).optional().catch(undefined),
})

export type ProductsSearch = z.infer<typeof productsSearchSchema>

export const ticketsSearchSchema = listSearchSchema.extend({
  status: z.enum(['open', 'in_progress', 'waiting', 'resolved', 'closed']).optional().catch(undefined),
  type: z.enum(['site', 'buyer_seller']).optional().catch(undefined),
})

export type TicketsSearch = z.infer<typeof ticketsSearchSchema>

export const buyersSearchSchema = listSearchSchema.extend({
  status: z.enum(['active', 'suspended']).optional().catch(undefined),
})

export type BuyersSearch = z.infer<typeof buyersSearchSchema>

export const sellersSearchSchema = listSearchSchema.extend({
  status: z.enum(['enabled', 'disabled']).optional().catch(undefined),
})

export type SellersSearch = z.infer<typeof sellersSearchSchema>

export const adminsSearchSchema = listSearchSchema.extend({
  status: z.enum(['active', 'suspended']).optional().catch(undefined),
})

export type AdminsSearch = z.infer<typeof adminsSearchSchema>

/** @deprecated Use resource-specific schemas that include sort/filter */
export const paginationOnlySchema = listSearchSchema.pick({ page: true, pageSize: true })
