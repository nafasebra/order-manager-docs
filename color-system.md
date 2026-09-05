# Clean Commerce — Color System

Canonical palette for the marketplace **Admin**, **Seller**, and **Buyer** panels. Part of **Clean Commerce** — layout, components, and personality: [design.md](./design.md). **shadcn / Tailwind mapping:** [design-system.md](./design-system.md) §2.

---

## 1. Color Direction

### Visual Mood

> Fresh · Calm · Modern · Professional · Soft

### Core Palette

```text
Mint        → Background
Teal        → Brand / Primary
Navy        → Dark surfaces
Slate       → Secondary dark surfaces
White       → Light surfaces
```

The primary color is **Teal**, but it should be used selectively rather than dominating the entire interface.

---

## 2. Primary — Teal

```text
Primary 50    #ECFEF9
Primary 100   #D5F8EE
Primary 200   #B2EBDD
Primary 300   #7DDBC7
Primary 400   #48C7AF
Primary 500   #20B59A
Primary 600   #0F9985
Primary 700   #087A6D
Primary 800   #086158
Primary 900   #064D48
```

### Main Brand Color

```text
Primary 600
#0F9985
```

### Hover

```text
Primary 700
#087A6D
```

### Active

```text
Primary 800
#086158
```

---

## 3. Mint Background Palette

The Mint palette provides the soft, fresh background used throughout the Light theme.

```text
Mint 50     #F4FFFC
Mint 100    #E8FBF6
Mint 200    #D5F5EE
Mint 300    #BDECE2
Mint 400    #9DE0D3
Mint 500    #78D2C1
Mint 600    #52BFAE
```

### Main Background

```text
Mint 50
#F4FFFC
```

---

## 4. Dark Navy Palette

The Dark theme uses a deep Navy/Slate palette instead of pure black.

```text
Navy 50     #EEF4F7
Navy 100    #D9E4EA
Navy 200    #B9C9D3
Navy 300    #91A7B5
Navy 400    #6B8292
Navy 500    #4F6577
Navy 600    #3A4E62
Navy 700    #30445A
Navy 800    #27394F
Navy 900    #1F3045
Navy 950    #172538
```

### Main Dark Background

```text
Navy 950
#172538
```

---

## 5. Slate Palette

Slate is used to create additional surface and hierarchy levels, especially in Dark Mode.

```text
Slate 50     #F8FAFC
Slate 100    #F1F5F9
Slate 200    #E2E8F0
Slate 300    #CBD5E1
Slate 400    #94A3B8
Slate 500    #64748B
Slate 600    #475569
Slate 700    #334155
Slate 800    #29394B
Slate 900    #202F40
```

---

## 6. Light Theme

The Light theme should feel bright, clean, spacious, and soft.

### Background

```text
background:
  primary     → #F4FFFC
  secondary   → #E8FBF6
```

### Surface

```text
surface:
  default     → #FFFFFF
  subtle      → #F8FFFD
  elevated    → #FFFFFF
```

### Basic Hierarchy

```text
Page
#F4FFFC

Card
#FFFFFF
```

Cards should be visually separated from the page without relying heavily on shadows.

---

## 7. Light Theme — Text

```text
text:
  primary     → #172A32
  secondary   → #52636B
  muted       → #7C8C93
  disabled    → #AAB6BA
  inverse     → #FFFFFF
```

### Text Hierarchy

```text
Primary
  ↓
Secondary
  ↓
Muted
  ↓
Disabled
```

Avoid using pure black for primary text.

---

## 8. Light Theme — Borders

```text
border:
  subtle      → #E7F1EE
  default     → #D9E8E4
  strong      → #C5DAD5
```

Borders should remain subtle throughout the interface.

---

## 9. Dark Theme

The Dark theme should use deep Navy surfaces rather than pure black.

### Background

```text
background:
  primary     → #172538
  secondary   → #1F3045
```

### Surface

```text
surface:
  default     → #27394F
  subtle      → #202F40
  elevated    → #30445A
```

