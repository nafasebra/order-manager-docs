# Design System — Clean Commerce

Implementation spec for the **Admin**, **Seller**, and **Buyer** panels. **Visual direction:** [design.md](./design.md). **Colors:** [color-system.md](./color-system.md). **UI patterns:** [system-design.md](./system-design.md) §9. **Accessibility:** ADR-016.

Related: [frontend-architecture.md](./frontend-architecture.md) · [v1-page-architecture.md](./v1-page-architecture.md)

**Stack:** **shadcn/ui** on **Tailwind CSS v4**. **Name:** **Clean Commerce** (not the public storefront brand).

| design.md (what) | design-system.md (how) |
|------------------|------------------------|
| §1–3 Principles, layout | §1 Marketplace rules + shells |
| §4–7 Sidebar, top bar, page header | §4.2 Shell patterns, §5 page recipes |
| §8–11 Cards, KPI, charts, tables | §4–5 patterns, TanStack Table |
| §12 Status system | §3 Domain status chips |
| §13–17 Typography, themes, radius | §2 Tokens (`@theme`) — non-color |
| §14–16 Color / themes | [color-system.md](./color-system.md) → §2.1–2.5 |
| §18 Icons | Lucide via shadcn |
| §22 Components | §4 shadcn inventory |

---

## 1. Principles

Follow [design.md](./design.md) §2 (Clarity, Quiet visual language, Data first). Marketplace-specific additions:

1. **One kit, one palette** — Admin, Seller, and Buyer share **Mint + Teal + Navy** ([color-system.md](./color-system.md)); panel identity is nav and content, not per-panel brand colors. Set `data-panel` on the shell for analytics/context only.
2. **Operations first** — medium density per design.md §3; Admin tables may use `text-[13px]`; Buyer stays calmest.
3. **Commands are explicit** — cancel, refund, suspend, delete use `alert-dialog` with required reason when the domain requires it.
4. **Snapshots are read-only** — order delivery/payment way, line items, and addresses use muted `SnapshotBlock`; no inline edit.
5. **Accessible by default** — WCAG 2.1 AA; keyboard, labels, contrast, focus visible.
6. **Desktop primary, tablet usable** — sidebar collapses to Sheet; tables scroll horizontally. Phone is not a release target.
7. **shadcn first** — primitives in `components/ui`; marketplace behavior in `components/patterns` only.
8. **TanStack for lists** — TanStack Table + Query for tabular data; TanStack Virtual for scrollable lists.
9. **Minimal visual noise** — flat cards, subtle borders, minimal shadows ([design.md](./design.md) §8, §19).

---

## 2. Foundations (design tokens)

**Colors:** [color-system.md](./color-system.md) (canonical hex + semantic tokens). **Layout / typography / radius:** [design.md](./design.md) §3, §13, §17.

**Implementation:** Tailwind CSS v4 **`@theme`** in `src/index.css`, aligned with shadcn CSS variables. Use **`new-york`** style. Light + dark themes required.

### 2.1 Light theme → shadcn variables

Maps [color-system.md](./color-system.md) §6–8, §20 to HSL components (shadcn convention, no `hsl()` wrapper):

| color-system token | Hex | shadcn variable | HSL (reference) |
|--------------------|-----|-----------------|-----------------|
| `background.primary` | `#F4FFFC` | `--background` | `168 100% 98%` |
| `background.secondary` | `#E8FBF6` | sidebar bg | `168 60% 95%` |
| `surface.default` | `#FFFFFF` | `--card` | `0 0% 100%` |
| `text.primary` | `#172A32` | `--foreground` | `197 37% 15%` |
| `text.secondary` | `#52636B` | `--muted-foreground` | `197 15% 37%` |
| `text.muted` | `#7C8C93` | caption / hints | `197 10% 53%` |
| `border.default` | `#D9E8E4` | `--border`, `--input` | `168 30% 88%` |
| `primary.default` | `#0F9985` | `--primary` | `168 82% 33%` |
| `primary.hover` | `#087A6D` | hover (component) | `168 88% 26%` |
| `error.default` | `#DC2626` | `--destructive` | `0 72% 51%` |
| — | — | `--muted` | `168 50% 96%` |
| — | — | `--ring` | matches `--primary` |

**Shadows:** prefer border over shadow on cards ([design.md](./design.md) §8). Use `shadow-sm` only on dropdowns/modals.

### 2.2 Dark theme → shadcn variables

Maps [color-system.md](./color-system.md) §9–12, §20. Apply under `.dark` on `<html>` or shell root:

