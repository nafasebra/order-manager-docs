# Architecture Decision Records

Decisions that shape the marketplace portals. Requirements: [requirements.md](./requirements.md). Follow-up design: [system-design.md](./system-design.md).

Status values: **Accepted** (required by the spec or locked here) · **Proposed** (recommended, not yet built) · **Deferred** (explicitly later).

---

## ADR-001 — Three panels: Admin, Seller, Buyer

**Status:** Accepted  
**Date:** 2026-08-25

**Context:** The product is a **marketplace**. Operators, vendors, and customers each need a signed-in panel. Support and Editor are limited Admins, not extra panels.

**Decision:**

- **Admin panel:** **Admin** (full, grants), **Support** (same shell, limited: people, tickets, order view), and **Editor** (same shell, limited: website context + blog). Superuser = unrestricted Admin + staff management. `actor_type = staff`.
- **Seller panel:** `actor_type = seller`; modules **analytics, products, orders, tickets, settings (delivery methods + payment ways)**; always scoped to `seller_id`.
- **Buyer panel:** `actor_type = buyer`; modules **profile, addresses, orders, tickets**; always scoped to `buyer_id`.
- People directories (all buyers/sellers) exist only on the Admin panel.
- Same modular monolith; three UI shells; actor types must not share a session.

**Consequences:** Seller fulfillment uses `OrderSplit`. Buyers use their own login on Buyer. Disable seller / suspend buyer revokes that panel. CRM notes stay Admin-only.

---

## ADR-002 — Permission areas on every route and API, Superuser unrestricted

**Status:** Accepted  
**Date:** 2026-08-24

**Context:** Admins are scoped; Superuser must reach every module including admin management and all tickets.

**Decision:**

- Authorization is **deny by default**.
- Checks run on **HTTP routes and mutating/query APIs**, not only in the nav.
- Superuser bypasses permission denies; **audit still applies**.
- Grants are a set of `{ area, actions }` (see [entities.md](./entities.md)). Role templates are snapshots copied onto the user at assign time (avoids EC-AUTH-09 surprise).

**Consequences:** Nav is a projection of grants (staff) or of the fixed seller module set. Ticket lists are query-scoped. Changing grants takes effect on the **next** request (reload permissions from DB, not only JWT at login). Seller queries ignore client filters that would expand scope beyond session `seller_id`.

---

## ADR-003 — Soft-delete and anonymize, not hard-delete of people or catalog history

**Status:** Accepted  
**Date:** 2026-08-24

**Context:** NFR requires soft-delete where legally needed. Orders must remain explainable after catalog or buyer changes.

**Decision:** Buyer, Seller, and Product use `deleted_at` and/or `anonymized` status. Order line items and shipping addresses are **snapshots**. Order hard-delete is forbidden for normal admins. Exact GDPR retention remains an open question; anonymize is the default “delete” when historical orders exist.

**Consequences:** Unique email/username constraints must allow tombstones or freeze identifiers. Analytics uses snapshots so removed products still appear in history.

---

## ADR-004 — Marketplace orders with per-line seller and optional splits

**Status:** Accepted (model) / Proposed (split UX)  
**Date:** 2026-08-24

**Context:** Orders may involve multiple sellers. Status is defined at order level (processing / shipping / delivered / canceled).

**Decision:** Persist `seller_id` on every **OrderLineItem** and an **OrderSplit** (`order_id` + `seller_id` → status) so the seller panel can fulfill without seeing other vendors’ lines.

**Consequences:** List filters “by seller” join lines/splits. Cancel/ship one vendor without corrupting another. Parent status is derived from splits (see [edge-case.md](./edge-case.md) EC-ORD-01).

---

## ADR-005 — Explicit order status machine; cancel ≠ refund

**Status:** Accepted  
**Date:** 2026-08-24

**Context:** Statuses are processing → shipping → delivered, plus canceled with mandatory reason. Transactions are a separate module. Payment gateway is out of scope except as recorded movements.

**Decision:**

- Legal transitions: `processing→shipping→delivered`; `processing|shipping→canceled`.
- `delivered→canceled` is rejected.
- Skips require a future Superuser override flag; not in MVP.
- Cancel writes status + reason + audit and **does not** create a refund. Refund is an explicit, confirmed, role-gated command.

