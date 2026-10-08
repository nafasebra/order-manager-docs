# Integration and customization

## Data boundaries

| Module                          | Responsibility                                      |
| ------------------------------- | --------------------------------------------------- |
| `config/template.ts`            | Brand, formatting, features, demo mode, API base.   |
| `lib/auth/store.ts`             | Session identity and persistence.                   |
| `lib/auth/demo.ts`              | Demo accounts and landing pages.                    |
| `lib/auth/session.ts`           | Demo login or auth API requests.                    |
| `lib/api/resources.ts`          | Queries and shared command hook.                    |
| `lib/api/productManagement.ts`  | Ownership and platform moderation.                  |
| `lib/api/sellerCommerce.ts`     | Scoped order views and subtotals.                   |
| `lib/api/sellerCoupons.ts`      | Coupons, policies, audits.                          |
| `lib/api/campaignManagement.ts` | Campaign validation and lifecycle.                  |
| `mocks/mutations.ts`            | Content, orders, billing, staff, profiles/settings. |
| `mocks/store.ts`                | Hydration, persistence, reset.                      |

Queries return snapshots; mutations update shared records. Global mutation success persists the dataset and invalidates dependent queries. Failed mutations display errors. Change the storage version when entity shapes change incompatibly.

Some selectors and summaries read fixture lookups directly. Replace these alongside their feature hooks when connecting an API.

## Backend adoption

1. Keep entity/component contracts or map API responses to them.
2. Replace mock queries and commands with `lib/api/client.ts`.
3. Replace direct fixture lookups with corresponding queries.
4. Configure `VITE_API_BASE_URL`, development proxy, and production API routing.
5. Set `VITE_DEMO_MODE=false` to disable demo auth and dataset persistence. It does **not** convert resource hooks into live API calls.
6. Restore API sessions using `fetchMe()` before protected routes and call the logout endpoint on sign-out.
7. Enforce permissions, tenant ownership, validation, coupon rules, and audit trails on the backend.
8. Replace broad demo invalidation with API-specific query invalidation.

Frontend checks and demo sessions are not an authorization boundary. Never put private API keys in Vite variables; browser build variables are public.

## Features and branding

`template.modules` controls marketing, coupons, content, and Health Center. Marketing permissions govern coupon oversight. Health Center uses the existing admin-management grant.

Set branding in config, then update `index.html` metadata and project-specific copy. Formatting uses shared currency/locale/timezone defaults. Inventory and health share the saved stock alert threshold.

## Storage

- Dataset: `clean-commerce:data:v1`
- Session: `clean-commerce:session:v1`
- Theme: `clean-commerce:theme`
- Alerts: `clean-commerce:health-settings`

Reset restores seed records, clears alert overrides, and signs out while keeping theme. Storage failures leave the current session usable and warn when changes cannot be saved.

## Distribution

Run `npm run check` and browser QA. Add screenshots, changelog, support policy, and your chosen license. No distribution license is assumed on your behalf.