| color-system token | Hex | shadcn variable |
|--------------------|-----|-----------------|
| `background.primary` | `#172538` | `--background` |
| `background.secondary` | `#1F3045` | sidebar surface |
| `surface.default` | `#27394F` | `--card` |
| `surface.elevated` | `#30445A` | popover / modal |
| Modal / dropdown | `#3A4E62` | highest surface |
| `text.primary` | `#F2FAF8` | `--foreground` |
| `text.secondary` | `#C1D0D2` | `--muted-foreground` (secondary) |
| `text.muted` | `#8FA3A8` | hints |
| `border.default` | `#3A4E62` | `--border` |
| `primary.default` | `#20B59A` | `--primary` |
| `primary.hover` | `#48C7AF` | hover (component) |
| `error.default` | `#F87171` | `--destructive` |

Preserve surface hierarchy: background → sidebar → card → dropdown ([color-system.md](./color-system.md) §9).

### 2.3 Primary (Teal)

Unified **Teal** brand color for all panels ([color-system.md](./color-system.md) §2, §22). Do not override `--primary` per panel.

Navigation active state: subtle `bg-primary/10 text-primary` ([design.md](./design.md) §5).

```css
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
  --radius-sm: 0.5rem;   /* 8px — design.md §17 button/input */
  --radius-md: 0.75rem;  /* 12px — card */
  --radius-lg: 1rem;     /* 16px — modal */
  /* Semantic — color-system.md §13–16 */
  --color-success: 160 84% 31%;
  --color-warning: 32 95% 44%;
  --color-info: 207 73% 46%;
  --color-chart-1: 168 82% 33%;
  --color-chart-2: 168 55% 53%;
  --color-chart-3: 207 88% 67%;
  --color-chart-4: 258 90% 76%;
  --color-chart-5: 40 90% 63%;
  --color-chart-6: 0 84% 72%;
}

:root {
  --background: 168 100% 98%;
  --foreground: 197 37% 15%;
  --card: 0 0% 100%;
  --card-foreground: 197 37% 15%;
  --muted: 168 50% 96%;
  --muted-foreground: 197 15% 37%;
  --border: 168 30% 88%;
  --input: 168 30% 88%;
  --primary: 168 82% 33%;
  --primary-foreground: 0 0% 100%;
  --destructive: 0 72% 51%;
  --ring: 168 82% 33%;
}

.dark {
  --background: 213 45% 15%;
  --foreground: 168 33% 96%;
  --card: 213 33% 23%;
  --card-foreground: 168 33% 96%;
  --muted: 213 33% 19%;
  --muted-foreground: 192 14% 61%;
  --border: 213 25% 31%;
  --input: 213 25% 31%;
  --primary: 168 70% 42%;
  --primary-foreground: 213 45% 15%;
  --destructive: 0 91% 71%;
  --ring: 168 70% 42%;
  --color-success: 158 64% 52%;
  --color-warning: 43 96% 56%;
  --color-info: 207 88% 67%;
}
```
### 2.4 Domain semantic colors

Per [color-system.md](./color-system.md) §13–16 and [design.md](./design.md) §12:

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--color-success` | `#059669` | `#34D399` | Delivered, paid, enabled |
| `--color-warning` | `#D97706` | `#FBBF24` | Processing, pending |
| `--color-info` | `#217DC7` | `#60B3F5` | Shipping, in progress |
| `--destructive` | `#DC2626` | `#F87171` | Canceled, failed, delete |

Badge pattern: `bg-{semantic}/15 text-{semantic}` on `--card`. Semantic colors must meet **4.5:1** contrast.

**Charts:** use `--color-chart-1` … `--color-chart-6` from [color-system.md](./color-system.md) §17; default single series to chart-1 (Teal).

### 2.5 Typography

Per [design.md](./design.md) §13 — **Inter** primary; **Geist** optional fallback.

| Role | Size / weight | Tailwind |
|------|---------------|----------|
| Page title | 28–32px / 600 | `text-[28px] lg:text-[32px] font-semibold leading-tight` |
| Section title | 18–20px / 600 | `text-lg font-semibold` |
| Card value (KPI) | 24–32px / 600 | `text-2xl font-semibold` |
| Body | 14–15px / 400 | `text-sm` (shadcn default) |
| Secondary | 13–14px / 400 | `text-sm text-muted-foreground` |
| Caption | 12px | `text-xs text-muted-foreground` |
| Dense Admin tables | 13px | `text-[13px]` on Admin tables only |
| Monospace IDs | — | `font-mono text-sm` (order IDs, ticket numbers) |

Hierarchy from size, weight, spacing, and contrast — not color alone.

### 2.6 Spacing & layout

