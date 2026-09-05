# Marketplace Management Dashboard — Post-V1 Roadmap

## Positioning

V1 is a **marketplace** with **three panels**: **Admin** (Support = limited ops; **Editor** = website + blog when content ships), **Seller**, and **Buyer**. The roadmap extends later modules.

V2 and V3 items are requirements-derived. Items labelled **roadmap inference** are valuable extensions to validate with the target market. AI is deliberately excluded from this revision.

## V2 — Complete core marketplace operations

| Addition | Value and capabilities |
|---|---|
| Finance: invoices | Invoice list/detail, manual invoices, PDF download, tax/shipping totals, and void/amend audit trail. |
| Finance: transactions | Payments, refunds, payouts, adjustments, linked orders/invoices, role-gated refunds, accounting export. |
| Buyer–seller support | Seller ticket queue, replies, status changes, product/order links, and staff oversight. |
| Reviews moderation | Filterable queue, approval/hide/delete actions, optional official responses. |
| Product Q&A | Moderation, official answers, publication states, seller/admin attribution. |
| Product reports | Evidence, reviewer notes, seller edit requests, staff edits/removal, and later warnings/suspensions. |
| Seller operations polish | Remaining store-settings depth (support channels) and mature product/inventory/ticket flows. **Delivery methods** and **payment ways** are already in MVP. |

## V3 — Intelligence, growth, and governance

| Addition | Value and capabilities |
|---|---|
| Advanced analytics | Platform/seller revenue, orders, AOV, status mix, top products/sellers, acquisition, repeat purchase, comparison, CSV/PDF exports. |
| CRM | Unified profiles, activity timeline, internal notes, tags/segments, linked records, and optional staff tasks. |
| Marketing | Coupons, campaigns, schedules/status, product/category/seller targeting, usage and revenue performance, storefront promotions when available. |
| Website context | Site identity, default SEO, contact/social, homepage copy, and static pages (About, Terms, Privacy, FAQ, custom). |
| Blog and content | Posts: editor, scheduling, publishing, categories/tags, comments, and moderation. **Editor** role template (website + blog). |
| Audit/export center | Searchable sensitive-action history and reusable report/export workflows. |
| Localization | Configurable language, currency, and date formats; a foundation for RTL/LTR editions. |

## V4 — Public storefront

The **buyer panel** is already in V1. This release adds public browse/cart/checkout chrome that can share the buyer session.

### Public storefront

~~~text
/
├── /search                   Search and filters
├── /category/:slug           Category browsing
├── /product/:slug            Product, variants, specs, reviews, Q&A
├── /seller/:slug             Seller storefront/profile
├── /cart                     Cart
├── /checkout                 Checkout
├── /order-confirmation       Confirmation
├── /about                    Website page
├── /terms                    Website page
├── /privacy                  Website page
├── /faq                      Website page
├── /p/:slug                  Custom website page
├── /blog                     Content list
└── /blog/:slug               Article page
~~~

This unlocks reviews/Q&A, promotions, campaign attribution, and conversion-funnel analytics in the requirements. Cart and checkout are roadmap inferences required for a usable storefront; payment/webhook scope remains an open decision.

## V5 — Commercial extensions (roadmap inference)

| Extension | Why it is valuable |
|---|---|
| Returns, refunds, and exchanges workspace | Structured post-purchase workflows across orders, tickets, and transactions. |
| Fulfillment and shipping hub | Carrier tracking, labels, delivery exceptions, split orders, and seller fulfillment queues. |
| Payout and commission management | Seller balances, commission rules, payout schedules, statements, and reconciliation. |
| Inventory operations | Low-stock alerts, bulk import/export, reservations, warehouses, and multi-variant controls. |
| Notifications center | Email/SMS/in-app event templates; email/SMS is an open requirement question. |
| Integrations hub | Payment, shipping, email/SMS, accounting, analytics, storage, and webhooks. |
| API and developer tools | API keys, webhook logs, event catalog, and documentation for agency/script buyers. |
| Security and compliance | MFA, session controls, data retention, export/delete requests, consent, and audit review. |
| End-to-end UI tests | Optional Playwright (or similar) for cross-panel flows — **not in V1**; V1 relies on Vitest unit tests + backend API tests. |
| Multi-store / multi-tenant mode | SaaS foundation with organizations, plans, billing, and tenant isolation. |
| Vertical editions | Fashion, electronics, grocery, B2B, or services variants from the same core. |

## Product packaging opportunities

| Package | Contents |
|---|---|
| Admin panel | Full Admin commerce, people, catalog, tickets, website/blog, and permissions. |
| Seller panel | Analytics, products, orders, tickets, and store settings. |
| Buyer panel | Profile, addresses, own orders, own tickets. |
| Support (limited admin) | Same Admin panel; tickets + people + order view. |
| Editor (limited admin) | Same Admin panel; website context + blog posts/comments. |
| Complete marketplace | Admin + Seller + Buyer panels. |
| Marketplace Starter | Complete panels plus auth, RBAC, API, schema, integrations, seed data, and docs. |

## Recommended progression

~~~text
V1: Admin panel (Admin + limited Support + Editor template) + Seller panel + Buyer panel
        ↓
V2: Finance + trust/moderation + buyer–seller tickets
        ↓
V3: Analytics + CRM + marketing + website context + blog + Editor UI + governance
        ↓
V4: Public storefront / browse-and-checkout chrome
        ↓
V5: Integrations, fulfillment, payouts, SaaS/vertical editions
~~~

