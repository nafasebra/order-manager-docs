# Browser release checklist

Automated checks cover core behavior. Complete these visual checks before publishing.

- [ ] Clean install using Node 22.12+ and `npm ci`.
- [ ] Login without an API server as Admin, Support, Editor, Seller, and Buyer.
- [ ] Refresh a detail URL; confirm the session and record remain available.
- [ ] Switch accounts; verify sidebar permissions and tenant-scoped records.
- [ ] Support cannot change orders/staff permissions; Editor cannot open commerce pages.
- [ ] Save product, stock, profile, address, ticket, content, and shop settings; navigate away and refresh.
- [ ] Cancel an order; verify list/detail/buyer views update.
- [ ] Seller items and subtotals exclude other stores.
- [ ] Search/filter/sort from a later table page; verify page reset and browser back/forward.
- [ ] Change stock alerts; verify inventory and health use the threshold.
- [ ] Reset restores records, policies, role templates, and alerts.
- [ ] Verify light/dark themes, including login after refresh.
- [ ] Check 375px, 768px, and desktop widths: navigation, dialogs, charts, and table overflow.
- [ ] Use keyboard navigation for forms, menus, dialogs, sorting, and row navigation.
- [ ] Check focus, contrast, labels, dialog titles, errors, and screen-reader sort announcements.
- [ ] Check empty, loading, validation, not-found, and forbidden states.
- [ ] Test deployed deep links and SPA fallback.
- [ ] Run `npm run check`; inspect coverage and bundle output.

No live browser was available during the template-hardening pass. Complete visual checks in the target browser before distribution.
