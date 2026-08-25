# Use Cases

Derived from [requirements.md](./requirements.md). The marketplace has **three panels**: **Admin** (full Admin or limited Support), **Seller**, and **Buyer**.

Related: [edge-case.md](./edge-case.md) · [entities.md](./entities.md) · [data-flow.md](./data-flow.md)

---

## 1. Actors

| Actor | Panel | Notes |
|-------|--------|--------|
| **Admin** | Admin | Marketplace operator. Grants per requirements §17. Superuser = full Admin panel + staff management. |
| **Support** | Admin (limited) | Same Admin panel. Typical: people + tickets + order view. Not a fourth panel. |
| **Seller** | Seller | **Analytics, products, orders, tickets** for `seller_id` only. |
| **Buyer** | Buyer | **Profile, addresses, orders, tickets** for `buyer_id` only. |
| **System** | — | Jobs, webhooks, session expiry. |

**Staff** means Admin or Support. **Seller** queries always filter `seller_id`. **Buyer** queries always filter `buyer_id`.

---

## 2. Use-case index

| ID | Name | Primary actor | Module |
|----|------|---------------|--------|
| UC-AUTH-01 | Sign in | Staff | Auth |
| UC-AUTH-02 | Sign out | Staff | Auth |
| UC-AUTH-03 | Session timeout | System | Auth |
| UC-GLB-01 | Use global search | Staff | Global |
| UC-GLB-02 | View audit trail | Staff | Global |
| UC-AN-01 | View dashboard overview | Staff | Analytics |
| UC-AN-02 | Analyze metrics by date range | Staff | Analytics |
| UC-AN-03 | Export analytics report | Staff | Analytics |
| UC-MKT-01 | Manage discount codes | Staff | Marketing |
| UC-MKT-02 | Manage promotional content | Staff | Marketing |
| UC-MKT-03 | Review campaign performance | Staff | Marketing |
| UC-CRM-01 | View unified contact profile | Staff | CRM |
| UC-CRM-02 | Add internal note and tags | Staff | CRM |
| UC-CRM-03 | Assign CRM task | Staff | CRM |
| UC-ORD-01 | Browse and filter orders | Staff | Orders |
| UC-ORD-02 | View order detail | Staff | Orders |
| UC-ORD-03 | Update order information | Staff | Orders |
| UC-ORD-04 | Advance order status | Staff | Orders |
| UC-ORD-05 | Cancel order | Staff | Orders |
| UC-ORD-06 | Assign fulfillment | Staff | Orders |
| UC-BYR-01 | Manage buyer records | Staff | Buyers |
| UC-BYR-02 | Manage buyer addresses | Staff | Buyers |
| UC-BYR-AUTH-01 | Sign in to buyer panel | Buyer | Buyer auth |
| UC-BYR-PROF-01 | Edit own profile | Buyer | Buyer panel |
| UC-BYR-PROF-02 | Manage own addresses | Buyer | Buyer panel |
| UC-BYR-ORD-01 | Browse own orders | Buyer | Buyer orders |
| UC-BYR-ORD-02 | View own order | Buyer | Buyer orders |
| UC-BYR-ORD-03 | Cancel own order | Buyer | Buyer orders |
| UC-BYR-TKT-01 | Browse own tickets | Buyer | Buyer tickets |
| UC-BYR-TKT-02 | Open or reply to a ticket | Buyer | Buyer tickets |
| UC-SLR-01 | Manage seller records | Staff | Sellers |
| UC-SLR-02 | Enable or disable seller | Staff | Sellers |
| UC-SLR-03 | Configure seller delivery and support | Staff | Sellers |
| UC-SEL-AUTH-01 | Sign in to seller panel | Seller | Seller auth |
| UC-SEL-AN-01 | View shop analytics | Seller | Seller analytics |
| UC-SEL-TKT-01 | Browse tickets from buyers | Seller | Seller tickets |
| UC-SEL-TKT-02 | Reply to a buyer ticket | Seller | Seller tickets |
| UC-SEL-PRD-01 | Manage own products | Seller | Seller products |
| UC-SEL-PRD-02 | Manage own images, variants, and stock | Seller | Seller products |
| UC-SEL-PRD-03 | Publish or unpublish own product | Seller | Seller products |
| UC-SEL-ORD-01 | Browse own orders | Seller | Seller orders |
| UC-SEL-ORD-02 | View own order detail | Seller | Seller orders |
| UC-SEL-ORD-03 | Advance own fulfillment status | Seller | Seller orders |
| UC-SEL-ORD-04 | Cancel own fulfillment | Seller | Seller orders |
| UC-INV-01 | Browse invoices | Staff | Invoices |
| UC-INV-02 | View and download invoice | Staff | Invoices |
| UC-INV-03 | Create manual invoice | Staff | Invoices |
| UC-INV-04 | Void or amend invoice | Staff | Invoices |
| UC-TXN-01 | Browse transactions | Staff | Transactions |
| UC-TXN-02 | Initiate refund | Staff | Transactions |
| UC-PRD-01 | Manage product catalog | Staff | Products |
| UC-PRD-02 | Manage images, variants, and stock | Staff | Products |
| UC-PRD-03 | Publish or unpublish product | Staff | Products |
| UC-REV-01 | Moderate product reviews | Staff | Reviews |
| UC-QA-01 | Moderate product Q&A | Staff | Q&A |
| UC-QA-02 | Post official answer | Staff | Q&A |
| UC-RPT-01 | Triage product reports | Staff | Product reports |
| UC-RPT-02 | Resolve approved report | Staff | Product reports |
| UC-BLG-01 | Manage blog posts | Staff | Blog |
| UC-BLG-02 | Moderate blog comments | Staff | Blog |
| UC-ADM-01 | Manage admin accounts | Superuser | Admins |
| UC-ADM-02 | Assign permissions | Superuser | Admins |
| UC-ADM-03 | Promote or demote superuser | Superuser | Admins |
| UC-TKT-01 | Browse support tickets | Staff | Tickets |
| UC-TKT-02 | Assign and work a ticket | Staff | Tickets |
| UC-TKT-03 | View all tickets (global) | Superuser | Tickets |

