export type ActorType = "staff" | "seller" | "buyer";

export type PermissionArea =
  | "analytics"
  | "marketing"
  | "crm"
  | "orders"
  | "buyers"
  | "sellers"
  | "invoices"
  | "transactions"
  | "products"
  | "reviews"
  | "qa"
  | "product_reports"
  | "website"
  | "blog"
  | "tickets"
  | "admin_management";

export type Action =
  | "view"
  | "edit"
  | "create"
  | "update_status"
  | "refund"
  | "moderate"
  | "respond"
  | "manage_admins";

export type Grant = {
  area: PermissionArea;
  actions: Action[];
};

export type OrderStatus =
  | "processing"
  | "shipping"
  | "delivered"
  | "canceled";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "waiting"
  | "resolved"
  | "closed";

export type ContentStatus = "draft" | "published" | "archived";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type InvoiceStatus = "draft" | "issued" | "paid" | "void";

export type TransactionType = "payment" | "refund" | "payout" | "adjustment";

export type TransactionStatus = "pending" | "completed" | "failed";

export type ModerationStatus = "pending" | "approved" | "hidden" | "deleted";

export type ReportStatus = "open" | "investigating" | "resolved" | "dismissed";

export type CampaignStatus = "draft" | "scheduled" | "active" | "ended";

export type SessionUser = {
  id: string;
  displayName: string;
  email: string;
  actorType: ActorType;
  isSuperuser?: boolean;
  shopName?: string;
  sellerId?: string;
  buyerId?: string;
  grants?: Grant[];
};

export type Session = {
  user: SessionUser | null;
};

export type Paginated<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "conflict"
  | "validation"
  | "unknown";

export type FieldErrors = Record<string, string[]>;

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  status: number;
  fieldErrors?: FieldErrors;
};

export type Address = {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
};

export type WaySettingRow = {
  id: string;
  name: string;
  enabled: boolean;
  label: string;
  instructions: string;
  sortOrder: number;
};

export type OrderLineItem = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  sellerId: string;
  sellerName: string;
};

export type OrderHistoryEntry = {
  id: string;
  status: OrderStatus;
  at: string;
  note?: string;
  by?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerIds: string[];
  sellerNames: string[];
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  shippingAddress: Address;
  deliveryMethodSnapshot: string;
  paymentWaySnapshot: string;
  lineItems: OrderLineItem[];
  history: OrderHistoryEntry[];
  version: number;
};

export type Buyer = {
  id: string;
  name: string;
  email: string;
  username: string;
  status: "active" | "suspended";
  createdAt: string;
  orderCount: number;
  ticketCount: number;
  addresses: Address[];
};

export type Seller = {
  id: string;
  shopName: string;
  contactName: string;
  email: string;
  status: "enabled" | "disabled";
  createdAt: string;
  productCount: number;
  orderCount: number;
  deliveryMethods: WaySettingRow[];
  paymentWays: WaySettingRow[];
  workplaceAddress?: Address;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  sellerId: string;
  sellerName: string;
  price: number;
  currency: string;
  stock: number;
  status: ContentStatus;
  category: string;
  createdAt: string;
  updatedAt: string;
  description: string;
};

export type TicketMessage = {
  id: string;
  authorId: string;
  authorName: string;
  authorType: ActorType | "system";
  body: string;
  createdAt: string;
  internal?: boolean;
};

export type Ticket = {
  id: string;
  ticketNumber: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  channel: "site" | "buyer_seller";
  requesterId: string;
  requesterName: string;
  sellerId?: string;
  sellerName?: string;
  assigneeId?: string;
  assigneeName?: string;
  relatedOrderId?: string;
  relatedProductId?: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
};

export type InvoiceLine = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  buyerId: string;
  buyerName: string;
  orderId?: string;
  orderNumber?: string;
  total: number;
  currency: string;
  issuedAt?: string;
  createdAt: string;
  lines: InvoiceLine[];
};

export type Transaction = {
  id: string;
  reference: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  orderId?: string;
  invoiceId?: string;
  buyerId?: string;
  sellerId?: string;
  externalRef?: string;
  createdAt: string;
  note?: string;
};

export type Review = {
  id: string;
  productId: string;
  productName: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  title: string;
  body: string;
  status: ModerationStatus;
  createdAt: string;
  response?: string;
};

export type Question = {
  id: string;
  productId: string;
  productName: string;
  askerId: string;
  askerName: string;
  body: string;
  answer?: string;
  status: ModerationStatus;
  createdAt: string;
};

export type ProductReport = {
  id: string;
  productId: string;
  productName: string;
  reporterId: string;
  reporterName: string;
  reason: string;
  evidence?: string;
  status: ReportStatus;
  createdAt: string;
  resolution?: string;
};

export type Campaign = {
  id: string;
  name: string;
  status: CampaignStatus;
  discountType: "percent" | "fixed";
  discountValue: number;
  code?: string;
  startsAt: string;
  endsAt: string;
  usageCount: number;
  revenueAttributed: number;
  createdAt: string;
};

export type CrmContact = {
  id: string;
  name: string;
  email: string;
  type: "buyer" | "seller";
  linkedId: string;
  tags: string[];
  notes: string;
  lastActivityAt: string;
  createdAt: string;
};

export type SiteContext = {
  name: string;
  tagline: string;
  contactEmail: string;
  contactPhone?: string;
  defaultSeoTitle: string;
  defaultSeoDescription: string;
  homepageCopy: string;
};

export type SitePage = {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  updatedAt: string;
  body: string;
};

export type BlogComment = {
  id: string;
  authorName: string;
  body: string;
  status: ModerationStatus;
  createdAt: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  status: ContentStatus;
  excerpt: string;
  body: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  comments: BlogComment[];
};

export type AdminAccount = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "support" | "editor" | "custom";
  isSuperuser: boolean;
  status: "active" | "suspended";
  grants: Grant[];
  createdAt: string;
};

export type SalesPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type StatusMixPoint = {
  status: OrderStatus;
  count: number;
  label: string;
};

export type RankedItem = {
  id: string;
  name: string;
  value: number;
};

export type AdminStats = {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  aov: number;
  aovChange: number;
  openTickets: number;
  pendingReviews: number;
  salesSeries: SalesPoint[];
  statusMix: StatusMixPoint[];
  topProducts: RankedItem[];
  topSellers: RankedItem[];
};

export type SellerStats = Omit<AdminStats, "topSellers" | "pendingReviews"> & {
  lowStock: Product[];
  recentTickets: Ticket[];
};

export type ListParams = {
  page?: number;
  pageSize?: number;
  sort?: string;
  q?: string;
  status?: string;
  [key: string]: string | number | undefined;
};
