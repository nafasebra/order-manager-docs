# Clean Commerce — Web App

Mock-data frontend for the **Admin**, **Seller**, and **Buyer** panels.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v4 + shadcn/ui (hand-written components)
- TanStack Router (code-based route tree), Query, Table, Virtual
- In-memory mock API (`src/mocks/`, `src/lib/api/`)

## Setup (run locally)

```bash
cd apps/web
npm install
npm run dev
```

Open http://localhost:5173 — use the login page panel selector to sign in as Staff, Seller, or Buyer (mock accounts).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run test` | Vitest (unit tests) |
| `npm run test:ci` | Vitest with coverage |

## Mock login accounts

**Staff:** Superuser (Nafas), Support (Sarah), Editor (Emma), Admin (James)

**Seller:** GreenLeaf Shop, TechHub Store, Artisan Crafts

**Buyer:** Sarah Miller, John Smith, Emma Brown

## Routes (MVP)

- `/admin` — overview, orders, buyers, sellers, products, tickets, settings/admins
- `/seller` — overview, products CRUD, orders, settings (delivery + payment ways)
- `/account` — home, profile, addresses, orders, tickets

## Replacing mocks with a real API

Swap implementations in `src/lib/api/*` to call `/api/v1` with `fetch` + `credentials: 'include'`. Pages and hooks stay unchanged.