---

## 3. Auth and global

### UC-AUTH-01 — Sign in

**Actor:** Staff  
**Goal:** Access the **Admin panel**.  
**Preconditions:** Account exists and status is `active`. HTTPS in production.

**Main flow**

1. Admin or Support opens Admin login and submits credentials.
2. System authenticates as AdminUser (not seller or buyer).
3. System creates a staff session and loads grants (Admin, Support, custom, or superuser).
4. System redirects to the Admin overview (or last allowed page).

**Alternate / exception**

- Invalid credentials → generic failure.
- Account `suspended` → access denied.
- Superuser → full Admin map; Admin / Support → granted modules only.
- Seller or buyer credentials on Admin login → denied.

**Postcondition:** Authenticated session; subsequent requests are permission-checked.

---

### UC-AUTH-02 — Sign out

**Actor:** Staff  
**Goal:** End the current session.

**Main flow:** Staff chooses sign out → session is invalidated → login screen.

---

### UC-AUTH-03 — Session timeout

**Actor:** System  
**Goal:** Expire idle sessions.

**Main flow:** Idle timeout elapses → session invalidated → next action requires sign-in. In-progress form data is not silently submitted.

---

### UC-GLB-01 — Use global search

**Actor:** Staff  
**Goal:** Find an order, buyer, seller, product, or ticket from one search box.  
**Status:** Stretch goal (requirements §3).

**Main flow**

1. Staff types a query (ID, name, email, SKU, subject).
2. System returns ranked hits only from entities the staff member may view.
3. Staff opens a result and lands on the corresponding detail page.

**Exception:** Empty or too-short query → no search; permission-filtered empty set is not an error.

---

### UC-GLB-02 — View audit trail

**Actor:** Staff with audit permission (Superuser always).  
**Goal:** Inspect who changed sensitive records.

**Covered actions (minimum):** admin create/edit/suspend/permission change, order status updates, product removals, invoice void/amend, refunds, seller product edits, seller ticket replies.

**Main flow:** Staff opens audit for a record or a global audit view → filter by actor, action, entity, time → inspect before/after or reason.

---

## 4. Analytics

Staff analytics are platform-wide (UC-AN-*). Seller shop analytics are UC-SEL-AN-01.

