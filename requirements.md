# E-Commerce Marketplace — Requirements

## 1. Overview

One marketplace, **three panels**:

```
                    MARKETPLACE
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ADMIN PANEL     SELLER PANEL    BUYER PANEL
         │               │               │
    ┌────┴────┐          │               ├── Profile
    │         │          ├── Analytics   ├── Addresses
  ADMIN  SUPPORT EDITOR  ├── Products    ├── Orders
  (full) (ops) (content) ├── Orders      └── Tickets
                         └── Tickets
```

**Goals**

- **Admin panel:** full operators run the marketplace. **Support** is a limited ops role (tickets + people + order view). **Editor** is a limited content role (**website context** + blog posts). Neither is a fourth panel; no admin management or refunds unless granted.
- **Seller panel:** each vendor runs their shop (analytics, products, orders, tickets, **delivery methods**, **payment ways**), isolated by `seller_id`.
- **Buyer panel:** each customer manages their account (profile, addresses, own orders, own tickets), isolated by `buyer_id`.
- Superuser is a full Admin with every Admin-panel module plus staff management.

**Out of scope (for now)**

- Payment gateway integration details (captured at transaction level only)
- Full public marketing storefront chrome (browse/cart may share the buyer session; this spec covers the **buyer panel**)

---

## 2. Actors & Roles

| Role | Panel | Description |
|------|--------|-------------|
| **Admin** | Admin | Operates the marketplace (catalog, commerce, content, people, settings) within assigned permissions. Superuser = unrestricted Admin + staff management. |
| **Support** | Admin (limited) | Same Admin panel. Typical grants: Buyers, Sellers, Tickets, Orders **view**. Cannot manage staff, issue refunds, or edit marketing/website/blog unless extra grants are added. |
| **Editor** | Admin (limited) | Same Admin panel. Typical grants: **Website context** and **Blog** (view / edit). Manages public-site copy, pages, posts, and comments. No commerce, people directories, refunds, or staff management unless extra grants. |
| **Seller** | Seller | Vendor. Modules: **analytics**, **products**, **orders**, **tickets**, **settings** (delivery methods, payment ways) — own shop only. Also a people record Admin/Support can manage. |
| **Buyer** | Buyer | Customer. Modules: **profile**, **addresses**, **orders**, **tickets** — own account only. Also a people record Admin/Support can manage. |

---

## 3. Global Panel Requirements

Three shells: **Admin panel** (full Admin, limited Support, or limited **Editor**), **Seller panel**, **Buyer panel**.

- Responsive layout usable on desktop (primary) and tablet.
- Admin: global search across orders, buyers, sellers, products, and tickets (stretch). Seller: own products, orders, tickets. Buyer: own orders and tickets.
- Audit trail for sensitive actions (staff changes, order status, product removals, seller/buyer mutations).
- Consistent list views: filter, sort, pagination, bulk actions where applicable.
- Detail views with related records (e.g. order → buyer, seller, invoice, transactions).
- Seller never sees another seller’s records. Buyer never sees another buyer’s records.
- Admin/Support manage **people records** (all buyers and sellers). Seller and Buyer panels never expose those directories.

---

## 4. Analytics

**Purpose:** High-level and drill-down metrics for business decisions.

**By panel**

- **Admin panel:** platform-wide metrics (all sellers), if granted Analytics. Support typically does **not** get Analytics.
- **Seller panel:** shop metrics **scoped to that seller only**.
- **Buyer panel:** no marketplace analytics (order history is enough).

**Metrics & views**

- Revenue (daily / weekly / monthly / custom range)
- Order volume and average order value
- Order status breakdown (processing, shipping, delivered, canceled)
- Top products by sales and revenue
- Top sellers by volume and revenue
- Buyer acquisition and repeat purchase rate
- Conversion funnel (if storefront data is available)

**Features**

- Date range picker and comparison to previous period
- Export reports (CSV / PDF — TBD)
- Dashboard widgets on home/overview page

---

## 5. Marketing

**Purpose:** Campaigns and promotional activity tied to the storefront.

**Features**

