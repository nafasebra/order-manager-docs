# Data Flow

How information moves through the **staff dashboard**, the **seller dashboard**, and neighboring systems. Entity names match [entities.md](./entities.md). Use cases: [use-case.md](./use-case.md).

The **public storefront** and **payment gateway** are out of scope as products, but they are sources and sinks of data the dashboards must display and control.

---

## 1. Context

```mermaid
flowchart LR
  subgraph External
    SF[Storefront / Marketplace API]
    PG[Payment provider]
    ESP[Email / SMS / push]
    OBJ[Object storage for images PDFs]
  end

  subgraph Dashboard
    SUI[Staff UI]
    VUI[Seller UI]
    API[Dashboard API]
    DOM[Domain services]
    DB[(Primary database)]
    JOBS[Workers: PDF export schedule]
  end

  Staff((Staff)) --> SUI
  Seller((Seller)) --> VUI
  SUI --> API
  VUI --> API
  API --> DOM
  DOM --> DB
  DOM --> JOBS
  JOBS --> OBJ
  JOBS --> ESP

  SF -->|orders products buyers reviews tickets| DOM
  PG -->|webhooks payments refunds| DOM
  DOM -->|catalog status order status| SF
  DOM -->|refund capture| PG
```

**Rule:** the staff dashboard is the system of record for **staff actions** (status, moderation, permissions, manual invoices, seller enable/disable). The seller dashboard is the system of record for **that seller’s product edits** and **buyer–seller ticket replies**. The storefront is typically the system of record for **buyer-placed orders and UGC**, synced into the same database or via APIs.

Seller API calls always run with `actor_type = seller` and a mandatory `seller_id` scope.

---

## 2. Request path (every dashboard action)

Staff: authenticate AdminUser → check grants (or superuser) → handler.

Seller: authenticate Seller → confirm `status = enabled` → allow only analytics / buyer tickets / own products → **inject `seller_id` from session** into every query and command (ignore widen-the-scope client filters).

```mermaid
sequenceDiagram
  participant S as Staff
  participant UI as Dashboard UI
  participant API as API
  participant AZ as AuthZ
  participant D as Domain
  participant DB as Database
  participant A as AuditLog

  S->>UI: Navigate or submit
  UI->>API: HTTPS + session
  API->>API: Authenticate session
  API->>AZ: Check area + action
  alt Denied
    AZ-->>UI: 403
  else Allowed
    API->>D: Command / query
    D->>DB: Read or write
    opt Sensitive mutation
      D->>A: Append audit
    end
    D-->>UI: DTO
  end
```

Queries are filtered in the **same** authorization layer (especially tickets: EC-TKT-05). Superuser skips deny rules but still writes audit on sensitive commands.

---

## 3. Order lifecycle

Happy path: storefront checkout → dashboard fulfillment → delivery.

```mermaid
stateDiagram-v2
  [*] --> Processing: paid or confirmed
  Processing --> Shipping: staff advance
  Shipping --> Delivered: staff advance
  Processing --> Canceled: staff cancel + reason
  Shipping --> Canceled: staff cancel + reason
  Delivered --> [*]
  Canceled --> [*]
```

```mermaid
sequenceDiagram
  participant SF as Storefront
  participant DB as DB
  participant ST as Staff
  participant API as Dashboard API
  participant TX as Transactions
  participant INV as Invoices

  SF->>DB: Create Order + line snapshots + buyer
  opt Payment captured
    SF->>TX: Payment completed
    TX->>DB: Transaction payment
  end
  ST->>API: View list / detail
  API->>DB: Order + buyer + seller + history
  ST->>API: Status processing to shipping
  API->>DB: Update status + history + audit
  Note over API,DB: Optional stock decrement / shipment
  ST->>API: Status shipping to delivered
  API->>DB: Update + audit
  opt Phase 2
    INV->>DB: Invoice issued if not already
  end
```

**Cancel vs money**

```mermaid
flowchart TD
  A[Staff cancel + reason] --> B{Payment completed?}
  B -->|No| C[Status canceled only]
  B -->|Yes| D[Status canceled]
  D --> E[Do not auto-refund]
  E --> F[Staff may start refund command]
  F --> G{Refundable remaining > 0}
  G -->|No| H[Block]
  G -->|Yes| I[Pending refund TX + provider or manual]
  I --> J[Completed or failed]
```

Multi-seller: status changes may apply to an **OrderSplit** (per seller) rather than the parent. Parent status is derived (e.g. all delivered → delivered; any canceled + remainder delivered → policy TBD — recommend parent `canceled` only when all splits canceled).