### UC-AN-01 — View dashboard overview

**Actor:** Staff with Analytics view.  
**Goal:** See snapshot widgets on the home page.

**Widgets (from requirements):** revenue, order volume, AOV, status breakdown, plus links into full analytics.

---

### UC-AN-02 — Analyze metrics by date range

**Actor:** Staff with Analytics view.  
**Goal:** Inspect revenue, orders, products, sellers, buyers, and (if available) conversion funnel.

**Main flow**

1. Staff picks a preset or custom range and optional comparison period.
2. System computes metrics for the range (and delta vs comparison).
3. Staff drills into top products, top sellers, order-status mix, acquisition / repeat rate.

**Exception:** No storefront funnel events → conversion widgets hidden or marked unavailable.

---

### UC-AN-03 — Export analytics report

**Actor:** Staff with Analytics view (export may be a separate permission).  
**Goal:** Download CSV or PDF.  
**Status:** Export format TBD.

**Main flow:** Staff chooses metrics and range → export job runs → file download. Large ranges may be async.

---

## 5. Marketing

### UC-MKT-01 — Manage discount codes

**Actor:** Staff with Marketing edit.  
**Goal:** Create, edit, deactivate coupons and view usage.

**Main flow**

1. Staff creates a code with name, type, dates, status (`draft` / `active` / `ended`), optional product/category/seller scope, usage limits.
2. Staff later edits rules or deactivates the code.
3. Staff views redemption count and related orders/revenue.

**Exception:** Overlapping dates or duplicate codes → validation error. Deactivate does not rewrite historical redemptions.

---

### UC-MKT-02 — Manage promotional content

**Actor:** Staff with Marketing edit.  
**Goal:** Manage banners or featured products **if the storefront supports them**.

**Exception:** Storefront has no banner API → module hidden or read-only placeholder.

---

### UC-MKT-03 — Review campaign performance

**Actor:** Staff with Marketing view.  
**Goal:** Tie campaigns to orders and revenue, plus email/notification stats if integrated.

---

## 6. CRM

### UC-CRM-01 — View unified contact profile

**Actor:** Staff with CRM view.  
**Goal:** See a buyer or seller as a single contact with linked commerce data.

**Main flow:** Open profile → identity, tags, activity timeline (orders, tickets, notes), links to transactions.

---

### UC-CRM-02 — Add internal note and tags

**Actor:** Staff with CRM edit.  
**Goal:** Record admin-only notes and segmentation (e.g. VIP, high-volume, at-risk).

**Postcondition:** Notes are never shown to buyers or sellers.

---

### UC-CRM-03 — Assign CRM task

**Actor:** Staff with CRM edit.  
**Goal:** Optional reminder/task assigned to an admin.  
**Status:** Optional (requirements §6).

---

## 7. Orders

### UC-ORD-01 — Browse and filter orders

**Actor:** Staff with Orders view.  
**Goal:** Work a paginated, sortable, filterable order list (status, buyer, seller, date, ID).

**Postcondition:** List loads within the ~2s performance target for typical page sizes.

---

### UC-ORD-02 — View order detail

**Actor:** Staff with Orders view.  
**Goal:** See full order context.

**Shown:** order ID, timestamps, buyer, seller(s) per line or split order, line items (product, qty, unit price, specifications), shipping address, delivery method, status history (actor + time), linked invoice and transactions.

---

### UC-ORD-03 — Update order information

**Actor:** Staff with Orders update.  
**Goal:** Correct allowed fields (e.g. shipping address, delivery method, notes) without rewriting financial snapshots unless a defined amend process runs.

**Exception:** Changes after `shipping` / `delivered` may be blocked or require Superuser + audit reason.

**Delete:** Hard delete is restricted; soft-delete only if policy allows.

---

### UC-ORD-04 — Advance order status

**Actor:** Staff with Orders update status.  
**Goal:** Move `processing` → `shipping` → `delivered`.

**Main flow**

1. Staff chooses the next status.
2. System validates the transition.
3. System appends status history (actor, timestamp).
4. Audit log records the change.

**Exception:** Illegal skip (e.g. `processing` → `delivered` without shipping) is rejected unless a Superuser override exists and is audited. See [edge-case.md](./edge-case.md).