### Surface Hierarchy

```text
Page
#172538
    ↓
Card
#27394F
    ↓
Elevated Card
#30445A
    ↓
Modal / Dropdown
#3A4E62
```

Different surface brightness levels should create hierarchy naturally.

---

## 10. Dark Theme — Text

```text
text:
  primary     → #F2FAF8
  secondary   → #C1D0D2
  muted       → #8FA3A8
  disabled    → #64777D
  inverse     → #172538
```

Avoid using pure white for every piece of text.

---

## 11. Dark Theme — Borders

```text
border:
  subtle      → #2D4053
  default     → #3A4E62
  strong      → #4F6577
```

Borders should remain subtle while still providing enough separation between surfaces.

---

## 12. Dark Theme — Primary

The Primary color becomes slightly brighter in Dark Mode for better contrast against the Navy surfaces.

```text
primary:
  default     → #20B59A
  hover       → #48C7AF
  active      → #7DDBC7
  subtle      → #153F40
```

---

## 13. Success

Success should remain within the green family while being visually distinct from the Primary color.

```text
Success 50    #ECFDF5
Success 100   #D1FAE5
Success 200   #A7F3D0
Success 300   #6EE7B7
Success 400   #34D399
Success 500   #10B981
Success 600   #059669
Success 700   #047857
```

### Light Theme

```text
success:
  default     → #059669
  subtle      → #ECFDF5
```

### Dark Theme

```text
success:
  default     → #34D399
  subtle      → #123B35
```

### Typical Usage

- Paid
- Completed
- Active
- Successful payment
- Positive growth

---

## 14. Warning

Warning is used for situations that require attention.

```text
Warning 50    #FFFBEB
Warning 100   #FEF3C7
Warning 200   #FDE68A
Warning 300   #FCD34D
Warning 400   #FBBF24
Warning 500   #F59E0B
Warning 600   #D97706
Warning 700   #B45309
```

### Light Theme

```text
warning:
  default     → #D97706
  subtle      → #FFFBEB
```

### Dark Theme

```text
warning:
  default     → #FBBF24
  subtle      → #463817
```

### Typical Usage

- Pending
- Low stock
- Needs attention
- Delayed actions

---

## 15. Error

Error is used for destructive or unsuccessful states.

```text
Error 50    #FEF2F2
Error 100   #FEE2E2
Error 200   #FECACA
Error 300   #FCA5A5
Error 400   #F87171
Error 500   #EF4444
Error 600   #DC2626
Error 700   #B91C1C
```

### Light Theme

```text
error:
  default     → #DC2626
  subtle      → #FEF2F2
```

### Dark Theme

```text
error:
  default     → #F87171
  subtle      → #492426
```

### Typical Usage

- Failed payments
- Cancelled orders
- Validation errors
- Destructive actions

---

## 16. Info

Info uses a cool blue so that it remains visually distinct from the Teal Primary color.

```text
Info 50    #EFF8FF
Info 100   #DCEEFF
Info 200   #BFDEFF
Info 300   #91C9FF
Info 400   #60B3F5
Info 500   #3699E8
Info 600   #217DC7
Info 700   #1B64A3
```

---

## 17. Chart Palette

Charts should not use Teal for every data series.

Use a limited palette for data visualization:

```text
Chart 1 → #0F9985
Chart 2 → #48C7AF
Chart 3 → #60B3F5
Chart 4 → #A78BFA
Chart 5 → #F5B84B
Chart 6 → #F47C7C
```

### Chart Principle

> Use the Primary color whenever one series is enough.

Multiple colors should only be used when different categories genuinely need to be distinguished.

---

## 18. Semantic Token Structure

Components should consume semantic tokens rather than hard-coded color values.

For example, avoid:

```text
#0F9985
```

Use:

```text
color.primary
```

### Background

```text
background.primary
background.secondary
```

### Surface

```text
surface.default
surface.subtle
surface.elevated
```