- Discount codes / coupons (create, edit, deactivate, usage stats)
- Promotional banners or featured products (if storefront supports them)
- Email or notification campaign tracking (sent, opened, clicked — if integrated)
- Campaign performance linked to orders and revenue

**Data**

- Campaign name, type, start/end date, status (draft / active / ended)
- Associated products, categories, or sellers (optional)

---

## 6. CRM

**Purpose:** Relationship management for buyers and sellers (Admin panel). Internal notes are never shown on seller or buyer panels.

**Features**

- Unified contact profiles (buyers and sellers)
- Activity timeline (orders, tickets, notes)
- Internal notes on buyer/seller records (visible to admins only)
- Segmentation tags (e.g. VIP buyer, high-volume seller, at-risk)
- Optional: task/reminder assignment to admins

**Integrations**

- Links to orders, tickets, and transactions from CRM profiles

---

## 7. Orders

**Purpose:** Full lifecycle management of marketplace orders.

**Order statuses**

| Status | Description |
|--------|-------------|
| Processing | Paid or confirmed; awaiting fulfillment |
| Shipping | Handed off to carrier / in transit |
| Delivered | Completed successfully |
| Canceled | Canceled before or after payment (with reason) |

**Order fields**

- Order ID, created/updated timestamps
- Buyer (linked profile)
- Seller(s) per line item or split orders
- Line items: product, quantity, unit price, specifications (e.g. color)
- Shipping address
- Delivery method (snapshot of how this order ships / is picked up)
- Payment way (snapshot of how the buyer paid / will pay this order)
- Status history with actor and timestamp

**Actions (Admin / Support as permitted)**

- View list and detail (CRUD on order **information** — create/read/update as allowed by role; delete restricted or soft-delete)
- Update status (processing → shipping → delivered)
- Cancel with mandatory reason
- Assign or reassign to fulfillment workflow (if applicable)
- View linked invoice and transactions

**Actions (seller panel)**

- List and view **orders that include this seller** (line items / splits for `seller_id`)
- Update status on **their** fulfillment (processing → shipping → delivered)
- Cancel **their** unfilled split with mandatory reason (does not auto-refund)
- View shipping snapshot and buyer contact needed for fulfillment
- Cannot see other sellers’ line items on a split order; cannot initiate refunds or edit invoices

**Actions (buyer panel)**

- List and view **own** orders only
- Cancel own order when status still allows it (same machine: not after `delivered`; reason required)
- Cannot update fulfillment status, refund, or see other buyers’ orders

---

## 8. Buyers

**Purpose:** Customer accounts. Admin/Support manage all buyers on the Admin panel. Each buyer signs in to the **buyer panel**.

**Fields**

- Name
- Username
- Email / login
- Password (buyer panel)
- Addresses (multiple: billing, shipping, default flags)
- Registration date, last activity
- Order history (linked)
- Support tickets (linked)
- Status (`active`, `suspended`, `anonymized`)

**Actions (Admin / Support)**

- CRUD buyer records (delete = soft-delete or anonymize per policy)
- View/edit addresses
- View order and ticket history from profile
- Suspend buyer (blocks buyer-panel login)
- Provision or reset buyer panel login

### 8.1 Buyer panel

Buyers sign in to a **separate panel** (session bound to `buyer_id`). They are not Admin or Seller.

| Module | Buyer can |
|--------|-----------|
| **Profile** | View/edit own name, username, email, password. |
| **Addresses** | CRUD own addresses; default shipping/billing flags. |
| **Orders** | List/detail own orders; cancel when allowed; see line items and status history. |
| **Tickets** | Open, list, and reply on tickets where they are the requester (site and buyer–seller). |

**Buyer panel does not include:** analytics, catalog management, other buyers/sellers, invoices/refunds, marketing, blog, or staff settings.

---

## 9. Sellers

**Purpose:** Manage marketplace vendors (Admin panel people records) and their storefront settings.

**Fields**