---

### UC-ORD-05 — Cancel order

**Actor:** Staff with Orders update.  
**Goal:** Cancel with a **mandatory reason**.

**Main flow:** Staff cancels → reason required → status `canceled` → history + audit. Refund is a **separate** action (UC-TXN-02) when money was captured.

**Exception:** Already `delivered` — cancel may be forbidden; use return/refund policy instead (open question). Already `canceled` — no-op with error.

---

### UC-ORD-06 — Assign fulfillment

**Actor:** Staff with Orders update.  
**Goal:** Assign or reassign the order (or split) to a fulfillment workflow, if the marketplace uses one.

**Exception:** Feature hidden when no fulfillment workflow is configured.

---

## 8. Buyers

### UC-BYR-01 — Manage buyer records

**Actor:** Staff with Buyers view/edit.  
**Goal:** Create, read, update buyers; delete is **soft-delete or anonymize** per policy.

**Fields:** name, username, email, registration date, last activity; linked orders and tickets.

**Exception:** Duplicate email/username → reject. Delete blocked or converted to anonymize when open orders/tickets exist (see edge cases).

---

### UC-BYR-02 — Manage buyer addresses

**Actor:** Staff with Buyers edit.  
**Goal:** Add, edit, remove addresses; billing/shipping types; default flags.

**Invariant:** At most one default shipping and one default billing address per buyer.

---

## 8.1 Buyer panel

### UC-BYR-AUTH-01 — Sign in to buyer panel

**Actor:** Buyer  
**Goal:** Access the buyer panel.  
**Preconditions:** Buyer exists, status `active`, login provisioned.

**Main flow:** Buyer submits credentials → session `actor_type = buyer`, `buyer_id` → profile/orders home.

**Exception:** `suspended` / anonymized → denied. Admin or seller credentials on buyer login → denied.

---

### UC-BYR-PROF-01 — Edit own profile

**Actor:** Buyer  
**Goal:** Update own name, username, email, password.

**Exception:** Duplicate email/username → reject. Cannot change another buyer’s profile.

---

### UC-BYR-PROF-02 — Manage own addresses

**Actor:** Buyer  
**Goal:** Same address rules as UC-BYR-02, only for `buyer_id = session`.

---

### UC-BYR-ORD-01 — Browse own orders

**Actor:** Buyer  
**Goal:** Paginated list of orders where `buyer_id = session`.

---

### UC-BYR-ORD-02 — View own order

**Actor:** Buyer  
**Goal:** See line items, status history, shipping snapshot, related tickets.

**Exception:** Other buyers’ orders → 403/404. Invoices/transactions as displayed snapshots only if issued to this buyer (phase 2); no refund command.

---

### UC-BYR-ORD-03 — Cancel own order

**Actor:** Buyer  
**Goal:** Cancel when status allows (`processing` or `shipping` per policy), with mandatory reason.

**Exception:** `delivered` → **Block**. Does not auto-refund.

---

### UC-BYR-TKT-01 — Browse own tickets

**Actor:** Buyer  
**Goal:** List tickets where `requester_buyer_id = session` (site and buyer–seller).

---

### UC-BYR-TKT-02 — Open or reply to a ticket

**Actor:** Buyer  
**Goal:** Create a ticket (site or buyer–seller with related order/product they own) and reply on the thread.

**Exception:** Cannot see or reply to other buyers’ tickets. Closed tickets read-only unless reopen is allowed.

---

## 9. Sellers

### UC-SLR-01 — Manage seller records

**Actor:** Staff with Sellers view/edit.  
**Goal:** CRUD seller: business/display name, contact, workplace address (text and/or map), linked products, payout/transaction summary.

---

### UC-SLR-02 — Enable or disable seller

**Actor:** Staff with Sellers edit.  
**Goal:** Take a vendor on or off the marketplace.

**Postcondition:** Disabled seller cannot receive new published listings / new orders. **Seller panel login is blocked.** Open orders remain visible to Admin/Support for fulfillment. Action is audited.

---

### UC-SLR-03 — Configure seller delivery and support

**Actor:** Staff with Sellers edit.  
**Goal:** Set delivery methods (standard, express, pickup, …) and buyer-support channel settings.

