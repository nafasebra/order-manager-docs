# Edge Cases

Derived from [requirements.md](./requirements.md). Each item is a situation the portals must handle explicitly — reject, degrade, or follow a defined policy — rather than fail silently.

Related: [use-case.md](./use-case.md) · [entities.md](./entities.md) · [data-flow.md](./data-flow.md)

Legend: **Block** = refuse the action · **Allow + audit** = permit with reason and audit · **Policy TBD** = called out in requirements §22.

---

## 1. Auth, sessions, and permissions

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-AUTH-01 | Login with `suspended` account | Block. Generic or explicit “account disabled” per security policy. |
| EC-AUTH-02 | Session expires while a long form is open | Block submit. Preserve draft locally if possible; require re-auth. Do not apply half-saved mutations. |
| EC-AUTH-03 | Permissions revoked while session is still valid | Every API/route re-checks current permissions. Mid-session revoke takes effect on next request. Navigation must hide newly forbidden modules. |
| EC-AUTH-04 | Admin opens a deep link they cannot access | 403 + safe redirect to an allowed page. No data leakage in error body. |
| EC-AUTH-05 | Last active superuser is demoted or suspended | **Block.** System must always retain at least one active superuser. |
| EC-AUTH-06 | Superuser suspends themselves | **Block** unless another active superuser exists. Prefer requiring a second superuser to suspend. |
| EC-AUTH-07 | Concurrent permission edits on the same admin | Last-write-wins is unsafe. Use optimistic locking (version) or reject stale updates. Audit both attempts. |
| EC-AUTH-08 | Empty custom permission set | Allow (view-only login to an empty shell) **or** require at least one area — pick one in implementation; empty shell is confusing, prefer requiring a template. |
| EC-AUTH-09 | Role template later changes | Decide: existing admins keep a snapshot vs follow the template. Snapshot is safer; document in ADR. |
| EC-AUTH-10 | Seller or buyer signs in on the wrong panel | **Block.** Separate actor types; generic failure. |
| EC-AUTH-11 | Disabled seller / suspended buyer still has a session | Next request **Block**. Invalidate on disable/suspend. |
| EC-AUTH-12 | Seller or buyer opens Admin URLs (or another party’s records) | **403/404.** No data leakage. |
| EC-AUTH-13 | Panel login never provisioned | **Block.** Admin/Support must provision seller/buyer login. |
| EC-AUTH-14 | Support or Editor opens routes outside their template (marketing, refunds, admin management; Editor also commerce/people) | **403** unless that action is granted. Same Admin panel, limited grants. |
| EC-AUTH-15 | Buyer query without `buyer_id` scope | API **must** inject session `buyer_id`. |

---

## 2. Orders

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-ORD-01 | Order has line items from **multiple sellers** | Model as split fulfillment. Admin list/detail shows all sellers. **Each seller panel sees only their split. Buyer sees the whole order they placed.** |
| EC-ORD-02 | Status skip (`processing` → `delivered`) | **Block** the happy-path machine. Superuser override only if product later allows it, with mandatory reason + audit. |
| EC-ORD-03 | Cancel when status is `delivered` | **Block** cancel. Use refund/return/adjustment (phase 2+) instead. |
| EC-ORD-04 | Cancel when already `canceled` | Idempotent error: “already canceled.” Do not duplicate history noise. |
| EC-ORD-05 | Cancel after payment captured | Allow cancel **with reason**. Do **not** auto-refund unless policy says so. Prompt staff toward UC-TXN-02. |
| EC-ORD-06 | Cancel before payment completes (`pending` payment) | Allow cancel. Do not create a refund against a non-completed payment. Void/abandon the pending payment if the provider supports it (gateway TBD). |
| EC-ORD-07 | Two staff change status at once | Optimistic lock on `updated_at` / version. Loser refreshes. Both attempts audited if one succeeds. |
| EC-ORD-08 | Shipping address edited after `shipping` | **Block** or Superuser + reason. Carrier already has the original address. |
| EC-ORD-09 | Buyer is soft-deleted / anonymized but orders exist | Orders remain. Buyer link shows “anonymized” placeholder; financial records stay intact. |
| EC-ORD-10 | Seller disabled while order is `processing` | Order remains actionable. New orders for that seller are blocked at storefront. Dashboard shows a banner on the order. |
| EC-ORD-11 | Product deleted/archived after order placed | Line item **snapshots** name, specs, unit price, seller. Catalog deletion must not erase historical order lines. |
| EC-ORD-12 | Stock is zero when moving to `shipping` | Warn; do not silently drive stock negative. Staff may **Allow + audit** if oversell is a business choice. |
| EC-ORD-13 | Quantity or price edited after `processing` | Prefer **Block**. Financials should be immutable snapshots; correction via adjustment transaction / new invoice. |
| EC-ORD-14 | Order with zero line items or qty ≤ 0 | **Block** create/update. |
| EC-ORD-15 | Hard-delete order | **Block** for normal admins. Soft-delete only if policy allows; Superuser still audited. |
| EC-ORD-16 | Missing mandatory cancel reason | **Block.** |
| EC-ORD-17 | Delivery method not enabled for the seller at placement | **Block** create. Pickup vs ship-address mismatch (pickup but full street address required) — **Block**. Later staff edits of method: **Block** or warn if the seller no longer offers it. |
| EC-ORD-19 | Payment way not enabled for the seller at placement | **Block** create. |
| EC-ORD-18 | Timezone / “today” filters around midnight | All list filters use a single configured timezone (NFR: configurable date formatting). Document which zone analytics and order lists share. |