### Text

```text
text.primary
text.secondary
text.muted
text.disabled
text.inverse
```

### Border

```text
border.subtle
border.default
border.strong
```

### Primary

```text
primary.default
primary.hover
primary.active
primary.subtle
```

### Semantic

```text
success.default
success.subtle

warning.default
warning.subtle

error.default
error.subtle

info.default
info.subtle
```

---

## 19. Component Color Usage

Components should use semantic tokens.

### Primary Button

```text
Background:
primary.default

Hover:
primary.hover

Text:
text.inverse
```

### Success Badge

```text
Background:
success.subtle

Text:
success.default
```

### Card

```text
Background:
surface.default

Border:
border.default
```

### Page

```text
Background:
background.primary
```

---

## 20. Light vs Dark Theme

| Token | Light | Dark |
|---|---|---|
| Background Primary | `#F4FFFC` | `#172538` |
| Background Secondary | `#E8FBF6` | `#1F3045` |
| Surface | `#FFFFFF` | `#27394F` |
| Surface Elevated | `#FFFFFF` | `#30445A` |
| Text Primary | `#172A32` | `#F2FAF8` |
| Text Secondary | `#52636B` | `#C1D0D2` |
| Text Muted | `#7C8C93` | `#8FA3A8` |
| Border | `#D9E8E4` | `#3A4E62` |
| Primary | `#0F9985` | `#20B59A` |
| Primary Hover | `#087A6D` | `#48C7AF` |
| Success | `#059669` | `#34D399` |
| Warning | `#D97706` | `#FBBF24` |
| Error | `#DC2626` | `#F87171` |
| Info | `#217DC7` | `#60B3F5` |

---

## 21. Color Architecture

```text
COLOR SYSTEM
│
├── Neutral
│   ├── 0
│   ├── 50
│   ├── 100
│   ├── ...
│   └── 950
│
├── Primary / Teal
│   ├── 50
│   ├── 100
│   ├── ...
│   └── 900
│
├── Mint
│   ├── 50
│   ├── 100
│   ├── ...
│   └── 600
│
├── Navy
│   ├── 50
│   ├── 100
│   ├── ...
│   └── 950
│
├── Slate
│   ├── 50
│   ├── 100
│   ├── ...
│   └── 900
│
├── Success
├── Warning
├── Error
└── Info
```

---

## 22. Design Principles

The color system follows these principles:

### Neutral First

Most of the UI should use neutral colors.

### Restrained Brand Color

Teal should emphasize:

- Primary actions
- Active states
- Important data
- Links
- Selected elements
- Key chart series

It should not color every component.

### Semantic Color

Colors should communicate meaning.

For example:

```text
Green  → Success
Yellow → Warning
Red    → Error
Blue   → Information
Teal   → Brand / Primary
```

### Theme Consistency

Light and Dark themes should feel like the same product.

The structure and hierarchy remain consistent while the surface and contrast values adapt to the theme.

**Marketplace panels:** Admin, Seller, and Buyer share this palette. Panel identity comes from navigation and content — not separate brand colors per panel.

---

## 23. Final Color DNA

```text
                LIGHT
                  │
          ┌───────┴───────┐
          │               │
        Mint            White
          │               │
          └───────┬───────┘
                  │
                Teal
                  │
          Brand / Primary
```

```text
                 DARK
                  │
                Navy
                  │
          ┌───────┴───────┐
          │               │
        Slate            Teal
          │               │
          └───────┬───────┘
                  │
           Accent / Data
```

### Final Direction

> **Clean Commerce — Mint + Teal + Navy**

The product should feel:

- Fresh
- Calm
- Modern
- Professional
- Soft
- Data-focused

The visual identity should come primarily from:

```text
Whitespace
    +
Typography
    +
Neutral Surfaces
    +
Teal Accent
    +
Navy Dark Mode
```

rather than:

```text
Gradients
    +
Heavy Shadows
    +
Excessive Colors
    +
Decorative Elements
```