**Related:** Staff can open orders and tickets that involve this seller from the seller profile.

---

## 9.1 Seller panel

Seller sessions never load the Admin or Buyer panels. Navigation is **Analytics**, **Products**, **Orders**, and **Tickets**.

### UC-SEL-AUTH-01 — Sign in to seller panel

**Actor:** Seller  
**Goal:** Access the seller panel.  
**Preconditions:** Seller record exists, status is `enabled`, portal login is provisioned.

**Main flow**

1. Seller opens seller login and submits credentials.
2. System authenticates against the seller account (not AdminUser).
3. System creates a session bound to `seller_id` and `actor_type = seller`.
4. System redirects to seller analytics (or last allowed seller page).

**Exception:** `disabled` or no login → access denied. Staff credentials on seller login → denied.

---

### UC-SEL-AN-01 — View shop analytics

**Actor:** Seller  
**Goal:** See revenue, order volume, AOV, status breakdown, and top products **for this seller only**.

**Main flow:** Seller picks a date range (and optional comparison) → system aggregates only orders/line items/payments for `seller_id`.

**Exception:** Platform-wide or other-seller widgets are never returned. Conversion funnel is omitted unless storefront events exist **and** are attributable to this seller.

---

### UC-SEL-TKT-01 — Browse tickets from buyers

**Actor:** Seller  
**Goal:** Work buyer ↔ seller tickets for this shop.

**Main flow:** Seller opens Tickets → list is `type = buyer_seller` AND `seller_id = session`. Filter by status, buyer, related order/product.

**Exception:** Site-support tickets and other sellers’ tickets are omitted (same as no match). Direct ID access → 404/403 with no leakage.

---

### UC-SEL-TKT-02 — Reply to a buyer ticket

**Actor:** Seller  
**Goal:** Reply on the thread and/or change status (`open`, `in progress`, `waiting`, `resolved`, `closed`).

**Main flow:** Seller opens an in-scope ticket → replies (`author_type = seller`) and/or updates status.

**Exception:** Closed tickets read-only unless reopen is allowed. Cannot assign tickets to staff from this shell (staff assignment remains a staff action).

---

### UC-SEL-PRD-01 — Manage own products

**Actor:** Seller  
**Goal:** CRUD products where `seller_id = session`. Create always sets seller to self.

**Exception:** Cannot change seller association. Cannot open or mutate another seller’s product (403/404).

---

### UC-SEL-PRD-02 — Manage own images, variants, and stock

**Actor:** Seller  
**Goal:** Same as UC-PRD-02, limited to own products. Stock movements record `actor_seller_id`.

---

### UC-SEL-PRD-03 — Publish or unpublish own product

**Actor:** Seller  
**Goal:** Same publish rules as UC-PRD-03 on own products.

**Exception:** If staff archived or removed the product after a report, seller cannot unilaterally republish without staff policy (default **Block**).

---

### UC-SEL-ORD-01 — Browse own orders

**Actor:** Seller  
**Goal:** Paginated list of orders that include this seller’s line items / splits.

**Exception:** Orders that only belong to other sellers are omitted (same as no match).

---

### UC-SEL-ORD-02 — View own order detail

**Actor:** Seller  
**Goal:** See buyer shipping snapshot, own line items, status history for own split, linked ticket if any.

**Exception:** Other sellers’ line items, invoices, and transactions are hidden. Buyer PII beyond fulfillment needs is not listed as a buyers-directory page.

---

### UC-SEL-ORD-03 — Advance own fulfillment status

**Actor:** Seller  
**Goal:** Move **their** split `processing` → `shipping` → `delivered` (same machine as UC-ORD-04).

**Postcondition:** History records `actor_seller_id`. Parent order status is derived from splits (see EC-ORD-01).

---

### UC-SEL-ORD-04 — Cancel own fulfillment

**Actor:** Seller  
**Goal:** Cancel their unfilled split with a **mandatory reason**. Does not create a refund.

**Exception:** Already `delivered` → **Block**. Multi-seller: canceling one split does not cancel other sellers. Prompt staff for refund if payment was captured.

---

## 10. Invoices