- Business / display name
- Contact information (linked to buyer-style profile where applicable)
- Workplace address (free text and/or map location)
- **Delivery methods** offered (how this seller ships / offers pickup: e.g. standard, express, pickup)
- **Payment ways** offered (how buyers can pay this seller: e.g. cash on delivery, bank transfer, card via platform, wallet)
- Buyer support channel settings (how buyers reach this seller)
- Products listed (linked)
- Payout / transaction summary (linked)

**Actions (staff)**

- CRUD seller records
- Enable / disable seller account (disabled sellers cannot sign in to the seller panel)
- Edit delivery methods, **payment ways**, and support settings
- View orders and tickets involving this seller
- Provision or reset seller panel login

### 9.1 Seller panel

Sellers sign in to the **seller panel** (session bound to `seller_id`). They are not Admin or Buyer.

| Module | Seller can |
|--------|------------|
| **Analytics** | View metrics for their shop only (revenue, order volume, AOV, status breakdown, top products). Date range and comparison as in §4, scoped. |
| **Products** | CRUD their own catalog: images, variants, stock, publish / unpublish. Cannot change seller association or edit another seller’s products. |
| **Orders** | List/detail for orders that include this seller; advance or cancel **their** fulfillment; see buyer/shipping snapshot on those orders. |
| **Tickets** | List, open, reply, and update status on **buyer ↔ seller** tickets for their shop. No site-support tickets and no other sellers’ tickets. |
| **Settings** | Shop profile, **delivery methods** (shipping ways), **payment ways**, and buyer-support channels. |

**Delivery methods (seller settings)**

Sellers configure **which shipping / delivery ways buyers may choose** at checkout for this shop. Same Settings panel as payment ways.

| Field | Notes |
|-------|--------|
| Code | e.g. `standard`, `express`, `pickup`, custom |
| Label | Display name |
| Enabled | Offered to buyers when true |
| Instructions | Optional (e.g. pickup address, lead time, packing notes). Plain text only. |
| Sort order | Checkout display order |

Platform may limit which codes exist. Historical orders keep a **delivery-method snapshot**. Pickup vs ship-address rules apply at checkout (EC-ORD-17).

**Payment ways (seller settings)**

Sellers configure **which payment ways buyers may use** at checkout for this shop. This is settings, not a payment gateway.

| Field | Notes |
|-------|--------|
| Code | e.g. `cod`, `bank_transfer`, `card`, `wallet`, custom |
| Label | Display name |
| Enabled | Offered to buyers when true |
| Instructions | Optional (e.g. bank name, account holder, IBAN/reference). **No card numbers or CVV.** |
| Sort order | Checkout display order |

Platform may limit which codes exist (catalog of allowed ways). Enabling `card` / `wallet` means “accept this platform-supported way”; gateway keys stay with the platform (requirements §1 out of scope). Historical orders keep a **payment-way snapshot**.

**Seller panel does not include:** marketing, CRM, invoices/transactions/refunds, buyers/sellers directories, reviews/Q&A/report moderation, blog, or admin management.

---

## 10. Invoices

**Purpose:** Billing documents for orders and manual billing.

**Types**

- **Single invoice** — view/download existing invoice tied to an order
- **Create invoice** — manual invoice generation (one-off or custom line items)

**Fields**

- Invoice number, issue date, due date (if applicable)
- Buyer and seller references
- Line items, subtotal, tax, shipping, total
- Status (draft, issued, paid, void)
- PDF generation / download

**Actions**

- List, filter, and search invoices
- Create new invoice
- View and download
- Void or amend (with audit log)

---

## 11. Transactions

**Purpose:** Financial movements linked to orders and invoices.

**Fields**

- Transaction ID, timestamp
- Type (payment, refund, payout, adjustment)
- Amount, currency
- Status (pending, completed, failed, reversed)
- Linked order, invoice, buyer, seller
- Payment method reference (external ID only)

**Actions**

- List and filter transactions
- View detail
- Initiate refund (role-gated, with confirmation)
- Export for accounting (stretch goal)

---

## 12. Website Products

**Purpose:** Catalog management. Admin can manage any product. **Sellers manage only their own products** from the seller panel.

**Fields**

