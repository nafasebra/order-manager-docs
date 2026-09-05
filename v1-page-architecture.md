# Marketplace — V1 Page Architecture

## Scope

Three panels (see [requirements.md](./requirements.md)):

Implementation: [frontend-architecture.md](./frontend-architecture.md) · UI kit: [design-system.md](./design-system.md)

- **Admin panel** — full **Admin**, **Support** (ops), and **Editor** (website + blog) on the same panel.
- **Seller panel** — Analytics, Products, Orders, Tickets, Settings (delivery methods + payment ways).
- **Buyer panel** — Profile, Addresses, Orders, Tickets.

## Shared foundation

### Supporting authentication routes (architecture inference)

~~~text
/auth
├── /login
├── /forgot-password
├── /reset-password
├── /verify-email
└── /session-expired
~~~

All routes/actions enforce authorization. List pages use search, filters, sorting, pagination, and safe bulk actions. Detail pages link related records. Sensitive actions use confirmation and an audit trail.

## 1. Admin panel

Base route: /admin. **Admin** vs **Support** access follows assigned permissions. Superusers have full staff access.

Buyers and Sellers under this panel are **people records** (directories). Those users also have their own panels.

~~~text
/admin
├── /                                      Overview
├── /analytics                             Analytics overview
├── /marketing                             Campaign list
├── /marketing/new                         Create campaign
├── /marketing/:campaignId                 Campaign detail/performance
├── /crm                                   Contacts and segments
├── /crm/:contactId                        Buyer/seller contact profile
├── /orders                                Order list
├── /orders/:orderId                       Order detail
├── /invoices                              Invoice list
├── /invoices/new                          Create manual invoice
├── /invoices/:invoiceId                   Invoice detail
├── /transactions                          Transaction list
├── /transactions/:transactionId           Transaction detail
├── /buyers                                Buyer list
├── /buyers/:buyerId                       Buyer profile
├── /sellers                               Seller list
├── /sellers/new                           Create/provision seller
├── /sellers/:sellerId                     Seller profile
├── /products                              Product catalog
├── /products/new                          Create product
├── /products/:productId                   Product detail
├── /products/:productId/edit              Edit product
├── /reviews                               Review moderation
├── /reviews/:reviewId                     Review detail
├── /questions                             Product Q&A moderation
├── /questions/:questionId                 Q&A detail
├── /product-reports                       Product-report queue
├── /product-reports/:reportId             Report investigation/resolution
├── /website                               Site context (identity, SEO, contact)
├── /website/pages                         Website page list
├── /website/pages/new                     Create page
├── /website/pages/:pageId                 Page detail/edit
├── /blog                                  Post list
├── /blog/new                              Create post
├── /blog/:postId                          Post/comment moderation
├── /blog/:postId/edit                     Edit/schedule post
├── /support/tickets                       Ticket queue
├── /support/tickets/:ticketId             Ticket workspace
├── /settings/admins                       Admin list (superuser)
├── /settings/admins/new                   Create admin (superuser)
├── /settings/admins/:adminId              Admin detail/permissions
└── /settings/roles                        Permission matrix
~~~

| Area | Concise purpose and contents |
|---|---|
| Overview | Platform revenue, orders, AOV, status mix, top products/sellers, and actionable pending work. |
| Analytics | Revenue, order volume, AOV, status mix, top products/sellers, acquisition, repeat purchase, date range, and period comparison. |
| Marketing | Campaigns, coupons/discounts, schedules/status, associations, usage, and revenue performance. |
| CRM | Unified buyer/seller profiles, timeline, tags, admin-only notes, and linked operational records. |
| Orders | Buyer, seller(s), items, shipping, status history, linked invoice/transactions. Updates are permission-controlled; cancellation needs a reason. |
| Invoices | Browse/search, manual invoice creation, references, line items, totals/status, PDF, and audited void/amend actions. |
| Transactions | Payments, refunds, payouts, adjustments, status/currency, external reference, linked records; refunds are role-gated. |
| Buyers | Buyer data, addresses, activity, order/ticket history, and policy-based soft-delete/anonymization. |
| Sellers | Vendor identity, contacts/address, delivery methods, **payment ways**, support settings, linked records, payout summary, enablement, and login provisioning/reset. |
| Products | Catalog details, gallery, variants/specifications, pricing, stock, seller association, and publication status. |
| Reviews | Filter and moderate: approve, hide, delete, and optional response. |
| Q&A | Moderate, publish/edit/hide/remove questions and answers; add official answers. |
| Product Reports | Evidence, notes, and resolution: seller edit request, staff edit, product removal, or later warning/suspension. |
| Website | Site context (name, tagline, logo, contact, default SEO, homepage copy) and static pages (About, Terms, Privacy, FAQ, custom). |
| Blog | Create/edit/schedule/publish/archive posts and moderate comments. Typical **Editor** work. |
| Admins & Roles | Superusers manage staff status, permission sets (`admin`, `support`, `editor`, custom), and promotion/demotion. |

