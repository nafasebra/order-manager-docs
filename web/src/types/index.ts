export type ActorType = 'admin' | 'seller' | 'buyer'

export type PermissionArea =
  | 'analytics'
  | 'marketing'
  | 'crm'
  | 'orders'
  | 'buyers'
  | 'sellers'
  | 'invoices'
  | 'transactions'
  | 'products'
  | 'reviews'
  | 'qa'
  | 'product_reports'
  | 'website'
  | 'blog'
  | 'tickets'
  | 'admin_management'

export type PermissionAction =
  | 'view'
  | 'edit'
  | 'create'
  | 'update_status'
  | 'refund'
  | 'moderate'
  | 'respond'
  | 'manage_admins'

export type OrderStatus = 'processing' | 'shipping' | 'delivered' | 'canceled'
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'
export type TicketType = 'site' | 'buyer_seller'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type ProductStatus = 'draft' | 'published' | 'out_of_stock' | 'archived'
export type UserStatus = 'active' | 'suspended'
export type SellerStatus = 'enabled' | 'disabled'
export type AddressType = 'shipping' | 'billing' | 'other'

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface PermissionGrant {
  area: PermissionArea
  actions: PermissionAction[]
}

export interface AdminUser {
  id: string
  name: string
  email: string
  username: string
  isSuperuser: boolean
  status: UserStatus
  roleTemplateId: string | null
  permissionVersion: number
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Buyer {
  id: string
  name: string
  username: string
  email: string
  status: UserStatus | 'anonymized'
  registeredAt: string
  lastActivityAt: string
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  buyerId: string
  type: AddressType
  line: string
  city: string
  region: string
  postalCode: string
  country: string
  isDefaultShipping: boolean
  isDefaultBilling: boolean
}

export interface Seller {
  id: string
  displayName: string
  contactName: string
  contactEmail: string
  contactPhone: string
  loginEmail: string
  workplaceAddressText: string
  status: SellerStatus
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SellerWay {
  id: string
  sellerId: string
  code: string
  label: string
  enabled: boolean
  instructions: string
  sortOrder: number
}

export interface Product {
  id: string
  sellerId: string
  name: string
  technicalDescription: string
  price: number
  salePrice: number | null
  status: ProductStatus
  stockQty: number
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  isPrimary: boolean
  sortOrder: number
}

export interface OrderLineItem {
  id: string
  orderId: string
  sellerId: string
  productId: string
  productNameSnapshot: string
  quantity: number
  unitPriceSnapshot: number
}

export interface OrderSplit {
  orderId: string
  sellerId: string
  status: OrderStatus
}

export interface OrderStatusHistoryEntry {
  id: string
  orderId: string
  fromStatus: OrderStatus | null
  toStatus: OrderStatus
  actorAdminId: string | null
  actorSellerId: string | null
  orderSplitId: string | null
  note: string | null
  createdAt: string
}

export interface AddressSnapshot {
  line: string
  city: string
  region: string
  postalCode: string
  country: string
}

export interface WaySnapshot {
  code: string
  label: string
  instructions: string
}

export interface Order {
  id: string
  orderNumber: string
  buyerId: string
  status: OrderStatus
  shippingAddressSnapshot: AddressSnapshot
  deliveryMethodSnapshot: WaySnapshot
  paymentWaySnapshot: WaySnapshot
  cancelReason: string | null
  currency: string
  version: number
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: string
  ticketNumber: string
  type: TicketType
  subject: string
  description: string
  priority: TicketPriority
  status: TicketStatus
  requesterBuyerId: string
  sellerId: string | null
  assigneeAdminId: string | null
  relatedOrderId: string | null
  relatedProductId: string | null
  createdAt: string
  updatedAt: string
}

export interface TicketMessage {
  id: string
  ticketId: string
  authorType: ActorType | 'system'
  authorAdminId: string | null
  authorSellerId: string | null
  authorBuyerId: string | null
  body: string
  createdAt: string
}

export interface SessionUser {
  actorType: ActorType
  id: string
  name: string
  email: string
  isSuperuser?: boolean
  sellerId?: string
  buyerId?: string
  grants?: PermissionGrant[]
}

export interface OverviewStats {
  revenue: number
  revenueChange: number
  orders: number
  ordersChange: number
  customers: number
  customersChange: number
  avgOrder: number
  avgOrderChange: number
}

export interface SalesTrendPoint {
  label: string
  revenue: number
  orders: number
}

export interface StatusMixPoint {
  status: OrderStatus
  label: string
  count: number
}

export interface TopProductPoint {
  id: string
  name: string
  revenue: number
  orders: number
}

export interface TopSellerPoint {
  id: string
  name: string
  revenue: number
  orders: number
}

export interface ListParams {
  page?: number
  pageSize?: number
  sort?: string
  search?: string
  status?: string
}