---

## 3. Buyers

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-BYR-01 | Duplicate email or username | **Block** create/update. Unique constraint at DB. |
| EC-BYR-02 | Soft-delete buyer with open orders | **Block** or anonymize-in-place. **Buyer panel login revoked.** |
| EC-BYR-03 | Soft-delete buyer with open tickets | Tickets remain; requester shown as anonymized. |
| EC-BYR-04 | Two default shipping addresses | **Block.** Setting a new default unset the previous. |
| EC-BYR-05 | Delete the last address | Allow if orders snapshot addresses; **Block** if checkout still requires a stored default (storefront TBD). |
| EC-BYR-06 | Anonymize vs delete (GDPR-style) | Policy TBD (§22). Anonymize must strip PII (name, email, addresses, username) but keep order/invoice integrity. |
| EC-BYR-07 | Buyer is also a seller contact | Same person, two records. CRM unified profile may **link** them; do not merge IDs without an explicit merge tool. |
| EC-BYR-08 | Last activity never recorded | Show “never” / registration date only. Do not fake activity from staff viewing the profile. |

---

## 4. Sellers

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-SLR-01 | Disable seller with `published` products | Auto-unpublish or leave published but not purchasable — **must pick one**. **Seller panel login is blocked.** |
| EC-SLR-02 | Disable seller with open orders | **Allow.** Open orders stay in the pipeline for **staff**; new orders blocked. Seller cannot sign in. |
| EC-SLR-03 | Delete seller with historical orders | Soft-delete. Orders keep seller snapshot / FK to tombstone. Seller login revoked. |
| EC-SLR-04 | No **delivery methods** enabled | **Block** enabling the shop / publishing products until at least one method is enabled. Checkout cannot place an order for that seller. |
| EC-SLR-17 | Disable the last enabled delivery method | **Block** or require another method first. Existing orders keep `delivery_method_snapshot`. |
| EC-SLR-18 | Multi-seller checkout when sellers share no common enabled delivery method | **Block** combined checkout, or split shipment per seller (policy). Do not silently pick a method the seller does not offer. |
| EC-SLR-19 | Delivery method edited after orders exist | **Allow.** New checkouts use the new config. Historical orders keep `delivery_method_snapshot`. |
| EC-SLR-12 | No **payment ways** enabled | **Block** enabling the shop / publishing products until at least one way is enabled. Checkout cannot place an order for that seller. |
| EC-SLR-13 | Seller stores card PAN/CVV in payment-way instructions | **Block.** Instructions are plain text only (bank name, IBAN, reference). Card data never stored. |
| EC-SLR-14 | Disable the last enabled payment way | **Block** or require another way first. Existing orders keep their snapshot. |
| EC-SLR-15 | Multi-seller checkout when sellers share no common enabled payment way | **Block** combined checkout, or split payment per seller (policy). Do not silently pick a way the seller does not offer. |
| EC-SLR-16 | Payment way edited after orders exist | **Allow.** New checkouts use the new config. Historical orders keep `payment_way_snapshot`. |
| EC-SLR-05 | Map location invalid / empty free-text address | Allow incomplete workplace address in draft; require it before “enabled.” |
| EC-SLR-06 | Payout summary while seller has failed payouts | Show failed payouts in **staff** transaction list; do not hide negative or failed rows. Seller panel does not include payouts. |
| EC-SLR-07 | Re-enable seller | Does not auto-republish products. Staff or seller republishes explicitly. Portal login works again if credentials still exist. |
| EC-SLR-08 | Seller creates/edits a product or order for another `seller_id` | **Block.** Create/list always stamps/filters session `seller_id`. |
| EC-SLR-09 | Seller analytics or order query without seller scope | API **must** inject `seller_id` from session; ignore client-supplied seller filters that widen the set. |
| EC-SLR-10 | Two people share one seller login | Allowed until multi-user seller accounts exist. Audit uses the seller actor, not a personal staff id. |
| EC-SLR-11 | Seller tries to refund or open invoice/transaction APIs | **Block.** Refunds remain staff (Admin) commands. |

