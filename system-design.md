# System Design

Architecture for the e-commerce **site management dashboard**. Product constraints: [requirements.md](./requirements.md). Decisions: [adr.md](./adr.md). Model: [entities.md](./entities.md). Flows: [data-flow.md](./data-flow.md). Behavior: [use-case.md](./use-case.md), [edge-case.md](./edge-case.md).

This document describes a **modular monolith** that can share a database with a future/existing storefront or sit behind an ingest API.

---

## 1. Goals and non-goals

**Goals**

- One authenticated admin surface for marketplace operations.
- Role-based module access; Superuser sees everything including admin management and all tickets.
- Predictable list performance (pagination, ~2s typical).
- Auditable sensitive mutations.
- Room to add invoices, payments ledger, UGC, CRM, marketing, and analytics without rewriting orders.

**Non-goals (now)**

- Buyer-facing shop UI.
- Seller self-service portal.
- Card processing / PCI interior of a payment gateway.
- Multi-currency as a first-class ledger (until §22 is decided).

---

## 2. Quality attributes

| Attribute | Design response |
|-----------|-----------------|
| Security | HTTPS, HTTP-only session, idle timeout, hashed passwords, no secrets in audit payloads |
| Authorization | Deny-by-default permission service on every command/query |
| Integrity | DB constraints, optimistic locking on orders, atomic stock and coupon counters |
| Auditability | Append-only audit log |
| Performance | Paginated APIs, indexes on filter columns, later materialized analytics |
| Availability | 99.5% target: stateless app instances, managed Postgres, queued workers |
| Accessibility | WCAG 2.1 AA on admin UI |
| Operability | Structured logs, request ids, job failure visibility |

---

## 3. Logical architecture

```mermaid
flowchart TB
  subgraph Clients
    BROWSER[Staff browser desktop / tablet]
  end

  subgraph App["Dashboard application - modular monolith"]
    UI[UI: App Router pages + module layouts]
    MW[Session + CSRF + permission middleware]
    APP[Application services / use-case handlers]
    DOM[Domain: orders catalog tickets identity billing]
    INF[Repos, object store, queue, mail dispatcher]
  end

  subgraph Data
    PG[(PostgreSQL)]
    OBJ[(Object storage)]
    Q[(Job queue)]
  end

  subgraph Neighbors
    SF[Storefront or BFF]
    PAY[Payment provider]
  end

  BROWSER --> UI
  UI --> MW --> APP --> DOM --> INF
  INF --> PG
  INF --> OBJ
  INF --> Q
  SF -->|ingest / shared DB| INF
  PAY -->|webhooks phase 2| APP
```

**Why a modular monolith:** one team, one permission model, shared transactions for order+audit+stock. Extract `billing` or `analytics` services later if load or ownership splits.

---

## 4. Module map (bounded contexts)

Matches navigation in requirements §21.

| Module | Owns | Depends on (read) |
|--------|------|-------------------|
| **Identity** | AdminUser, sessions, grants, RoleTemplate | — |
| **Audit** | AuditLog | called by all |
| **People** | Buyer, Address, Seller, delivery methods | Orders, Tickets (links) |
| **Catalog** | Product, images, variants, stock | Seller |
| **Commerce** | Order, lines, status history, splits | People, Catalog (snapshots) |
| **Billing** | Invoice, Transaction | Commerce, People |
| **Support** | Ticket, messages | People, Commerce, Catalog |
| **Trust** | Review, Q&A, ProductReport | Catalog, People |
| **CRM** | Notes, tags, tasks, timeline queries | People, Commerce, Support, Billing |
| **Marketing** | Campaign, coupon, banner | Commerce (redemptions) |
| **Content** | Blog posts, comments | Identity (author) |
| **Analytics** | Aggregates, exports | All (read replicas / facts) |

**MVP implements:** Identity, Audit (write), People, Catalog, Commerce, Support (`site` only).

Each module exposes:

- **Queries** for list/detail (permission-filtered).
- **Commands** for mutations (validate → persist → audit → domain event).

UI routes 1:1 with modules; forbidden modules return 403 and are omitted from the shell nav.

---

## 5. Authentication and authorization

```mermaid
flowchart TD
  R[Request] --> S{Valid session?}
  S -->|No| L[Login]
  S -->|Yes| I[Load AdminUser + grants]
  I --> T{Idle timeout?}
  T -->|Yes| X[Invalidate]
  T -->|No| P{is_superuser?}
  P -->|Yes| A[Allow route]
  P -->|No| G{Grant has area + action?}
  G -->|No| F[403]
  G -->|Yes| A
  A --> H[Handler + scoped query]
```

