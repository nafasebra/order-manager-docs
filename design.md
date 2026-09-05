# Clean Commerce — Dashboard Design System

Visual direction for the marketplace **Admin**, **Seller**, and **Buyer** panels. Maps to routes in [v1-page-architecture.md](./v1-page-architecture.md).

**Implementation:** token mapping, shadcn/ui components, and marketplace patterns live in [design-system.md](./design-system.md). **Colors:** [color-system.md](./color-system.md). **Stack:** [frontend-architecture.md](./frontend-architecture.md).

---

## 1. Design Direction

### Name

**Clean Commerce**

### Overall Personality

> Modern + Professional + Minimal + Data-focused

The goal is to create a professional store management experience that feels modern and trustworthy without becoming visually heavy or overly decorative.

The design should avoid the typical:

> Sidebar + Cards + Charts + Blue Buttons

dashboard pattern by focusing on **visual hierarchy, whitespace, typography, and data clarity**.

---

## 2. Core Design Principles

### 2.1 Clarity Over Decoration

The interface should help users understand their business quickly.

Prioritize:

- Information hierarchy
- Readability
- Whitespace
- Clear typography
- Data visualization

Avoid excessive:

- Gradients
- Shadows
- Colors
- Decorative elements
- Large rounded containers

---

### 2.2 Quiet Visual Language

The interface should feel calm and professional.

Visual emphasis should come from:

1. Typography
2. Spacing
3. Contrast
4. Layout
5. Limited use of color

Not from excessive visual effects.

---

### 2.3 Data First

The dashboard is a business management tool.

Charts, tables, KPIs, statuses, and other business information should remain the visual priority.

---

## 3. Overall Layout

The application uses a persistent sidebar with a spacious main content area.

```text
┌──────────────────────────────────────────────────────────────┐
│                          Top Bar                             │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│   Sidebar     │                                              │
│               │                 Main Content                 │
│               │                                              │
│               │                                              │
│               │                                              │
│               │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

### Layout Characteristics

- Persistent left sidebar
- Compact top bar
- Spacious content area
- Clear separation between navigation and content
- Medium information density
- Low visual noise

**Marketplace mapping:** Admin, Seller, and Buyer panels share this shell. Nav items differ per panel; layout rules stay the same.

---

## 4. Sidebar

The sidebar should be minimal and quiet rather than visually dominant.

### Example

```text
┌──────────────────┐
│  ◉ StoreName     │
│                  │
│  Search          │
│                  │
│  OVERVIEW        │
│                  │
│  ◉ Dashboard     │
│  ◫ Orders        │
│  □ Products      │
│  ♙ Customers     │
│                  │
│  MANAGEMENT      │
│                  │
│  ◇ Inventory     │
│  ◇ Promotions    │
│  ◇ Analytics     │
│                  │
│  ⚙ Settings      │
│                  │
│  ──────────────  │
│  ○ User          │
└──────────────────┘
```

### Sidebar Rules

- Use simple outline icons
- Keep navigation visually quiet
- Use subtle section labels
- Avoid excessive colors
- Avoid heavy shadows
- Keep spacing consistent
- Keep the sidebar width relatively compact

---

## 5. Navigation Active State

The active navigation item should be subtle.

```text
┌────────────────────────┐
│  ◉  Reviews            │
└────────────────────────┘
```

### Active State

Use:

- Subtle background
- Primary text
- Primary icon
- Optional subtle border

Avoid:

- Strong gradients
- Heavy colored backgrounds
- Excessive shadows

The active state should be noticeable without dominating the sidebar.

---

## 6. Top Bar

The top bar should remain simple and functional.

```text
┌──────────────────────────────────────────────────────────────┐
│                          Search...       🔔   ?   Avatar  ▾  │
└──────────────────────────────────────────────────────────────┘
```

### Recommended Elements

- Search
- Notifications
- Help
- User avatar
- User menu
- Optional "View Store" action

The top bar should not compete with the main content.

---

## 7. Page Header

Every page should follow a consistent header structure.

```text
Page Title
Page Description

                              Actions / Filters
```

### Example

```text
Dashboard

Good morning, Nafas

                              Last 30 days ▾
```

For another page:

```text
Reviews

Monitor customer feedback and respond to reviews.

                              Mar 2026 - Sep 2026 ▾