- Name
- Technical description (long-form specs for product page)
- Stock quantity
- Photo(s) — primary and gallery
- Available specifications (e.g. color, size) — variant-level where needed
- Technical specifications (structured key/value or table)
- Seller association (marketplace)
- Status (draft, published, out of stock, archived)
- Price (and optional sale price)

**Actions**

- CRUD products
- Upload/manage images
- Manage variants and specification options
- Adjust stock
- Publish / unpublish

---

## 13. Product Reviews

**Purpose:** Moderate buyer-submitted product reviews (site-managed).

**Fields**

- Product, buyer, rating, title, body, date
- Status (pending, approved, hidden, flagged)
- Admin response (optional)

**Actions**

- List and filter (by product, rating, status)
- Approve, hide, or delete reviews
- Reply on behalf of site or seller (policy TBD)

---

## 14. Product Q&A

**Purpose:** Moderate questions and answers on product pages (site-managed).

**Fields**

- Product, asker (buyer), question text, date
- Answer(s), answered by (seller or admin), date
- Status (pending, published, hidden)

**Actions**

- List, approve, edit, or remove Q&A
- Post official answers as admin

---

## 15. Product Reports

**Purpose:** Handle user reports of problematic products (incorrect info, policy violation, counterfeit, etc.).

**Workflow**

| Status | Description |
|--------|-------------|
| Pending review | New report awaiting admin action |
| Approved | Report validated — triggers product change or removal |
| Rejected | Report dismissed |

**Fields**

- Product, reporter (buyer), reason/category, description, evidence (optional)
- Reviewer (admin), review notes, resolution action

**Actions on approval**

- Request seller edit
- Admin edit product directly
- Remove product from catalog (with notification to seller)
- Warn or suspend seller (stretch goal)

---

## 16. Website and blog

Public-site content lives on the **Admin panel**. Sellers and buyers do not edit it.

### 16.1 Website context

**Purpose:** Manage the **website context** shown on the public storefront: site identity, default SEO, contact, and static pages (About, Terms, Privacy, FAQ, custom).

**Site context fields**

- Site name, tagline
- Logo and favicon
- Contact email / phone, social links
- Default meta title and description
- Homepage featured copy / hero (when the storefront exists)
- Footer / legal-link order

**Website pages**

| Field | Notes |
|-------|--------|
| Code / type | `about`, `terms`, `privacy`, `faq`, or `custom` |
| Title, slug | Slug unique |
| Body | Rich text |
| Status | draft, published, archived |
| SEO title / description | Optional override of site defaults |
| Sort order | Nav / footer order |

**Actions**

- Edit site context (identity, contact, default SEO, homepage copy)
- CRUD website pages; publish / unpublish
- Required legal types (`terms`, `privacy`) cannot be hard-deleted

This is **site copy**, not catalog, marketing campaigns, or seller shop settings.

### 16.2 Blog

**Purpose:** Posts and reader comments on the website.

**Post fields**

- Title, slug, body (rich text), featured image
- Author (admin), publish date, status (draft, published, archived)
- Categories / tags (optional)

**Comment moderation**

- List comments per post
- Approve, hide, or delete
- Mark spam

**Actions**

- CRUD posts
- Schedule or publish immediately
- Moderate comments from the Admin panel

---

## 17. Admins

**Purpose:** Admin-panel staff accounts. **Support** and **Editor** are limited roles on this same panel (role templates), not separate products.

**Role templates (Admin panel)**

| Template | Typical access |
|----------|----------------|
| **Admin** | Commerce, catalog, content, marketing, CRM, analytics — as granted. Superuser = all Admin-panel modules + admin management. |
| **Support** | **Limited ops:** Buyers, Sellers, Tickets, Orders **view**. No staff management, no refunds, no website/blog unless extra grants. |
| **Editor** | **Limited content:** Website context + Blog (view / edit, including comment moderation). No commerce, people directories, refunds, or staff management unless extra grants. |

**Fields**

- Name, email, username
- Role template (`admin`, `support`, `editor`, or custom) or custom permission set
- Status (active, suspended)
- Last login

**Permission areas (examples)**