## 2. Support and Editor (limited admin)

**Support** and **Editor** are **Admin-panel roles**, not extra panels. Same `/admin` shell; grants hide modules they do not have.

Support typical access: people (buyers, sellers) and tickets; order view when linked to a ticket.

**Editor** typical access: `/admin/website` and `/admin/blog` only. No commerce, people directories, refunds, or staff management unless extra grants.

~~~text
/admin
├── /website
├── /website/pages
└── /blog
~~~

Base route: /admin (same shell, grants hide Admin-only modules). Ticket workspace:

~~~text
/admin/support
├── /tickets                  Ticket queue
└── /tickets/:ticketId        Ticket workspace
~~~

The queue combines two requirements-defined channels:

- **Site support:** buyer ↔ platform; account, billing, and general-site issues.
- **Buyer support:** buyer ↔ seller; order or product issues.

Columns/filters: ticket ID, subject, requester, seller where relevant, type, priority, status, assignee, related order, and product. Detail contains the message thread, participants, related records, assignee, internal context, priority, and status. Staff can assign, reply, and transition through open, in progress, waiting, resolved, and closed. Superusers can see all tickets.

## 3. Seller panel

Base route: /seller. A distinct shell/session; every record is scoped to the signed-in seller's shop.

~~~text
/seller
├── /                                  Shop overview
├── /analytics                         Shop analytics
├── /products                          Own-product list
├── /products/new                      Create own product
├── /products/:productId               Own-product detail
├── /products/:productId/edit          Edit own product
├── /orders                            Own-order list
├── /orders/:orderId                   Own-order / split detail
├── /tickets                           Buyer-to-seller ticket list
├── /tickets/:ticketId                 Ticket detail
└── /settings                          Shop profile, delivery methods, payment ways
~~~

| Area | Concise purpose and contents |
|---|---|
| Overview | Own revenue, order volume, AOV, status breakdown, top products, recent tickets, and inventory/product signals. |
| Analytics | Own revenue, orders, AOV, status mix, and top products with range/comparison controls. |
| Products | Create/edit/publish/unpublish own products; manage images, variants, specifications, pricing, and stock. No ownership changes or cross-seller access. |
| Orders | List/detail for orders that include this seller; advance or cancel **their** fulfillment; shipping, **delivery-method**, and **payment-way** snapshots. No other sellers’ lines, invoices, or refunds. |
| Tickets | List, reply to, and update only buyer ↔ seller tickets for the current shop. |
| Settings | Business/display profile, contacts, workplace address, **delivery methods** (shipping ways: standard, express, pickup), **payment ways**, and buyer-support channels. Same enable/label/instructions/sort pattern for both. Payment ways are not a gateway and not card PAN/CVV. |

Seller exclusions: platform marketing, CRM, invoices/transactions/refunds, buyer/seller **directories**, review/Q&A/report moderation, blog/content administration, and admin management.

## 4. Buyer panel

Base route: /account. Distinct shell/session; every record is scoped to `buyer_id`.

~~~text
/account
├── /                                  Account home
├── /profile                           Profile / password
├── /addresses                         Address book
├── /orders                            Own-order list
├── /orders/:orderId                   Own-order detail
├── /tickets                           Own tickets
└── /tickets/:ticketId                 Ticket thread
~~~

| Area | Concise purpose and contents |
|---|---|
| Profile | Own name, username, email, password. |
| Addresses | Own shipping/billing addresses and defaults. |
| Orders | Own orders only; cancel when allowed; no fulfillment updates or refunds. |
| Tickets | Open/list/reply on tickets where this buyer is the requester. |

Buyer exclusions: analytics, catalog management, other accounts, invoices/refunds, marketing, blog, staff settings.

## 5. Delivery sequence

| Phase | Page groups |
|---|---|
| MVP | Admin panel (Admin / Support), orders, people, products, site tickets, **seller panel** (products + orders + **delivery methods** + **payment ways**), **buyer panel** (profile, addresses, own orders, site tickets). |
| Phase 2 | Invoices, transactions, reviews, Q&A, product reports, buyer–seller tickets on all three panels. |
| Phase 3 | Analytics, marketing, CRM, **website context**, blog, **Editor** role UI, advanced exports, and audit-trail UI. |