Per [design.md](./design.md) §3 — persistent sidebar, compact top bar, spacious content.

| Token / class | Value / use |
|---------------|-------------|
| Tailwind spacing scale | `1`–`16` (4px base) |
| `--sidebar-width` | `15rem` expanded; `4rem` collapsed ([design.md](./design.md) §4) |
| `--header-height` | `3.5rem` ([design.md](./design.md) §6) |
| Forms | `max-w-xl` (~720px) |
| Card padding | generous — `p-6` default |
| Shadows | minimal; border-first on cards ([design.md](./design.md) §8) |

**PageHeader:** title + optional description left; actions/filters right ([design.md](./design.md) §7).

### 2.7 Breakpoints

Use Tailwind v4 defaults: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px.

| Behavior | Breakpoint |
|----------|------------|
| Sidebar expanded | `lg+` |
| Sidebar collapsible (shadcn **Sheet** or icon rail) | `<lg` |
| Table horizontal scroll | `<md` |

### 2.8 Motion

Use shadcn / Radix animation utilities. Respect `prefers-reduced-motion: reduce` — disable sidebar slide and toast enter/exit.

---

## 3. Domain status chips

Map entity status → chip variant. Use consistent labels across panels.

### Orders

| Status | Variant | Label |
|--------|---------|-------|
| `processing` | warning | Processing |
| `shipping` | info | Shipping |
| `delivered` | success | Delivered |
| `canceled` | danger | Canceled |

### Tickets

| Status | Variant |
|--------|---------|
| `open` | info |
| `in_progress` | warning |
| `waiting` | neutral |
| `resolved` | success |
| `closed` | neutral muted |

### Content (phase 3)

| Status | Variant |
|--------|---------|
| `draft` | neutral |
| `published` | success |
| `archived` | neutral muted |

### Generic (Badge variants)

| Variant | Tailwind / shadcn |
|---------|-------------------|
| `neutral` | `Badge` variant `secondary` |
| `success` | custom: `bg-success/15 text-success` (define in `@theme`) |
| `warning` | custom: `bg-warning/15 text-warning` |
| `destructive` | `Badge` variant `destructive` |
| `info` | custom: `bg-info/15 text-info` |

**Component:** `<StatusChip />` — thin wrapper around shadcn **`Badge`** with domain-specific variant classes (`success`, `warning`, `info`, `destructive`, `secondary`).

---

## 4. Component inventory

