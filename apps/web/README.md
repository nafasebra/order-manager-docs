# Clean Commerce dashboard template

A standalone React dashboard with Admin, Support, Editor, Seller, and Buyer accounts. All business data is mock data. No backend is required.

## Run

Use Node 22.12+ and npm. The committed npm lockfile defines dependency versions.

```sh
cd apps/web
npm ci
npm run dev
```

Choose an account on the home page, or open `/auth/login?panel=staff`, `?panel=seller`, or `?panel=buyer`.

| Account | Email               | Password    |
| ------- | ------------------- | ----------- |
| Admin   | admin@example.com   | Admin123!   |
| Support | support@example.com | Support123! |
| Editor  | editor@example.com  | Editor123!  |
| Seller  | seller1@example.com | Seller123!  |
| Buyer   | buyer1@example.com  | Buyer123!   |

The staff-account selector fills Support and Editor credentials. Support reads orders, buyers, and stores and responds to tickets. Editor manages website content and blog moderation.

## Demo behavior

Sessions and successful mock changes survive refresh. The account menu switches accounts and resets the dataset. Reset restores records, coupons, policies, role templates, and alert settings, then signs out. Theme preference is retained.

Seed dates are relative to dataset generation; saved records retain their dates. Reset to get fresh samples. Each browser has its own dataset.

## Working features

- Seller product management and stock updates; admin inspection and listing restrictions.
- Category creation/editing/deletion with duplicate checks and protection for populated categories.
- Admin order fulfillment/cancellation, buyer cancellation of processing orders, seller order list/detail and single-store fulfillment. Staff coordinate multi-store fulfillment.
- Shared shop profile, workplace address, payment instructions, and delivery settings.
- Ticket replies/status updates, seller ownership checks, and internal-message filtering.
- Content editing, moderation, staff creation/permissions, role presets, seller creation, buyer profiles and addresses.
- Mock invoices, voiding, and one refund per completed payment.
- Coupons, policies, tenant restrictions, campaign lifecycle, and activity histories.
- Reporting, record-based health checks, and configurable stock alerts.

## Deliberately illustrative

Payments, email/social delivery, shipping labels, and background monitoring are not executed. Checkout coupon enforcement and fraud flags are examples. Demo passwords are fixed, so password change is disabled. Service metrics are labeled examples; staff 2FA is unknown. Some analytics are sample series rather than accounting records.

The sibling `apps/shop` is independent and is not synchronized by this dashboard.

## Customize

- `src/config/template.ts`: brand, currency, locale, timezone, low-stock default, optional modules.
- `src/index.css`: light/dark semantic tokens, typography, layout.
- `src/components/shells`: navigation and layout.
- `src/mocks/fixtures.ts`: seed records and reports.
- `.env.example`: environment options; demo mode defaults to enabled.

See [integration and customization](./docs/TEMPLATE.md).

## Checks

```sh
npm run typecheck
npm run lint
npm run format:check
npm run test:ci
npm run build
```

`npm run check` runs all checks. `npm run format` applies shared formatting. Regression tests cover auth, ownership, mutations, storage/reset, sorting, and search. Coverage is written to `coverage/`.

Complete [browser QA](./docs/QA.md) before distribution.

## Deploy

Run `npm run build` and deploy `dist/` to a static host. `npm run preview` serves a local production preview. Configure dashboard routes to serve `index.html`, while missing assets return 404. An Nginx SPA route rule is `try_files $uri $uri/ /index.html;`.

The development API proxy forwards `/api/v1` to `http://localhost:3000`. Demo login does not call it.