---

## 5. Invoices

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-INV-01 | Download PDF for `draft` | Allow watermarked draft **or** Block until `issued`. Pick one; default: allow draft PDF labeled DRAFT. |
| EC-INV-02 | Void a `paid` invoice | **Block** simple void. Require credit note / reversing invoice + audit. |
| EC-INV-03 | Amend after `issued` | Versioned amend or credit+reissue. Never silently rewrite a number already sent to a buyer. |
| EC-INV-04 | Duplicate invoice numbers | **Block.** Sequential unique number generator; handle concurrent creates. |
| EC-INV-05 | Manual invoice with no order | **Allow** (requirements: one-off/custom). Buyer required; seller optional. |
| EC-INV-06 | Invoice for `canceled` order | Allow view of existing invoice. Creating a new “sale” invoice for a canceled order is **Block** unless it is a cancellation/credit document. |
| EC-INV-07 | Tax/shipping total ≠ sum of lines | **Block** save. Server recomputes totals; client figures are advisory. |
| EC-INV-08 | Currency mismatch vs order/transactions | **Block** or convert with recorded rate. Multi-currency is an open question (§22). |
| EC-INV-09 | Void `draft` | **Allow.** No financial side effects. |

---

## 6. Transactions and refunds

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-TXN-01 | Refund greater than remaining capturable amount | **Block.** Remaining = completed payments − completed refunds − pending refunds. |
| EC-TXN-02 | Two refunds submitted at once | Idempotency key + lock on the payment. Second request **Block**. |
| EC-TXN-03 | Refund confirmation skipped (API call) | **Block** without explicit confirm flag. UI confirmation is not enough; API must require it. |
| EC-TXN-04 | Refund against `failed` or `pending` payment | **Block.** |
| EC-TXN-05 | Payment `completed` but order still not `processing` | Data repair task / staff warning. Do not hide the payment. |
| EC-TXN-06 | Order `processing` with no completed payment | Allowed if “confirmed” without pay (requirements: “Paid or confirmed”). UI must show payment gap. |
| EC-TXN-07 | `reversed` / chargeback | New transaction type `reversed`. Do not delete the original payment. Surface on order and buyer CRM. |
| EC-TXN-08 | Payout to disabled seller | **Block** new payouts; show outstanding balance. |
| EC-TXN-09 | Adjustment with no linked order/invoice | **Allow** if type is `adjustment` and reason is mandatory + audit. |
| EC-TXN-10 | Gateway webhook delayed/duplicated (when integrated) | Idempotent upsert on external ID. Out of scope for MVP details but design the unique `(provider, external_id)` now. |
| EC-TXN-11 | Partial refund then full cancel | Cancel does not create a second full refund automatically. Staff sees remaining refundable. |
| EC-TXN-12 | Export of huge transaction set | Async job; do not time out the list request. Stretch goal. |

---

## 7. Products, stock, and media

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-PRD-01 | Publish with missing required media or price | **Block.** |
| EC-PRD-02 | Publish with stock 0 | Set status `out of stock` rather than `published`, or allow published+zero if backorder is a rule. Default: **Block** or auto `out of stock`. |
| EC-PRD-03 | Concurrent stock adjustments | Atomic increment/decrement. Never read-modify-write without a lock. Negative stock **Block** unless oversell flag exists. |
| EC-PRD-04 | Variant stock vs parent stock | Parent stock is derived (sum of variants) **or** parent is unused when variants exist. Never keep two independent truths. |
| EC-PRD-05 | Remove product that appears on open orders | Soft-delete / `archived`. Open orders keep snapshots (EC-ORD-11). |
| EC-PRD-06 | Change seller association on a live product | **Allow + audit** or **Block** after first sale. Prefer Block after first order to keep history coherent. |
| EC-PRD-07 | Image upload too large / wrong type | **Block** with validation. Partial gallery save should not leave a broken primary image. |
| EC-PRD-08 | Sale price > regular price | **Block.** |
| EC-PRD-09 | Unpublish vs archive vs report-removal | Unpublish = hidden, reversible. Archive = not sold, retained. Report-removal = unpublish/archive + seller notification + audit. |
| EC-PRD-10 | Specifications at product and variant both set and conflicting | Variant wins at checkout; product-level specs are defaults. Validate on save. |

