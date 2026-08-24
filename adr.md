# Architecture Decision Records

Decisions that shape the dashboard. Requirements: [requirements.md](./requirements.md). Follow-up design: [system-design.md](./system-design.md).

Status values: **Accepted** (required by the spec or locked here) · **Proposed** (recommended, not yet built) · **Deferred** (explicitly later).

---

## ADR-001 — Admin-only dashboard; buyers and sellers are managed subjects

**Status:** Accepted  
**Date:** 2026-08-24

**Context:** The product is a centralized **admin** dashboard. Public shop UI and seller self-service are out of scope for now. Buyers and sellers still appear as records.

**Decision:** No buyer or seller login to this application in MVP. Support staff are **AdminUser** accounts with Tickets (and related) permissions, not a separate authentication product. Superuser is an AdminUser with `is_superuser`.

**Consequences:** Ticket type `buyer_seller` is moderated by staff until a seller portal exists. CRM “unified profiles” are staff-facing. A future portal can reuse the same Seller/Buyer entities via a different app.

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

**Consequences:** Nav is a projection of grants. Ticket lists are query-scoped. Changing grants takes effect on the **next** request (reload permissions from DB, not only JWT at login).

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

**Decision:** Persist `seller_id` on every **OrderLineItem**. For MVP, if the storefront only creates single-seller orders, still store seller on the line. When multi-seller appears, add `OrderSplit` (order + seller → status) rather than duplicating full orders.

**Consequences:** List filters “by seller” join lines/splits. Cancel/ship one vendor without corrupting another. Parent status derivation must be specified when splits diverge (see [edge-case.md](./edge-case.md) EC-ORD-01).

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

**Decision:** Single `Ticket` entity with `type`. Phase 1 persists `site` only. Authorization: non-superuser queries **must** filter; UI hiding is insufficient. Seller is a **context FK**, not a dashboard actor in phase 1.

**Consequences:** Phase 2 adds `buyer_seller` without a second ticketing product. Message `author_type` includes seller for future portal ingestion.

---

## ADR-008 — Audit trail for sensitive actions

**Status:** Accepted  
**Date:** 2026-08-24

**Context:** Global requirement: audit admin changes, order status updates, product removals; invoices void/amend also require audit.

**Decision:** Append-only `AuditLog` with actor, action, entity, reason (when required), before/after. MVP writes logs even if the **audit UI** is phase 3. Logs are not editable from the dashboard.

**Consequences:** Storage growth; retention policy TBD. Refunds, permission changes, suspend, and report-driven removal are in the same log.

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
| MVP | Auth, admins/permissions, orders, buyers, sellers, products, site tickets |
| Phase 2 | Invoices, transactions, reviews, Q&A, product reports, buyer–seller tickets |
| Phase 3 | Analytics, marketing, CRM, blog, advanced exports, audit UI |

**Consequences:** Data model still **reserves** FKs and snapshot fields so phase 2 does not rewrite order history. Do not build marketing/CRM UI in MVP.

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
| Admin UI | React + Next.js App Router | Dashboard-centric, SSR/auth cookies, fits a “dash” product |
| API | Same app Route Handlers or a dedicated API service | Start modular monolith; split if storefront already owns a backend |
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

**Consequences:** Custom charts in analytics (phase 3) need accessible alternatives (tables/export).