**Session:** server-side session id in HTTP-only cookie. Store `admin_id`, `issued_at`, `last_seen_at`. Idle timeout from last_seen. Regeneration on privilege change is optional; **must** re-read grants from DB every request (ADR-002).

**Permission matrix (actions):**

| Area | Typical actions |
|------|-----------------|
| analytics | view, export |
| marketing | view, edit |
| crm | view, edit |
| orders | view, edit, update_status |
| buyers / sellers | view, edit |
| invoices | view, create, edit |
| transactions | view, refund |
| products | view, edit |
| reviews / qa / product_reports | view, moderate |
| blog | view, edit |
| tickets | view, respond |
| admin_management | manage (superuser only in practice) |

**Last superuser guard:** Identity command `Demote` / `Suspend` counts `is_superuser && status=active`.

---

## 6. Data architecture

### 6.1 PostgreSQL

- One schema (or `app_*` schemas per module) with FKs across modules in MVP.
- JSONB for snapshots (`shipping_address`, line specs, audit before/after).
- Partial unique indexes: `email` unique where `deleted_at IS NULL AND status <> 'anonymized'`.
- Indexes: order `(status, created_at)`, `(buyer_id)`, GIN or btree on `order_number`; tickets `(type, status, assignee_id)`; products `(seller_id, status)`.

### 6.2 Concurrency

| Resource | Mechanism |
|----------|-----------|
| Order status | `version` integer / `updated_at` check |
| Stock | `UPDATE ... SET qty = qty + $delta WHERE qty + $delta >= 0` |
| Coupon usage | same pattern on `usage_count` |
| Invoice numbers | sequence or advisory lock |
| Refunds | unique `idempotency_key`; row lock on payment |

### 6.3 Files

- Public-ish: product and blog images via CDN.
- Private: report evidence, invoice PDFs — short-lived signed URLs.
- Never store blobs in Postgres except tiny metadata.

### 6.4 Storefront integration (choose one)

| Pattern | When | Notes |
|---------|------|--------|
| **A. Shared database** | Same org, one platform | Dashboard and shop use the same Order/Product tables. Simplest consistency. |
| **B. Ingest API** | Storefront already exists | Storefront POSTs orders/UGC; dashboard commands PATCH status back via webhook/API. Idempotent `external_id`. |

Design entities so either pattern works: keep `external_id` nullable on Order, Buyer, Product.

---

## 7. Domain state machines

### Order

```
processing → shipping → delivered
processing → canceled
shipping → canceled
```

Guards: cancel reason non-empty; `delivered` cannot cancel; version match.

### Invoice (phase 2)

```
draft → issued → paid
draft → void
issued → void (unpaid only)
issued → paid driven by transactions
```

### Product

```
draft → published ↔ out_of_stock
published / out_of_stock / draft → archived
```

Report approval may force `archived` (or unpublished) + notify.

### Ticket

```
open → in_progress → waiting → resolved → closed
```

Plus jumps: `open → closed` (spam); `closed → open` only via explicit reopen.

### Product report

```
pending_review → approved | rejected
```

Approve requires `resolution_action`.

---

## 8. API shape (illustrative)

REST under `/api/v1`, session cookie auth. All lists: `page`, `pageSize`, `sort`, filters. All mutations: CSRF for cookie session.

| Method | Path | Permission |
|--------|------|------------|
| POST | `/auth/login` `/auth/logout` | public / session |
| GET | `/me` | authenticated |
| GET/PATCH | `/orders` `/orders/:id` | orders.view / edit |
| POST | `/orders/:id/status` | orders.update_status |
| POST | `/orders/:id/cancel` | orders.update_status |
| CRUD | `/buyers` `/sellers` `/products` | respective edit |
| GET/POST | `/tickets` `/tickets/:id/messages` | tickets |
| CRUD | `/admins` `/admins/:id/grants` | superuser |
| GET | `/audit` | superuser or audit.view (phase 3 UI) |

Phase 2 adds `/invoices`, `/transactions`, `/transactions/:id/refund`, `/reviews`, `/questions`, `/product-reports`.

**Error model:** `401`, `403`, `404` (no leak), `409` (stale version / duplicate), `422` (validation, e.g. missing cancel reason).

---

## 9. UI architecture

- **Shell:** sidebar from module map, filtered by grants; header with user menu and (stretch) global search.
- **List pattern:** filters, sort, pagination, empty state, bulk only when a command exists.
- **Detail pattern:** header (id, status chips), tabs or sections for related records (order → buyer, seller(s), invoice, transactions, tickets).
- **Command pattern:** destructive/financial actions in a confirm dialog that maps to the API confirm flag.
- **Responsive:** CSS layout: sidebar collapsible on tablet; tables horizontally scroll rather than drop columns silently.