---

## 8. Reviews, Q&A, product reports

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-REV-01 | Review from a buyer who never ordered the product | Policy TBD. Default **flag** for moderator; do not auto-approve. |
| EC-REV-02 | Duplicate review same buyer+product | **Block** second approved review; allow update of existing pending. |
| EC-REV-03 | Review on deleted/archived product | Keep for moderation history; hide on storefront. |
| EC-REV-04 | Reply policy (site vs seller) | Staff may reply as admin. **Sellers do not moderate reviews** on the seller panel (reviews are Admin-only). |
| EC-QA-01 | Publish answer while question is `hidden`/`pending` | **Block** storefront publish; staff may still draft the answer. |
| EC-QA-02 | Multiple answers | Allow; mark one as official admin answer. |
| EC-QA-03 | Asker buyer later anonymized | Question remains; asker display name becomes anonymized. |
| EC-RPT-01 | Reporter is the seller of the product | Allow (self-report is odd but possible via buyer account). Flag for moderator. |
| EC-RPT-02 | Approve report but product already removed | Complete report as `approved` with resolution “already removed.” Do not error. |
| EC-RPT-03 | Two reports, conflicting (one reject, one approve) | Independent reports. Approving one can still trigger removal; remaining pending reports auto-close as “product already actioned” or stay for notes. |
| EC-RPT-04 | Approve without choosing a resolution action | **Block.** Requirements require an action: request seller edit, admin edit, or remove. |
| EC-RPT-05 | Evidence file malware / huge upload | Validate type/size; store outside public catalog URL. |
| EC-RPT-06 | Reject then reporter resubmits | New report allowed. Do not silently merge. |

---

## 9. Marketing and CRM

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-MKT-01 | Coupon usage limit hit by two checkouts at once | Atomic redemption counter. One succeeds, one **Block** at storefront; dashboard usage stats stay consistent. |
| EC-MKT-02 | Coupon `active` but now past end date | Scheduler or read-time: treat as `ended`. Dashboard should not show it as usable. |
| EC-MKT-03 | Start date after end date | **Block** save. |
| EC-MKT-04 | Duplicate coupon code (case/spacing) | Normalize and **Block** duplicates. |
| EC-MKT-05 | Deactivate after redemptions exist | **Allow.** Historical orders keep the discount snapshot. |
| EC-MKT-06 | Campaign linked to deleted product/seller | Show broken-link warning; campaign can stay `ended`. |
| EC-MKT-07 | Email open/click stats with no ESP integration | Hide metrics; do not show zeros as if they were real. |
| EC-CRM-01 | Internal note accidentally treated as buyer-visible | Notes have `internal` flag default true; no storefront API for notes. |
| EC-CRM-02 | Tag renamed/deleted while in use | Rename updates all; delete requires reassign or orphan-tag cleanup. |
| EC-CRM-03 | Task assigned to suspended admin | **Block** or auto-unassign with warning. |

---

## 10. Website and blog

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-WEB-01 | Duplicate website page slug | **Block.** Unique slug. |
| EC-WEB-02 | Hard-delete `terms` or `privacy` page | **Block.** Archive or unpublish. Storefront must still resolve a legal URL or show a configured fallback. |
| EC-WEB-03 | Publish site context with empty site name | **Block.** |
| EC-WEB-04 | Editor edits another admin’s draft page or post | **Allow** (shop-wide content, not personal). Audit `updated_by`. |
| EC-WEB-05 | Unpublish the only published homepage copy / required page while storefront is live | **Allow + warn**, or **Block** if policy requires always-on legal pages. Default: legal types stay published. |
| EC-BLG-01 | Duplicate slug | **Block.** Unique slug. |
| EC-BLG-02 | Schedule publish in the past | Treat as publish immediately **or** Block. Prefer publish immediately with warning. |
| EC-BLG-03 | Author admin later deleted/suspended | Post remains; author shown as historical name snapshot. |
| EC-BLG-04 | Delete published post with comments | Soft-delete or archive post; comments retained for audit. |
| EC-BLG-05 | Mark spam then approve | Last status wins; audit both. |