```

### Page Header Rules

- Clear page title
- Optional supporting description
- Actions and filters aligned to the right
- Consistent vertical spacing
- Strong typography hierarchy

---

## 8. Cards

Cards should be simple, flat, and structured.

### Example

```text
┌──────────────────────────────┐
│ Revenue                      │
│                              │
│ £45,000                      │
│ ↑ 7.2%   vs previous period  │
└──────────────────────────────┘
```

### Card Style

- Neutral surface
- Very subtle border
- Minimal or no shadow
- Medium border radius
- Generous padding
- Strong typography hierarchy

### Avoid

- Excessive shadows
- Strong gradients
- Large decorative icons
- Excessive rounded corners
- Too many cards on a page

---

## 9. KPI Cards

Overview pages can use a small number of high-value KPI cards.

```text
┌───────────────┐ ┌───────────────┐
│ Revenue       │ │ Orders        │
│               │ │               │
│ £45,000       │ │ 1,284         │
│ ↑ 12.4%       │ │ ↑ 8.1%        │
└───────────────┘ └───────────────┘

┌───────────────┐ ┌───────────────┐
│ Customers     │ │ Avg. Order    │
│               │ │               │
│ 8,492         │ │ £84.20        │
│ ↑ 6.2%        │ │ ↑ 3.4%        │
└───────────────┘ └───────────────┘
```

### KPI Principle

> If something is not a meaningful KPI, it should not automatically become a card.

The goal is to prevent the dashboard from becoming a collection of small boxes.

---

## 10. Charts

Charts should follow the same clean visual language as the rest of the system.

```text
┌────────────────────────────────────────────┐
│ Sales overview                  30D ▾       │
│                                            │
│ £50k ┤                         ╭──╮         │
│      │                    ╭────╯  ╰──╮      │
│ £30k ┤              ╭─────╯           ╰─    │
│      │         ╭────╯                       │
│ £10k ┤─────────╯                            │
│      └────────────────────────────────────  │
│       Mon  Tue  Wed  Thu  Fri  Sat  Sun    │
└────────────────────────────────────────────┘
```

### Chart Principles

- Subtle grid lines
- Limited colors
- One primary chart color
- Semantic colors only when necessary
- Clear labels
- Useful tooltips
- Minimal decoration

Charts should communicate information rather than decorate the dashboard.

---

## 11. Tables

Tables should be clean and readable.

```text
Recent Orders

┌─────────┬──────────────┬────────┬────────────┐
│ Order   │ Customer     │ Amount │ Status     │
├─────────┼──────────────┼────────┼────────────┤
│ #10291  │ Sarah Miller │ £120   │ Paid       │
│ #10290  │ John Smith   │ £84    │ Processing │
│ #10289  │ Emma Brown   │ £240   │ Shipped    │
└─────────┴──────────────┴────────┴────────────┘
```

### Table Rules

Avoid borders around every individual cell.

Prefer:

```text
Header
────────────────────────
Row
────────────────────────
Row
────────────────────────
Row
```

Use spacing, alignment, and subtle separators to structure the table.

---

## 12. Status System

Statuses should be standardized throughout the entire product.

### Success

```text
● Paid
```

### Warning

```text
● Pending
```

### Error

```text
● Failed
```

### Neutral

```text
● Draft
```

### Status Principles

Status colors should be semantic and consistent.

The same status should always use the same visual treatment across:

- Orders
- Payments
- Inventory
- Products
- Customers
- Reviews
- Other business workflows

Domain-specific status maps (order `processing` / `shipping`, ticket `open` / `waiting`, etc.) are defined in [design-system.md](./design-system.md) §3.

---

## 13. Typography

The primary font should be:

**Inter**

An alternative can be:

**Geist**

### Typography Hierarchy

```text
Page Title       28–32px / 600
Section Title    18–20px / 600
Card Value       24–32px / 600
Body             14–15px / 400
Secondary        13–14px / 400
Caption          12px
```

### Typography Principles

Visual hierarchy should primarily come from:

- Font size
- Font weight
- Spacing
- Contrast

Avoid relying on many different colors to create hierarchy.

---

## 14. Color System

**Mint + Teal + Navy** — full scales, semantic tokens, and light/dark values: [color-system.md](./color-system.md).

Principles (summary):

- Mostly neutral surfaces; **Teal** for restrained brand emphasis
- Semantic colors (success, warning, error, info) communicate state — see §12 and [color-system.md](./color-system.md) §13–16
- Do not let brand or semantic color dominate every UI element

Admin, Seller, and Buyer panels share one palette; panel identity is navigation and content, not separate brand colors.

---

## 15. Light Theme

Mint-backed, bright, clean, and spacious. Token values: [color-system.md](./color-system.md) §6–8.

### Visual Characteristics

- Soft Mint page background (`#F4FFFC`)
- White card surfaces
- Soft teal-tinted borders
- High readability
- Minimal shadows
- Generous whitespace

---

## 16. Dark Theme

Deep **Navy** surfaces — not inverted light mode. Token values: [color-system.md](./color-system.md) §9–12.

### Surface Hierarchy