Route groups example: `/`, `/analytics`, `/orders`, `/orders/[id]`, `/buyers`, `/sellers`, `/products`, `/tickets`, `/settings/admins`.

---

## 10. Workers and async

| Job | Phase | Trigger |
|-----|-------|---------|
| Session cleanup | MVP | cron |
| Audit archive | later | retention |
| Invoice PDF | 2 | invoice issued |
| CSV/PDF export | 3 / stretch | staff request |
| Blog publish | 3 | `publish_at` |
| Notification dispatch | TBD | domain events |
| Analytics refresh | 3 | schedule or CDC |

Failed jobs: visible in an internal ops view or logs; domain state already committed (ADR-015).

---

## 11. Analytics (phase 3)

Do **not** run dashboard widgets as heavy `GROUP BY` on live `orders` once volume grows.

**Proposed:**

1. MVP: skip dedicated analytics module; overview can show cheap counts (`orders by status` with indexes) if needed for smoke.
2. Phase 3: nightly or streaming **fact_order**, **fact_payment** tables.
3. Widgets read facts with date-range parameters; comparison = second query on shifted range of **equal length**.
4. Export = enqueue job that reads the same facts.

Inclusion rules live in code next to the fact builder (canceled-but-paid, refunds, currency buckets).

---

## 12. Security design

| Threat | Control |
|--------|---------|
| Session theft | HTTP-only Secure cookie, short idle, HTTPS |
| CSRF | SameSite + CSRF token on mutations |
| IDOR | Permission + ownership/scope on every query (tickets) |
| Privilege escalation | Superuser-only admin_management; last-superuser invariant |
| XSS | Framework escaping; sanitize blog/product rich text on write |
| Upload abuse | Type/size limits; private buckets for evidence |
| Refund fraud | Role gate + confirm + audit + balance check |
| Enumeration | Generic login errors |

Secrets (DB, S3, future gateway) via environment / secret manager, never committed.

---

## 13. Observability and SLOs

- **Latency SLO:** p95 list endpoints under ~2s at agreed page size and dataset size (define “typical” as e.g. 50 rows, indexed filters).
- **Uptime:** 99.5% monthly excluding planned maintenance.
- Logs: `request_id`, `admin_id`, module, outcome.
- Metrics: auth failures, 403 rate, refund count, job failures, PDF time.
- Tracing: optional OpenTelemetry on API → DB.

---

## 14. Deployment topology

```mermaid
flowchart LR
  LB[HTTPS load balancer] --> APP1[App instance]
  LB --> APP2[App instance]
  APP1 --> PG[(Postgres primary)]
  APP2 --> PG
  APP1 --> Q[Queue]
  W[Worker instance] --> Q
  W --> PG
  W --> OBJ[Object storage]
  APP1 --> OBJ
```

App instances are stateless. Sessions in Postgres or Redis. Backups: Postgres PITR (strategy TBD in ops, required by NFR).

---

## 15. MVP build sequence

1. **Identity:** login, session timeout, AdminUser, superuser bootstrap, grants, last-superuser rule, audit writer.
2. **Shell:** module nav, 403, list/detail layout primitives.
3. **People:** buyers (addresses), sellers (enable/disable, delivery methods).
4. **Catalog:** products, images, variants, stock movements, publish rules.
5. **Commerce:** order list/detail, status machine, cancel+reason, snapshots, optimistic lock.
6. **Support:** site tickets, assign, thread, superuser unscoped list.
7. **Hardening:** pagination everywhere, indexes, confirm dialogs, WCAG pass on core flows.

Phase 2/3 attach Billing, Trust, CRM, Marketing, Content, Analytics without changing order snapshot rules.

---

## 16. Open design points (from requirements §22)

Resolve before the named phase ships:

| Question | Blocks | Interim design |
|----------|--------|----------------|
| Multi-currency / i18n | Analytics totals, invoice money | Single currency + UTC + message catalog |
| Seller portal | Buyer–seller ticket replies | Staff proxy messages |
| Payment provider | Transaction webhooks | Ledger + `external_id` uniqueness |
| Email/SMS | Buyer/seller notify | Domain events, no-op dispatcher |
| Data retention | Anonymize vs delete | Anonymize when orders exist |

---

## 17. Document map

| File | Contents |
|------|----------|
| [requirements.md](./requirements.md) | Product requirements |
| [use-case.md](./use-case.md) | Actor flows |
| [edge-case.md](./edge-case.md) | Failure and policy cases |
| [entities.md](./entities.md) | Data model |
| [data-flow.md](./data-flow.md) | Runtime flows |
| [adr.md](./adr.md) | Decisions |
| [system-design.md](./system-design.md) | This architecture |