**Consequences:** Staff must be trained that money movement is Transactions. UI should CTA “Refund” after paid cancel. “Paid or confirmed” orders may exist without a completed payment; UI shows the gap.

---

## ADR-006 — Transactions are a ledger, not a gateway

**Status:** Accepted  
**Date:** 2026-08-24

**Context:** Requirements capture type, amount, status, links, and **external payment method ID only**.

**Decision:** `Transaction` rows are the financial source of truth **inside this platform**. Gateway webhooks (when added) upsert by `(provider, external_id)`. Refunds use idempotency keys and a computed remaining balance. No card data stored.

**Consequences:** Accounting export (stretch) is a projection of this ledger. Manual `adjustment` exists for ops corrections. Invoice `paid` is derived from or synchronized with completed payments — implementation must pick **invoice-driven** vs **transaction-driven** as source; **Proposed:** transactions drive invoice `paid`.

---

## ADR-007 — Two ticket types with Superuser global visibility

**Status:** Accepted  
**Date:** 2026-08-24

**Context:** Site support (buyer ↔ platform) vs buyer support (buyer ↔ seller). Superuser sees all.

**Decision:** Single `Ticket` entity with `type`. Phase 1 persists `site` only. Authorization: non-superuser **staff** queries **must** filter; UI hiding is insufficient. **Sellers** query only `buyer_seller` tickets for their `seller_id` (phase 2). Seller is both a **context FK** and a **portal actor** for those tickets.

**Consequences:** Phase 2 adds `buyer_seller` without a second ticketing product. Message `author_type` includes `seller` when the vendor replies from the seller panel and `buyer` when the customer replies from the buyer panel. Admin/Support can still view and reply.

---

## ADR-008 — Audit trail for sensitive actions

**Status:** Accepted  
**Date:** 2026-08-24

**Context:** Global requirement: audit admin changes, order status updates, product removals; invoices void/amend also require audit.

**Decision:** Append-only `AuditLog` with actor (`admin` or `seller`), action, entity, reason (when required), before/after. MVP writes logs even if the **audit UI** is phase 3. Logs are not editable from the portals.

**Consequences:** Storage growth; retention policy TBD. Refunds, permission changes, suspend, report-driven removal, **and seller product/ticket mutations** are in the same log.

---

## ADR-009 — Paginated lists as a performance contract

**Status:** Accepted  
**Date:** 2026-08-24

**Context:** List pages ~2s; pagination required.

**Decision:** All index endpoints are paginated (offset or cursor). Default page size is bounded. Bulk actions process a selected id set, not “all matching filter” unless an explicit async job exists. Global search is stretch and also capped.

**Consequences:** No unbounded table scans in the admin API. Analytics uses aggregates, not the operational list endpoint.

---

## ADR-010 — Phased delivery matches requirements §23

**Status:** Accepted  
**Date:** 2026-08-24

| Phase | In |
|-------|-----|
| MVP | Admin panel (Admin / Support), orders, people, products, site tickets; **seller panel (products + orders + delivery methods + payment ways)**; **buyer panel (profile, addresses, own orders)** |
| Phase 2 | Invoices, transactions, reviews, Q&A, product reports, buyer–seller tickets on **all three panels** |
| Phase 3 | Analytics (platform-wide **and** seller-scoped), marketing, CRM, **website context**, blog, **Editor** role UI, advanced exports, audit UI |

**Consequences:** Data model still **reserves** FKs and snapshot fields so phase 2 does not rewrite order history. Do not build marketing/CRM UI in MVP. Seller analytics waits for phase 3 with staff analytics.

---

## ADR-011 — Money, time, and locale as configuration

**Status:** Proposed  
**Date:** 2026-08-24

**Context:** Multi-currency and UI language are open questions. NFR: currency and date formatting configurable; localization TBD.

**Decision (until §22 is closed):**

- Store money as **integer minor units** + ISO currency.
- Store timestamps in **UTC**.
- Single **default currency** and **display timezone** in config for MVP.
- Never sum mixed currencies in one KPI number.
- UI copy in a message catalog so a language can be added without schema changes.

**Consequences:** If multi-currency is required on day one, this ADR is revisited before MVP analytics (phase 3) ships.

---

## ADR-012 — Invoice documents are immutable after issue

**Status:** Proposed (Phase 2)  
**Date:** 2026-08-24

**Context:** Void or amend with audit; PDF download; order-tied and manual invoices.