### UC-INV-01 — Browse invoices

**Actor:** Staff with Invoices view.  
**Goal:** List, filter, search by number, buyer, seller, status, date.

---

### UC-INV-02 — View and download invoice

**Actor:** Staff with Invoices view.  
**Goal:** Open an order-tied or manual invoice and download PDF.

---

### UC-INV-03 — Create manual invoice

**Actor:** Staff with Invoices create.  
**Goal:** Generate a one-off invoice (custom line items), not necessarily tied to an existing order.

**Main flow:** Enter buyer (and seller if applicable), line items, tax, shipping, dates, status `draft` or `issued` → persist unique invoice number.

---

### UC-INV-04 — Void or amend invoice

**Actor:** Staff with Invoices edit.  
**Goal:** Void or amend with an audit log.

**Exception:** `paid` invoices are not silently rewritten; void/credit-note path required (see edge cases).

---

## 11. Transactions

### UC-TXN-01 — Browse transactions

**Actor:** Staff with Transactions view.  
**Goal:** Filter by type (payment, refund, payout, adjustment), status, amount, linked order/invoice/buyer/seller.

**Note:** Payment gateway internals are out of scope; store external payment-method reference only.

---

### UC-TXN-02 — Initiate refund

**Actor:** Staff with Transactions refund.  
**Goal:** Refund with confirmation; role-gated.

**Main flow**

1. Staff opens a completed payment (or order/invoice).
2. Staff enters amount (full or partial) and confirms.
3. System creates a `pending` refund transaction, then `completed` or `failed`.
4. Audit log records actor, amount, reason.

**Exception:** Amount > remaining refundable balance → reject. Duplicate in-flight refund → reject.

**Stretch:** Export transactions for accounting.

---

## 12. Catalog — products, reviews, Q&A, reports

### UC-PRD-01 — Manage product catalog

**Actor:** Staff with Products view/edit. Sellers use UC-SEL-PRD-01 for their own catalog.  
**Goal:** CRUD products: name, technical description, seller, price / sale price, technical specs, status (`draft`, `published`, `out of stock`, `archived`).

---

### UC-PRD-02 — Manage images, variants, and stock

**Actor:** Staff with Products edit.  
**Goal:** Primary + gallery images; specification options (color, size) at variant level; stock adjustments.

**Postcondition:** Stock changes are attributable (audit or stock-movement record).

---

### UC-PRD-03 — Publish or unpublish product

**Actor:** Staff with Products edit.  
**Goal:** Change catalog visibility.

**Exception:** Publish may be blocked if required fields/images are missing. Removal from catalog (including via product reports) is audited and notifies the seller (notification channel TBD).

---

### UC-REV-01 — Moderate product reviews

**Actor:** Staff with Reviews moderate.  
**Goal:** Filter by product, rating, status; approve, hide, or delete; optional admin/seller reply (policy TBD).

**Statuses:** `pending`, `approved`, `hidden`, `flagged`.

---

### UC-QA-01 — Moderate product Q&A

**Actor:** Staff with Q&A moderate.  
**Goal:** List, approve, edit, or remove questions/answers (`pending`, `published`, `hidden`).

---

### UC-QA-02 — Post official answer

**Actor:** Staff with Q&A moderate.  
**Goal:** Answer as admin (or on behalf of seller per policy). Record answered-by and timestamp.

---

### UC-RPT-01 — Triage product reports

**Actor:** Staff with Reports moderate.  
**Goal:** Review reports (`pending review` → `approved` or `rejected`).

**Fields used:** product, reporter (buyer), reason/category, description, optional evidence, reviewer, notes, resolution action.

---

### UC-RPT-02 — Resolve approved report

**Actor:** Staff with Reports moderate (and Products edit as needed).  
**Goal:** On approval, perform one of: request seller edit, admin-edit product, remove product (notify seller). Warn/suspend seller is stretch.

**Postcondition:** Report status `approved`; resolution action stored; product/seller change audited.

---

## 13. Blog

### UC-BLG-01 — Manage blog posts

**Actor:** Staff with Blog edit.  
**Goal:** CRUD posts (title, slug, rich body, featured image, author admin, publish date, `draft` / `published` / `archived`, optional categories/tags). Schedule or publish immediately.