---

## 4. Catalog and product trust

### 4.1 Product publish

```mermaid
flowchart LR
  D[Staff or seller edits product] --> V{Valid price images seller?}
  V -->|No| X[Block publish]
  V -->|Yes| S{Stock}
  S -->|0| O[out_of_stock or block]
  S -->|gt 0| P[published]
  P --> SF[Storefront reads catalog]
```

Staff adjustments write `StockMovement`. Storefront reservations (when built) should use the same atomic stock path.

### 4.2 Review / Q&A moderation

```mermaid
sequenceDiagram
  participant B as Buyer
  participant SF as Storefront
  participant DB as DB
  participant ST as Staff

  B->>SF: Submit review or question
  SF->>DB: status pending
  ST->>DB: Approve hide delete or reply
  DB-->>SF: Only approved/published visible
```

### 4.3 Product report resolution

```mermaid
flowchart TD
  R[Report pending_review] --> ST[Staff reviews]
  ST --> RJ[rejected + notes]
  ST --> AP[approved]
  AP --> ACT{Resolution action}
  ACT --> SE[Request seller edit]
  ACT --> AE[Admin edits product]
  ACT --> RM[Remove / archive product]
  RM --> N[Notify seller - channel TBD]
  SE --> AUD[Audit + report stored]
  AE --> AUD
  RM --> AUD
```

---

## 5. Invoices and transactions

```mermaid
flowchart TB
  subgraph Sources
    O[Order]
    M[Staff manual invoice]
    W[Payment webhook]
    RF[Staff refund]
    PO[Seller payout]
  end

  O --> I[Invoice type order]
  M --> I2[Invoice type manual]
  W --> T[Transaction payment]
  RF --> T2[Transaction refund]
  PO --> T3[Transaction payout]

  T --> I
  T2 --> I
  I --> PDF[PDF worker + object storage]
  I2 --> PDF
```

**Invoice status vs payments**

| Event | Invoice | Transaction |
|-------|---------|-------------|
| Draft created | `draft` | none |
| Issued | `issued` | none or pending payment |
| Payment completed covering total | `paid` | `payment` / `completed` |
| Void draft | `void` | none |
| Void issued unpaid | `void` | none |
| Paid then correction | new credit/refund TX; do not silently un-pay | `refund` or `adjustment` |

Refundable balance is computed in the domain from completed payments minus completed and **pending** refunds for that order (EC-TXN-01, EC-TXN-02).

---

## 6. CRM and people

```mermaid
flowchart LR
  subgraph Writes
    BY[Buyer CRUD / addresses]
    SL[Seller CRUD / enable]
    NT[Internal notes / tags]
  end

  subgraph Reads union
    OR[Orders]
    TK[Tickets]
    TX[Transactions]
    NT2[Notes]
  end

  BY --> P[Profile]
  SL --> P
  NT --> P
  OR --> TL[Activity timeline]
  TK --> TL
  TX --> TL
  NT2 --> TL
  P --> TL
```

**Anonymize / soft-delete**

```mermaid
sequenceDiagram
  participant ST as Staff
  participant D as Domain
  participant DB as DB

  ST->>D: Delete buyer
  D->>D: Open orders or tickets?
  alt Must retain history
    D->>DB: Strip PII, status anonymized
    D->>DB: Addresses removed or hashed
    Note over DB: Orders keep snapshots and buyer_id
  else Allowed forget
    D->>DB: deleted_at set
  end
  D->>DB: Audit
```

**Disable seller:** staff dashboard writes `seller.status = disabled` → storefront stops new checkouts → **seller session rejected** → existing orders still flow through staff order APIs → products unpublished or hidden per EC-SLR-01.

---

## 7. Tickets (two channels)

```mermaid
flowchart TB
  subgraph Site support
    B1[Buyer] --> T1[Ticket type site]
    T1 --> A1[Assignee admin]
    A1 --> TH1[Message thread]
  end

  subgraph Buyer-seller support
    B2[Buyer] --> T2[Ticket type buyer_seller]
    T2 --> SL[Seller dashboard]
    T2 --> A2[Staff may also reply]
    SL --> TH2[Thread]
    A2 --> TH2
  end

  SU[Superuser] --> T1
  SU --> T2
```

Data rules:

- Staff list endpoints **filter by permission and assignment**; Superuser query has no seller/buyer scope restriction.
- **Seller dashboard** lists only `type = buyer_seller` AND `seller_id = session`. Replies persist `author_type = seller`.
- Related order/product IDs are optional FKs; if the target is later deleted, the ticket keeps the id and the UI shows a broken-link state (EC-TKT-06).
- Phase 2 introduces `buyer_seller` tickets (staff + seller dashboard); MVP only persists `site`.