---

## 11. Tickets

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-TKT-01 | Site ticket vs buyer–seller ticket for the same order | **Allow both.** Filters and type are mandatory so they do not mix in default views. |
| EC-TKT-02 | Assign to suspended or non-existent admin | **Block.** |
| EC-TKT-03 | Reply on `closed` ticket | **Block** unless reopen is an explicit action. |
| EC-TKT-04 | Buyer–seller ticket when seller is disabled | **Allow** staff to continue the thread. Seller cannot sign in to reply. |
| EC-TKT-05 | Non-superuser lists tickets they must not see | Query-level filter, not only UI hide. Superuser sees all (UC-TKT-03). **Seller lists only `buyer_seller` + own `seller_id`.** |
| EC-TKT-06 | Related order/product deleted | Keep ticket; show snapshot / “record unavailable.” |
| EC-TKT-07 | Requester anonymized | Thread remains; PII in old messages is a **data-retention** question (§22). |
| EC-TKT-08 | Priority or type changed after work started | **Allow + audit.** |
| EC-TKT-09 | Two assignees / race on assign | Last confirmed assign wins with audit; consider “claimed” lock for support queues later. |

---

## 12. Analytics, lists, and search

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-AN-01 | End date before start date | **Block.** |
| EC-AN-02 | Comparison period of different length | Allow but label that comparison is not like-for-like, **or** force equal length. Prefer equal length. |
| EC-AN-03 | Soft-deleted orders/products in revenue | Revenue uses **financially completed** orders, including canceled-after-pay only if payment was kept. Document inclusion rules. Do not drop paid canceled orders from revenue without a policy. |
| EC-AN-04 | Empty catalog / zero orders | Show empty states, not broken charts. |
| EC-AN-05 | Conversion funnel without storefront events | Hide or “unavailable.” |
| EC-AN-06 | Multi-currency totals | Open question. Until decided, show single configured currency or break down by currency — never sum mixed currencies as one number. |
| EC-LST-01 | Filter combination matches nothing | Empty list, not an error. Pagination `page` beyond last → clamp to last page. |
| EC-LST-02 | Bulk action on mixed permissions / mixed statuses | Apply only to eligible rows; return per-row results. |
| EC-GLB-01 | Global search matches forbidden entities | Omit from results (same as no match). |
| EC-GLB-02 | Search by partial email (PII) | Allowed for staff with Buyers view; still permission-gated. Audit unusually broad exports, not every keystroke. |

---

## 13. Cross-cutting data and NFR

| ID | Scenario | Expected handling |
|----|----------|-------------------|
| EC-NFR-01 | List page > typical dataset | Pagination required. No unbounded `find()`. Target ~2s. |
| EC-NFR-02 | Clock skew between app servers | Store timestamps in UTC; format in configured locale/timezone. |
| EC-NFR-03 | Partial outage of PDF/export worker | Invoice view still works; download shows retry. |
| EC-NFR-04 | Backup restore | Open (backup strategy TBD). Design IDs as durable so restored FKs still resolve. |
| EC-NFR-05 | Localization not chosen yet | UI strings externalizable; no hardcoded legal copy that cannot be translated. |
| EC-NFR-06 | Accessibility: icon-only destructive actions | Require text or `aria-label`; confirm dialogs for refund, cancel, delete, suspend. |

---

## 14. Priority for MVP

Handle these **before** phase-2 finance and UGC:

1. EC-AUTH-05 / 06 (last superuser)
2. EC-ORD-01 (multi-seller) — even if MVP starts with single-seller orders, the data model must not paint the team into a corner
3. EC-ORD-02, 03, 05, 07, 11 (status machine, cancel vs refund, concurrency, snapshots)
4. EC-BYR-01, 02, 06 (identity uniqueness and delete policy)
5. EC-SLR-01, 02 (disable vs catalog vs open orders)
6. EC-PRD-03, 04, 05 (stock integrity and catalog vs history)
7. EC-TKT-05 (authorization on ticket queries, including seller-scoped lists)
8. EC-AUTH-10–15 and EC-SLR-08/09/11 (seller/buyer panel isolation; no seller/buyer refunds)