**Base layer:** [shadcn/ui](https://ui.shadcn.com) components in `src/components/ui/` (Radix + Tailwind v4). Install via CLI; customize in place.

**Domain layer:** `src/components/patterns/` composes shadcn primitives for marketplace screens.

### 4.1 shadcn components to install (MVP+)

| shadcn component | Used for |
|------------------|----------|
| `button` | Actions, primary/secondary/destructive |
| `input`, `textarea`, `label`, `checkbox`, `switch`, `select` | Forms, way settings toggles |
| `form` | React Hook Form + Zod integration |
| `table` | DataTable base |
| `badge` | StatusChip |
| `card` | Summary sections, settings blocks |
| `dialog` | ConfirmDialog |
| `alert-dialog` | Destructive confirms (cancel order, suspend) |
| `dropdown-menu` | Row actions, user menu |
| `sheet` | Collapsed sidebar on tablet |
| `tabs` | Detail page sections |
| `separator` | Layout dividers |
| `scroll-area` | Ticket thread, wide tables |
| `sonner` or `toast` | Mutation feedback |
| `skeleton` | Loading states |
| `alert` | Banners (seller disabled on order) |
| `breadcrumb` | Detail navigation |
| `avatar` | User menu (optional) |
| `tooltip` | Icon-only buttons |
| `pagination` | List footer (or compose with Button) |

Phase 3: `calendar`, `popover` (date range), rich-text editor (TipTap — not shadcn).

### 4.2 Shell & navigation (patterns)

| Pattern | shadcn building blocks |
|---------|------------------------|
| `AppShell` | `sidebar`-style layout or custom flex + `Sheet` |
| `Sidebar` / `SidebarNavItem` | `Button` variant `ghost`, active: `bg-primary/10 text-primary` |
| `HeaderBar` | flex header + `DropdownMenu` (user menu) |
| `Breadcrumbs` | shadcn `breadcrumb` |

**Admin nav sections** (show only granted areas):

- Overview
- Commerce (Orders, Invoices*, Transactions*)
- People (Buyers, Sellers)
- Catalog (Products, Reviews*, Q&A*, Reports*)
- Content (Website*, Blog*)
- Support (Tickets)
- Insights (Analytics*, Marketing*, CRM*)
- Settings (Admins — superuser)

\*Phase 2/3 — hidden until enabled.

**Seller nav (fixed):** Overview, Analytics*, Products, Orders, Tickets*, Settings.

**Buyer nav (fixed):** Home, Profile, Addresses, Orders, Tickets.

### 4.3 Data display (patterns)

| Pattern | Implementation |
|---------|----------------|
| **`DataTable`** | **TanStack Table** (`useReactTable`) + shadcn `table` + **TanStack Query** for server `items`/`total`. Optional **`useVirtualizer`** on `<tbody>` rows when page is large. |
| **`VirtualList`** | **TanStack Virtual** (`useVirtualizer`) + slot render prop; used for non-tabular lists |
| `FilterBar` | shadcn `input`, `select`, `button`; updates route search via TanStack Router → Query key |
| `EmptyState` | shadcn `card` + typography + `button` |
| `DescriptionList` | `dl` grid or two-column `card` |
| `RelatedRecordLink` | shadcn `button` variant `link` + `lucide-react` icon |
| `SnapshotBlock` | shadcn `alert` variant + muted `card` |
| `Pagination` | shadcn `pagination`; drives TanStack Table `manualPagination` state |

#### When to use `DataTable` vs `VirtualList`

| Use `DataTable` | Use `VirtualList` |
|-----------------|-------------------|
| Orders, products, buyers, sellers | Ticket message thread |
| Tickets queue (tabular) | Address book |
| Invoices, transactions (phase 2) | Way settings rows (delivery / payment) |
| Blog post list (tabular) | Blog comment moderation (phase 3) |
| Line items on order detail (tabular) | Long status/history timelines |

**LineItemsTable** on order detail: TanStack Table without server pagination (single order’s lines); virtualize only if line count exceeds ~50.

### 4.4 Forms & commands (patterns)

| Pattern | shadcn building blocks |
|---------|------------------------|
| Field errors | `form` + `FormMessage` |
| `ConfirmDialog` | `alert-dialog` + optional `textarea` for cancel reason |
| `Toast` | `sonner` |
| `ErrorState` | `card` + `alert` for 403/404 |

### 4.5 Domain-specific patterns

| Pattern | Component(s) | Used on |
|---------|--------------|---------|
| **WaySettingsList** | **VirtualList** or short static list + shadcn `Switch`/`Input` | Seller settings; Admin seller profile |
| **TicketThread** | **VirtualList** for messages + composer + sidebar | Admin, Seller, Buyer tickets |
| **OrderTimeline** | **VirtualList** when history is long; else simple stack | Order detail (all panels) |
| **LineItemsTable** | **TanStack Table** (client data, no pagination) | Order detail |
| **PermissionMatrix** | Grid of area × actions | Admin settings (superuser) |

---

## 5. Page recipes

### 5.1 List page (tabular)

```
┌─────────────────────────────────────────────────────────┐
│ PageHeader                              [Primary action]│
├─────────────────────────────────────────────────────────┤
│ FilterBar  → validateSearch → TanStack Query key            │
├─────────────────────────────────────────────────────────┤
│ DataTable (TanStack Table + Query items; virtual tbody) │
│ …                                                       │
├─────────────────────────────────────────────────────────┤
│ Pagination (server total)                               │
└─────────────────────────────────────────────────────────┘
```

- Primary action: “Create …” only when `create` grant exists
- Row click → detail route
- Bulk bar appears only when rows selected and bulk API exists
- Loading: shadcn `Skeleton` rows inside table; use Query `isFetching` for subtle refresh indicator

### 5.1b List page (virtual)

```
┌─────────────────────────────────────────────────────────┐
│ PageHeader                                              │
├─────────────────────────────────────────────────────────┤
│ VirtualList (TanStack Virtual — only visible rows in DOM)│
│ …                                                       │
└─────────────────────────────────────────────────────────┘
```

Used for messages, addresses, settings rows, and other non-column layouts.

### 5.2 Detail page

```
┌─────────────────────────────────────────────────────────┐
│ Breadcrumbs                                             │
│ ORD-10482  [Processing]              [Advance ▼] [Cancel]│
├─────────────────────────────────────────────────────────┤
│ Summary (DescriptionList)                               │
│ Related: Buyer · Seller · Tickets                       │
├─────────────────────────────────────────────────────────┤
│ [ Line items ] [ History ] [ Invoices* ]                  │
│ … tab content …                                         │
└─────────────────────────────────────────────────────────┘
```

Commands in header use `ConfirmDialog`. Snapshots use `SnapshotBlock` (muted bg, lock icon).

### 5.3 Settings — ways list

Used for **delivery methods** and **payment ways** (identical UX). Render rows with **`VirtualList`** when the platform catalog is large; otherwise a simple mapped list is fine.

```
┌─ Delivery methods ────────────────────────────────────────┐
│ VirtualList viewport                                      │
│   [✓] Standard shipping  Label [____]  Instructions [__]│
│   [✓] Express            …                              │
│   [ ] Pickup               …                              │
│ ⚠ At least one method required (EC-SLR-04)              │
└─────────────────────────────────────────────────────────┘
```

Payment row: show hint “No card numbers or CVV” near instructions ([edge-case.md](./edge-case.md) EC-SLR-13).

### 5.4 Ticket workspace

```
┌──────────────────────────────┬──────────────────────────┐
│ Subject · #TKT-991           │ Status [Open ▼]          │
│ Thread (VirtualList)     │ Assignee                 │
│ ┌──────────────────────────┐ │ Priority                 │
│ │ visible messages only    │ │ Related order            │
│ └──────────────────────────┘ │                          │
│ [ Reply…              Send ] │                          │
└──────────────────────────────┴──────────────────────────┘
```

---

## 6. Panel-specific guidance

| Aspect | Admin | Seller | Buyer |
|--------|-------|--------|-------|
| Table density | Compact (`--text-table`) | Default | Comfortable |
| Primary actions | Many (status, assign, moderate) | Fulfillment + catalog | Self-service only |
| Nav | Grant-filtered | Fixed 5 items | Fixed 4 items |
| Accent | Blue | Green | Violet |
| Danger exposure | Refunds, suspend, remove product | Cancel split only | Cancel own order |
| Empty states | Link to create/grant help | Link to add product / enable way | Link to shop (V4) or support |

Editor role: Admin shell with **Content** section only (Website, Blog); use same components as full Admin content modules.

Support role: Admin shell with **People + Tickets**; hide Commerce mutations unless granted.

---

## 7. Content & formatting

| Type | Rule |
|------|------|
| Order / ticket ids | Mono font; copy button on detail |
| Money | Locale from config; single currency until §22 decided |
| Dates | Configured timezone; relative only in “last updated” hints |
| Empty copy | State problem + one action (“No orders yet” / “Create product”) |
| Errors | Generic for auth; specific for validation; never expose other tenant ids |
| Destructive labels | Verb-first: “Cancel order”, “Suspend seller”, not “OK” |

---

## 8. Accessibility checklist

- [ ] All inputs have visible `<label>` or `aria-label`
- [ ] Focus order: sidebar → main → dialog
- [ ] `ConfirmDialog` traps focus; Esc cancels (non-destructive default)
- [ ] Table headers use `<th scope="col">`; virtualized rows keep one `<tr>` per visible item
- [ ] Virtual lists expose scroll container with `role="list"` / `role="listitem"` where appropriate
- [ ] Keyboard: virtual lists support Home/End/PageUp/PageDown on scroll container
- [ ] Status not color-only — chip includes text label
- [ ] Icon buttons have `aria-label`
- [ ] Toast uses `role="status"` or `alert` appropriately
- [ ] Chart widgets (phase 3) paired with accessible table

---

## 9. Implementation files (reference)

When building the app ([frontend-architecture.md](./frontend-architecture.md)):

```text
src/index.css              # @import "tailwindcss" + @theme (color-system.md → shadcn vars)
components.json            # shadcn CLI
src/lib/utils.ts           # cn()
src/components/ui/         # shadcn (Button, Dialog, Table, Badge, …)
src/components/patterns/   # DataTable, VirtualList, ListPage, …
src/components/shells/     # AdminShell, SellerShell, BuyerShell
```

**Icons:** `lucide-react` (shadcn default).

Optional Storybook stories per **pattern** component for visual QA; shadcn primitives rarely need separate stories.

---

## 10. Out of scope

- Public storefront marketing layout (V4) — may import **tokens** only
- Seller white-label / per-shop themes
- Dark mode (future; structure tokens for easy add)
- Native mobile apps

---

## 11. Traceability

| Design system area | Spec source |
|--------------------|-------------|
| Three shells | ADR-001, [requirements.md](./requirements.md) §1 |
| List / detail / command | [system-design.md](./system-design.md) §9 |
| Way settings UX | [requirements.md](./requirements.md) §9.1, [use-case.md](./use-case.md) UC-SEL-SET-01 |
| Status chips | [entities.md](./entities.md) Order, Ticket |
| A11y / responsive | ADR-016 |
| Confirm + reason | [edge-case.md](./edge-case.md) EC-ORD-16, EC-TKT-03 |