---

## 8. Marketing

```mermaid
flowchart LR
  ST[Staff] --> CP[Campaign / Coupon]
  CP --> DB[(DB)]
  SF[Storefront checkout] --> RD[Redeem coupon atomic]
  RD --> DB
  RD --> OR[Order + CouponRedemption]
  OR --> AN[Campaign performance]
  ESP[ESP] -.->|if integrated| EV[sent opened clicked]
  EV --> AN
```

Dashboard **does not** apply coupons at checkout; it configures them and reads redemptions. Race on `usage_count` is handled in the redemption path (EC-MKT-01), which may live in the storefront service sharing the same table.

---

## 9. Analytics

Analytics is **read-mostly**. Prefer aggregated facts over scanning operational tables on every widget load.

```mermaid
flowchart TB
  OP[(Orders Transactions Products)] --> ETL[Nightly or streaming aggregator]
  ETL --> F[(Fact tables / materialized views)]
  ST[Staff date range + compare] --> Q[Analytics queries]
  SE[Seller date range] --> QS[Queries always filtered by session seller_id]
  Q --> F
  QS --> F
  Q --> X[CSV/PDF export job]
  X --> OBJ[File download]
```

**Inclusion rules** must be explicit (EC-AN-03, EC-AN-06):

- Revenue: completed **payments** net of **refunds**, in one currency or grouped.
- Order volume: orders in range by `created_at` or by `delivered_at` — pick one per widget and label it.
- Soft-deleted catalog items still appear in historical top-products via **line snapshots**.
- Funnel widgets subscribe to storefront events; if absent, the API returns `unavailable`.
- **Seller analytics** uses the same facts with a mandatory `seller_id` predicate; never mixed into staff platform totals on the seller shell.

---

## 10. Admin management

```mermaid
sequenceDiagram
  participant SU as Superuser
  participant API as API
  participant DB as DB
  participant T as Target admin session

  SU->>API: Create / edit / suspend / grants
  API->>API: Must be superuser
  API->>API: Last-superuser guard
  API->>DB: Write AdminUser + grants
  API->>DB: Audit
  Note over T: Next request loads new grants
```

Promote/demote updates `is_superuser` and optionally replaces grants. Demote requires an explicit remaining permission set so the user is not locked into an accidental empty shell (EC-AUTH-08).

---

## 11. Blog

```mermaid
flowchart LR
  ST[Staff] --> P[Post draft]
  P --> SCH{publish_at}
  SCH -->|future| JOB[Scheduler publishes]
  SCH -->|now or past| PUB[published]
  PUB --> SF[Storefront blog]
  C[Comments pending] --> ST
  ST --> M[approved hidden deleted spam]
  M --> SF
```

---

## 12. Files and exports

| Flow | Producer | Consumer |
|------|----------|----------|
| Product images | Staff upload | Object storage → CDN → storefront and dashboard |
| Report evidence | Buyer via storefront or staff | Private bucket; dashboard signed URLs |
| Invoice PDF | Worker | Signed download for staff (and later buyer) |
| Analytics / transaction export | Worker | Staff download; do not stream huge CSV on the request thread |

---

## 13. Notification hooks (channel TBD)

Requirements leave email/SMS open. Design **domain events** now; bind transports later.

| Event | Typical recipients |
|-------|-------------------|
| Order status → shipping / delivered / canceled | Buyer |
| Product removed after report | Seller |
| Ticket reply | Requester buyer; seller (dashboard + email if configured) if buyer–seller ticket |
| Seller disabled / enabled | Seller contact; disable also ends seller dashboard access |
| Admin invited / suspended | That admin |

Dashboard writes the event; a worker sends. Failed send must not roll back the domain change; retries are independent.

---

## 14. MVP data flows only

For phase 1, implement:

1. AuthZ request path (§2) for **staff and seller** sessions
2. Order create (from storefront or seed) + staff status/cancel (§3 without auto-refund)
3. Buyer/seller/product CRUD + stock (§4.1, §6); **seller dashboard product management** (own catalog only)
4. Site tickets thread (§7, `site` only)
5. Minimal audit on admin changes, order status, and seller product mutations

Defer: invoice/transaction graphs, UGC moderation, reports, CRM union timeline, marketing redemptions UI, analytics ETL (staff and seller), blog scheduler, buyer–seller tickets on the seller dashboard.