```text
Background (#172538)
    ↓
Sidebar / secondary (#1F3045)
    ↓
Card / Surface (#27394F)
    ↓
Elevated / Modal (#30445A → #3A4E62)
```

### Dark Theme Principles

- Avoid pure black
- Avoid pure white text everywhere
- Maintain sufficient contrast
- Keep borders subtle
- Reduce visual noise
- Preserve the same hierarchy as Light Mode

Implement via shadcn `.dark` class and CSS variables — see [design-system.md](./design-system.md) §2.

---

## 17. Border Radius

Use moderate corner radii.

```text
Button       8px
Input        8px
Card         12px
Modal        16px
Avatar       50%
```

Avoid making every element extremely rounded.

The interface should feel modern without becoming overly playful.

---

## 18. Icons

Use a consistent outline icon system.

Recommended characteristics:

- Outline style
- Consistent stroke width
- Simple shapes
- Consistent size
- Neutral colors by default

A library such as **Lucide** can be used as the icon foundation.

Avoid mixing multiple icon styles.

Avoid using colorful icons throughout the navigation.

---

## 19. Visual Personality

The main visual identity should come from:

```text
Whitespace
     +
Typography
     +
Data
     +
Subtle Color
```

Not:

```text
Gradients
     +
Heavy Shadows
     +
Excessive Colors
     +
Decorative Elements
```

The interface should feel:

- Professional
- Modern
- Calm
- Reliable
- Efficient
- Data-focused

---

## 20. Design DNA

| Element | Direction |
|---|---|
| Overall | Clean Commerce |
| Layout | Sidebar + spacious content |
| Sidebar | Minimal / quiet |
| Navigation | Icon + text |
| Active State | Subtle surface |
| Header | Clean + compact |
| Typography | Strong hierarchy |
| Cards | Flat, bordered, subtle |
| Radius | 8–12px |
| Shadows | Minimal |
| Charts | Simple & data-focused |
| Tables | Clean rows |
| Icons | Outline (Lucide) |
| Light Theme | Mint + white / airy |
| Dark Theme | Navy + Slate |
| Colors | Mint + Teal + Navy ([color-system.md](./color-system.md)) |
| Personality | Professional / modern |
| Density | Medium |
| Visual Noise | Low |

---

## 21. Design Tokens

Before implementing individual components, define a shared token system.

```text
Design Tokens
│
├── Colors
│   ├── Neutral
│   ├── Brand
│   └── Semantic
│
├── Typography
│   ├── Font Family
│   ├── Font Size
│   ├── Font Weight
│   └── Line Height
│
├── Spacing
│
├── Border Radius
│
├── Borders
│
├── Shadows
│
└── Themes
    ├── Light
    └── Dark
```

All components should consume these tokens instead of defining their own values.

**Color scales and semantic tokens:** [color-system.md](./color-system.md). **Typography, radius, spacing:** below and [design-system.md](./design-system.md) §2. Concrete `@theme` / shadcn variable mapping: [design-system.md](./design-system.md) §2.

---

## 22. Core Components

The Design System should eventually define the following components:

```text
Button
Input
Select
Card
Badge
Table
Tabs
Modal
Dropdown
Sidebar
Tooltip
Avatar
Date Picker
Pagination
Toast
Chart
Empty State
Loading State
```

Each component should support both:

```text
Light Theme
Dark Theme
```

without changing its fundamental visual language.

shadcn/ui component list and marketplace patterns: [design-system.md](./design-system.md) §4.

---

## 23. Design System Philosophy

The system should be built around a simple principle:

> **Consistency without visual monotony.**

Every page should feel like part of the same product while still being able to serve a different purpose.

For example:

```text
Overview
    ↓
KPI + Charts + Tables

Orders
    ↓
Filters + Table + Status

Products
    ↓
Product Cards + Table + Inventory

Reviews
    ↓
Rating + Customer Feedback + Actions

Analytics
    ↓
Charts + Metrics + Data

Settings
    ↓
Forms + Navigation + Configuration
```

The components remain consistent, while the composition changes according to the page.

---

## 24. Final Visual Direction

The final product should combine:

**From the first reference:**

- Minimal sidebar
- Spacious layout
- Strong typography
- Quiet navigation
- Clean review/list presentation
- Subtle UI elements

**From the second reference:**

- KPI cards
- Dashboard overview
- Charts
- Data tables
- Analytics visualization
- Structured dashboard composition

The final result should **not look like a copy of either reference**.

Instead, it should establish a unified visual language:

> **Clean Commerce — Mint + Teal + Navy: a minimal, professional, data-focused store management interface with strong typography, generous whitespace, subtle surfaces, restrained Teal accent, and full Light/Dark theme support.**
