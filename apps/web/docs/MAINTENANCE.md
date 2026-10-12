# Versioning and dependency maintenance

## Inspected baseline

Inspection date: 2026-10-08. Static file inspection only; no installs, builds, tests, registry outdated checks, or vulnerability audit were run for this task.

- Standalone apps/web package: @mintcommerce/web, private, ESM, template version 0.1.0. package-lock.json root and package metadata agree; lockfileVersion is 3.
- npm is the dashboard package manager. No root package/workspace manifest or repository-level .github configuration was present. apps/shop has its own pnpm lockfile, Next.js, and React 19; it is independent and outside this release policy.
- Node engine is >=22.12.0; .nvmrc selects 22. Recommend maintaining Node 22.x >=22.12 as the current baseline, using its latest security patch. Record the exact Node and bundled npm versions actually validated in every release. No npm version is pinned yet.
- Scripts provide type checking, ESLint, Prettier, Vitest coverage, and Vite build via npm run check. There is no inspected repository-level CI/CD or automated release packaging.
- shadcn/ui components are checked-in source configured by components.json, not a versioned runtime dependency.

## Compatibility matrix

These are lockfile observations and intended maintenance boundaries, not a new certification. Exact-lockfile clean installation and QA remain release gates. Other versions allowed by manifest ranges are not automatically tested or supported.

| Area | Locked baseline | Maintenance boundary |
| --- | --- | --- |
| Node | .nvmrc: 22; engine: >=22.12.0 | Maintain 22.x >=22.12; validate Node 24 before adding support |
| React / React DOM | 18.3.1 / 18.3.1 | Keep runtime and React 18 types aligned; React 19 migration requires review |
| Vite / React plugin | 6.4.3 / 4.7.0 | Compatible declared peer ranges; upstream support review required |
| TypeScript | 5.9.3 | Review type/API changes even on minor updates |
| Vitest / coverage-v8 | 4.1.11 / 4.1.11 | Upgrade together at matching versions |
| Tailwind / Vite plugin | 4.3.3 / 4.3.3 | Keep aligned; modern-browser QA required |
| tailwind-merge | 2.6.1 | Known Tailwind-major mismatch; approval-required remediation |
| Radix Dialog | 1.1.23 | Other Radix primitives version independently; review them together |
| Recharts | 2.15.4 | Deprecated upstream branch; plan a separately validated migration |
| TanStack Query / Router / Table | 5.102.8 / 1.170.35 / 8.21.3 | Review router/navigation, cache behavior, and table regressions |
| React Hook Form / Zod | 7.88.0 / 3.25.76 | Keep resolver compatibility under review |
| Lucide React | 0.469.0 | Pre-1.0 minor changes may break icon imports |

Tailwind 4 targets modern browsers. Publish the actual tested browser versions per release, not a promise of all browsers. See [Tailwind compatibility](https://tailwindcss.com/docs/compatibility).

## Findings and approval-required work

1. The lockfile marks ESLint 9.39.5 and Recharts 2.15.4 deprecated. Recharts explicitly recommends v3; this affects chart types/behavior and needs migration and visual QA. Review ESLint's supported replacement and plugin compatibility before approving any major update.
2. tailwind-merge 2.6.1 is paired with Tailwind 4.3.3. The [upstream guidance](https://github.com/dcastil/tailwind-merge) associates the 2.6 line with Tailwind 3. Treat class-conflict behavior as a release risk. Review a compatible replacement, obtain approval for the major update, and test customized classes and all UI variants.
3. Vite 6 should be reviewed against [upstream support policy](https://vite.dev/releases). Current published support lines exclude Vite 6. Do not advertise it as upstream-maintained merely because the project builds. A supported-line migration needs approval and validation of plugins, Node requirements, and output.
4. The lockfile marks transitive whatwg-encoding 3.1.1 deprecated. Review its owning dependency; do not add a direct replacement or forced override without compatibility evidence.
5. Node >=22.12 permits untested future/odd majors. Documentation narrows the maintained baseline without changing the engine. Review Node 24 on a separate validation track before changing .nvmrc or requirements. Track [Node support dates](https://github.com/nodejs/Release).
6. Most declared dependencies use caret ranges. Keep them for now: npm ci resolves the committed lockfile. Consider tilde ranges for sensitive toolchain packages only with explicit approval and validation; narrowing ranges still changes dependency policy.
7. Registry-wide outdated/security status has not been established. An old version or deprecation is not proof of a vulnerability. Before release, review registry metadata, advisories, dependency usage, and licenses; do not rely on an earlier audit result.

No dependencies were removed: unused-package removal requires an import/configuration/usage review first.

## SemVer and compatibility contracts

package.json version is the template release authority, independent of React, Node, and library versions. Preserve 0.1.0 until a release is approved. Use PATCH for non-breaking fixes, MINOR for compatible additions, and MAJOR for customer migration. Pre-1.0 breaking changes require at least a minor bump and explicit migration notes. Adopt 1.0.0 only when ready to commit to stable customer contracts, not as an automatic metadata cleanup.

Treat exported component props, routes, config keys, CSS tokens, documented entity/adaptor shapes, persistence schemas, and installation requirements as customer-facing contracts. Evaluate actual customer impact even for dependency-only updates. Preserve published archives; never rebuild a different ZIP under the same version.

## Dependency review rules

- Commit package.json and its npm lockfile together. Do not introduce another lockfile in apps/web. Preserve the independent shop package manager.
- Customers use npm ci with the shipped lockfile. Maintainers update only named, reviewed packages in an isolated branch; never delete the lockfile to obtain newer versions.
- No automatic major upgrades, auto-merges, or force audit fixes. Review release notes, engines, peer dependencies, security findings, licenses, and source impact before accepting changes.
- Keep coupled packages aligned: React/DOM/types, Vitest/coverage, Tailwind/plugin, and form/resolver/schema integrations. Review source-owned shadcn changes as code changes.
- Lockfile changes can alter transitive dependencies without changing manifest ranges. Review both direct and transitive diffs.
- Exact Node/npm versions must be recorded after validation; do not invent a packageManager pin before testing it.

## Sustainable individual-maintainer policy

Recommended policy, subject to author approval before advertising it commercially: monthly dependency/advisory review; quarterly compatible feature/maintenance releases when useful; urgent security triage outside that cadence. Avoid promises of fixed fix times you cannot sustain. Maintain one Node LTS baseline and evaluate the next LTS separately.

After 1.0, maintain the current template major and offer security-only fixes for the previous major for six months after a successor, where upstream fixes and practical backports exist. Publish exact end dates and exceptions. Pre-1.0 releases should have an explicitly published support window rather than an implied long-term guarantee. Marketplace purchase/support terms are separate and must be confirmed by the author.

## Automation proposal (not enabled)

Dependabot is appropriate if this repository is hosted on GitHub: monthly npm reviews scoped to /apps/web, at most three open PRs, major version updates excluded, sensible coupled-package grouping, and no auto-merge. Security remediation still needs manual triage and can require an explicitly approved major upgrade.

Before activation, confirm GitHub hosting, default branch, owner/review capacity, and approval to generate automated PRs. Add least-privilege CI that runs locked installation and npm run check on the maintained Node baseline. Approve workflow triggers, action versions/pins, and permissions separately. Never give untrusted PR code marketplace publishing secrets. No CI or dependency bot was activated by this task.