**Decision:** `issued` invoices are not rewritten in place. Amendments produce a new version or a credit note. `paid` invoices are not voided; reverse with refund/credit. Totals are **server-computed**. Invoice numbers are unique and allocated atomically.

**Consequences:** PDF generation is a worker + object storage. Draft PDFs may be watermarked.

---

## ADR-013 — Catalog stock has a single source of truth

**Status:** Proposed  
**Date:** 2026-08-24

**Context:** Products have stock and optional variants.

**Decision:** If variants exist, stock lives **only** on variants (parent derived). Adjustments go through `StockMovement`. Oversell is opt-in, default deny.

**Consequences:** Publish-with-zero-stock maps to `out_of_stock`. Order placement (storefront) must use the same decrement path when that integration exists.

---

## ADR-014 — Suggested technical stack

**Status:** Proposed  
**Date:** 2026-08-24

**Context:** This repo currently holds product docs only. A stack must be chosen before implementation.

**Decision (recommendation):**

| Layer | Choice | Why |
|-------|--------|-----|
| Web UI | **React + Vite + TanStack Router** | SPA for Admin, Seller, and Buyer panels; session cookies via `credentials: 'include'` |
| Styling | **Tailwind CSS v4 + shadcn/ui** | CSS-first `@theme`; Radix primitives; Mint + Teal + Navy from [color-system.md](./color-system.md) |
| Lists / tables | **TanStack Table + TanStack Virtual + TanStack Query** | Server-paginated tables; virtual scroll for lists and large table pages |
| API | Dedicated API service (modular monolith) | Vite dev proxy; production static `dist/` + API same origin |
| DB | PostgreSQL | Strong constraints, JSON snapshots, pagination |
| Auth | Session cookies (HTTP-only) + server-side session store | Matches NFR session timeout better than long-lived JWT in localStorage |
| Files | S3-compatible object storage | Images, evidence, PDFs |
| Jobs | Queue (e.g. Postgres-backed or Redis) | PDF, export, scheduled blog publish, notifications |

**Alternatives considered:** SPA + separate REST; Django Admin; Retool. Rejected for a permissioned multi-module product that will grow through three phases.

**Consequences:** Shared DB with the storefront is the simplest consistency model; if storefront is a separate system, define an anti-corruption API and idempotent ingest (see [system-design.md](./system-design.md)).

---

## ADR-015 — Domain events for notifications; transport later

**Status:** Proposed  
**Date:** 2026-08-24

**Context:** Email/SMS for order and ticket events is an open question.

**Decision:** Emit internal events (`order.canceled`, `ticket.replied`, `product.removed`, …) from the domain. Do not couple modules to a specific ESP. Workers subscribe when a channel is chosen.

**Consequences:** MVP can no-op the dispatcher. Phase 2/3 enable providers without rewriting order/ticket code.

---

## ADR-016 — Accessibility and responsive layout as release criteria

**Status:** Accepted (target)  
**Date:** 2026-08-24

**Context:** Desktop primary, tablet usable; WCAG 2.1 AA target.

**Decision:** Component library must support keyboard, labels, and contrast. Destructive actions use confirmations (refund, cancel, delete, suspend). Mobile phone is **not** a primary target.

**Consequences:** Custom charts in analytics (phase 3) need accessible alternatives (tables/export). Applies to **staff and seller** portals.

---

## ADR-017 — Panel data isolation by session actor id

**Status:** Accepted  
**Date:** 2026-08-25

**Context:** Seller and Buyer panels must never leak another party’s data. Support and Editor are limited Admin roles on the Admin panel.

**Decision:**

- Session stores exactly one of: `actor_type=staff` + `admin_id` | `seller` + `seller_id` | `buyer` + `buyer_id`.
- Seller module set is fixed: analytics, products, orders (own splits), tickets (`buyer_seller`), **settings (delivery methods + payment ways)**.
- Buyer module set is fixed: profile, addresses, orders (own), tickets (requester).
- Every seller/buyer list/detail/mutation **injects** the session id. Mismatched ids → 404/403.
- Disable seller / suspend or anonymize buyer invalidates that panel’s sessions.
- Refunds, invoices, and people **directories** are Admin-panel only.

**Consequences:** Shared tables rely on query filters and tests. Support and Editor still use Admin-panel grants, not extra shells.

---
