# E-Commerce Site Management Dashboard — Requirements

## 1. Overview

A centralized admin dashboard for managing an e-commerce marketplace. The platform connects **buyers** and **sellers**, handles orders end-to-end, and provides tools for analytics, marketing, CRM, content, and support.

**Goals**

- Give staff a single place to operate the storefront and marketplace.
- Support role-based access so each admin sees only what they need.
- Provide full visibility and control for superusers.

**Out of scope (for now)**

- Public storefront / buyer-facing shop UI
- Seller self-service portal (unless noted as future work)
- Payment gateway integration details (captured at transaction level only)

---

## 2. Actors & Roles

| Role | Description |
|------|-------------|
| **Superuser** | Full access to every module, all data, and admin management (promote/demote admins, assign permissions). |
| **Admin** | Access scoped by assigned permissions (see §15). |
| **Buyer** | End customer (managed via dashboard; not a dashboard user). |
| **Seller** | Marketplace vendor (managed via dashboard; not a dashboard user by default). |
| **Support** | Supporting users (Buyer and sellers) |

---

## 3. Global Dashboard Requirements

- Responsive layout usable on desktop (primary) and tablet.
- Global search across orders, buyers, sellers, products, and tickets (stretch goal).
- Audit trail for sensitive actions (admin changes, order status updates, product removals).
- Consistent list views: filter, sort, pagination, bulk actions where applicable.
- Detail views with related records (e.g. order → buyer, seller, invoice, transactions).

---

## 4. Analytics

**Purpose:** High-level and drill-down metrics for business decisions.

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

**Purpose:** Relationship management for buyers and sellers.

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
- Delivery method
- Status history with actor and timestamp

**Actions**

- View list and detail (CRUD on order **information** — create/read/update as allowed by role; delete restricted or soft-delete)
- Update status (processing → shipping → delivered)
- Cancel with mandatory reason
- Assign or reassign to fulfillment workflow (if applicable)
- View linked invoice and transactions

---

## 8. Buyers

**Purpose:** Manage customer accounts and related data.

**Fields**

- Name
- Username
- Email
- Addresses (multiple: billing, shipping, default flags)
- Registration date, last activity
- Order history (linked)
- Support tickets (linked)

**Actions**

- CRUD buyer records (delete = soft-delete or anonymize per policy)
- View/edit addresses
- View order and ticket history from profile

---

## 9. Sellers

**Purpose:** Manage marketplace vendors and their storefront settings.

**Fields**

- Business / display name
- Contact information (linked to buyer-style profile where applicable)
- Workplace address (free text and/or map location)
- Delivery methods offered (e.g. standard, express, pickup)
- Buyer support channel settings (how buyers reach this seller)
- Products listed (linked)
- Payout / transaction summary (linked)

**Actions**

- CRUD seller records
- Enable / disable seller account
- Edit delivery methods and support settings
- View orders and tickets involving this seller

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

**Purpose:** Catalog management for items sold on the site.

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

## 16. Blog

**Purpose:** Content management for blog posts and reader comments.

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
- Moderate comments from dashboard

---

## 17. Admins

**Purpose:** Staff accounts with granular access control.

**Fields**

- Name, email, username
- Role template or custom permission set
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
- Requester (buyer), assignee (admin or seller context)
- Related order / product (optional)
- Message thread with timestamps

**Actions**

- List and filter by type, status, buyer, seller
- Assign to admin
- Reply and change status
- Superuser: view **all** tickets across buyers and sellers

---

## 19. Superuser — Specific Requirements

The superuser role must:

- Access **every page and module** in the dashboard without permission restrictions.
- Perform **full CRUD** on orders and related operational data (within business rules above).
- View **all tickets** — both site support and buyer/seller support — with global filters.
- Open the **admin management** page: list all admins, create/edit/suspend, assign permissions, promote or demote roles.

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
| **Accessibility** | WCAG 2.1 AA target for admin UI |

---

## 21. Suggested Module Map (Navigation)

```
Dashboard (overview / analytics snapshot)
├── Analytics
├── Marketing
├── CRM
├── Commerce
│   ├── Orders
│   ├── Invoices
│   └── Transactions
├── People
│   ├── Buyers
│   └── Sellers
├── Catalog
│   ├── Products
│   ├── Reviews
│   ├── Q&A
│   └── Product Reports
├── Content
│   └── Blog
├── Support
│   └── Tickets
└── Settings
    └── Admins (superuser)
```

---

## 22. Open Questions

- [ ] Multi-currency and multi-language from day one?
- [ ] Seller self-service portal in phase 1 or later?
- [ ] Payment provider(s) and webhook handling scope?
- [ ] Email/SMS notifications for order and ticket events?
- [ ] Data retention policy for canceled orders and deleted users?

---

## 23. Phasing (Suggested)

| Phase | Scope |
|-------|--------|
| **MVP** | Auth, admins/permissions, orders, buyers, sellers, products, tickets (site support) |
| **Phase 2** | Invoices, transactions, reviews, Q&A, product reports, buyer-seller tickets |
| **Phase 3** | Analytics, marketing, CRM, blog, advanced exports and audit UI |