---

### UC-BLG-02 — Moderate blog comments

**Actor:** Staff with Blog edit.  
**Goal:** Per-post comment list: approve, hide, delete, mark spam.

---

## 14. Admins (superuser)

### UC-ADM-01 — Manage admin accounts

**Actor:** Superuser.  
**Goal:** List, create, edit, suspend staff. Fields: name, email, username, role template or custom permissions, `active` / `suspended`, last login.

**Exception:** Superuser cannot leave the system with zero active superusers (see edge cases).

---

### UC-ADM-02 — Assign permissions

**Actor:** Superuser.  
**Goal:** Grant or revoke permission areas (Analytics, Marketing, CRM, Orders, Buyers, Sellers, Invoices, Transactions, Products/Reviews/Q&A/Reports, Blog, Tickets, Admin management).

**Postcondition:** Next authorized request uses the new set. In-flight sessions should be re-evaluated (see ADR).

---

### UC-ADM-03 — Promote or demote superuser

**Actor:** Superuser.  
**Goal:** Promote an admin to superuser or demote a superuser to admin with an explicit permission set.

**Exception:** Self-demotion allowed only if another active superuser remains.

---

## 15. Tickets

### UC-TKT-01 — Browse support tickets

**Actor:** Staff with Tickets view.  
**Goal:** Filter by type (`site` vs `buyer-seller`), status, buyer, seller, assignee, related order/product.

**Statuses:** `open`, `in progress`, `waiting`, `resolved`, `closed`.

**Visibility:** Non-superuser staff see only tickets allowed by their assignment/permissions. Superuser uses UC-TKT-03.

---

### UC-TKT-02 — Assign and work a ticket

**Actor:** Staff with Tickets respond.  
**Goal:** Assign to an admin, reply on the message thread, change status.

**Main flow**

1. Staff opens ticket (subject, description, priority, requester buyer, optional order/product).
2. Staff assigns, replies, and/or updates status.
3. Thread stores messages with timestamps.

**Exception:** Closed tickets are read-only unless reopened by policy. Buyer–seller tickets are also worked on the seller panel (UC-SEL-TKT-*) and opened by the buyer (UC-BYR-TKT-*). Admin/Support may still view and reply.

---

### UC-TKT-03 — View all tickets (global)

**Actor:** Superuser.  
**Goal:** See **all** site-support and buyer–seller tickets with global filters (requirements §19).

---

## 16. Cross-cutting rules for every use case

1. **Authorization:** Every page and API checks permissions. Superuser bypasses restriction, not audit. Seller: analytics/products/orders/tickets + `seller_id`. Buyer: profile/addresses/orders/tickets + `buyer_id`. Support is limited Admin on the same panel.
2. **Lists:** Filter, sort, pagination; bulk actions only where specified later.
3. **Detail pages:** Surface related records (order ↔ buyer, seller, invoice, transactions).
4. **Audit:** Sensitive mutations write an audit record.
5. **Responsive:** Desktop primary; tablet usable.
6. **Soft-delete:** Buyers, sellers, products (and restricted order delete) follow legal/policy rules in requirements §20.

---

## 17. Traceability to phases

| Phase | Use cases in scope |
|-------|-------------------|
| **MVP** | UC-AUTH-*, UC-ADM-*, UC-ORD-*, UC-BYR-01/02, UC-BYR-AUTH-01, UC-BYR-PROF-*, UC-BYR-ORD-*, UC-SLR-*, UC-PRD-*, UC-SEL-AUTH-01, UC-SEL-PRD-*, UC-SEL-ORD-*, UC-TKT-01/02 (site), UC-BYR-TKT-* (site), Superuser UC-TKT-03 |
| **Phase 2** | UC-INV-*, UC-TXN-*, UC-REV-*, UC-QA-*, UC-RPT-*, UC-TKT-* including buyer–seller, UC-SEL-TKT-*, UC-BYR-TKT-* (buyer–seller) |
| **Phase 3** | UC-AN-*, UC-SEL-AN-01, UC-MKT-*, UC-CRM-*, UC-BLG-*, UC-GLB-01, advanced export and audit UI (UC-GLB-02, UC-AN-03) |