- Analytics (view)
- Marketing (view / edit)
- CRM (view / edit)
- Orders (view / update status)
- Buyers, Sellers (view / edit)
- Invoices, Transactions (view / create / refund)
- Products, Reviews, Q&A, Reports (view / moderate)
- Website (view / edit) — site context and pages
- Blog (view / edit)
- Tickets (view / respond)
- Admin management (superuser only)

**Actions**

- List all admins (superuser)
- Create, edit, suspend admins
- Assign or revoke permissions
- Promote to superuser or demote (superuser only)

---

## 18. Tickets (Support)

**Purpose:** Two parallel support channels.

| Type | Description |
|------|-------------|
| **Site support** | Buyer ↔ platform (account, billing, general site issues) |
| **Buyer support** | Buyer ↔ seller (order-specific, product issues) |

**Fields**

- Ticket ID, subject, description, priority, status (open, in progress, waiting, resolved, closed)
- Type (site / buyer-seller)
- Requester (buyer), assignee (admin); seller is the vendor party on buyer–seller tickets
- Related order / product (optional)
- Message thread with timestamps

**Actions**

- **Support (limited admin):** list and filter tickets; assign; reply; open linked buyer/seller/order
- **Admin:** same as granted; superuser sees **all** tickets
- **Seller panel:** list/reply/status only on buyer–seller tickets for their shop
- **Buyer panel:** open/list/reply only on tickets where they are the requester

---

## 19. Superuser — Specific Requirements

The superuser (elevated **Admin** on the Admin panel) must:

- Access **every page and module** in the **Admin panel** without permission restrictions.
- Perform **full CRUD** on orders and related operational data (within business rules above).
- View **all tickets** — both site support and buyer/seller support — with global filters.
- Open the **admin management** page: list all Admin-panel users (including Support and Editor), create/edit/suspend, assign permissions, promote or demote roles.
- Superuser does **not** use the seller or buyer panels to operate those shops/accounts; those stay on their own panels.

---

## 20. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| **Security** | Authentication required; session timeout; HTTPS in production |
| **Authorization** | Permission checks on every route and API action |
| **Performance** | List pages load within ~2s for typical datasets; pagination required |
| **Availability** | Target 99.5% uptime (production) |
| **Data** | Soft-delete for buyers/sellers/products where legally required; backup strategy TBD |
| **Localization** | UI language TBD; currency and date formatting configurable |
| **Accessibility** | WCAG 2.1 AA target for Admin, Seller, and Buyer panels |

---

## 21. Suggested Module Map (Navigation)

```
MARKETPLACE
├── Admin panel          ← Admin (full) | Support (ops) | Editor (content)
│   ├── Analytics
│   ├── Marketing
│   ├── CRM
│   ├── Commerce (Orders, Invoices, Transactions)
│   ├── People (Buyers, Sellers)
│   ├── Catalog (Products, Reviews, Q&A, Reports)
│   ├── Content (Website context, Blog)
│   ├── Tickets
│   └── Settings → Admins (superuser)
├── Seller panel         ← Seller (own shop)
│   ├── Analytics
│   ├── Products
│   ├── Orders
│   ├── Tickets
│   └── Settings (delivery methods, payment ways)
└── Buyer panel          ← Buyer (own account)
    ├── Profile
    ├── Addresses
    ├── Orders
    └── Tickets
```

---

## 22. Open Questions

- [ ] Multi-currency and multi-language from day one?
- [ ] Payment provider(s) and webhook handling scope?
- [ ] Email/SMS notifications for order and ticket events?
- [ ] Data retention policy for canceled orders and deleted users?

---

## 23. Phasing (Suggested)

| Phase | Scope |
|-------|--------|
| **MVP** | Admin panel (Admin / Support), orders, people, products; **seller panel** (products + orders + **delivery methods** + **payment ways**); **buyer panel** (profile, addresses, own orders); site tickets |
| **Phase 2** | Invoices, transactions, reviews, Q&A, product reports, buyer–seller tickets on Admin, Seller, and Buyer panels |
| **Phase 3** | Analytics (Admin + Seller), marketing, CRM, **website context**, blog, **Editor** role, advanced exports and audit UI |
