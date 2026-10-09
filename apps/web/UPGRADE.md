# Upgrading customized source

## Before you start

The version in package.json is the template version. Record it before upgrading. Keep the original, unmodified ZIP for every version you purchase, as well as a backup of your customized project. Git is useful locally but access to the author's repository is not required.

Do not extract a new release over your working project. Do not replace your entire src directory, environment files, branding, styles, or backend adapters.

## ZIP-to-ZIP workflow

1. Read every intervening changelog and migration entry from your installed template version to the target. If your package version was customized, identify the original archive version instead.
2. Back up source, package metadata, lockfile, environment configuration, assets, and any real application data. Keep the old deployable artifact for rollback.
3. Extract the new ZIP to a separate directory. Verify its template version, compatibility matrix, file inventory, and published checksum.
4. Compare three directories in a local diff/merge tool: original old template (base), your customized project (local), and new template (incoming). Apply the author's changes to your local copy and resolve overlapping edits manually.
5. Pay special attention to shells/layouts, src/index.css, src/config/template.ts, components/ui, routes, entity types, API adapters, and permissions. shadcn components are source you own; do not regenerate them wholesale.
6. Review added, renamed, and deleted paths in the release inventory. Remove obsolete files only after checking your imports and custom functionality. Read any storage/schema migration instructions before opening the upgraded app against existing data.
7. Merge package.json intentionally. With no custom dependencies, adopt the new package.json and lockfile together. With custom dependencies, reconcile the manifests and regenerate one npm lockfile in a disposable integration copy using the release's documented Node/npm versions. Never hand-merge dependency resolution entries or mix an old lockfile with a new manifest.
8. In that copy, perform the documented clean install, automated checks, browser QA, and your own integration tests. These steps are customer instructions, not checks performed by this document.
9. Deploy to staging first, verify deep links, tenant isolation, auth, and custom integrations, then deploy with a rollback plan.

If the original old ZIP is unavailable, request it through the author's support channel. A two-way comparison can help, but cannot reliably distinguish your changes from upstream changes; review each conflict rather than accepting all incoming files.

## Compatibility expectations

- PATCH: fixes without intentional changes to customer integration contracts.
- MINOR: compatible features/components; existing routes, exports, entity contracts, config keys, and design tokens remain usable.
- MAJOR: migration required, including removed contracts, incompatible data shapes, changed tooling requirements, or substantial styling behavior changes.
- Pre-1.0: incompatibilities require at least a minor release plus explicit migration notes. Do not assume pre-1.0 minors are drop-in replacements.

A dependency major does not automatically dictate the template major: assess customer impact. Conversely, a breaking source change can require a template major without any dependency change. Dependency upgrades are never implicitly authorized by these instructions.

## Current migration status

No new template release or version-to-version migration is declared by this maintenance setup. Version remains 0.1.0 and dependencies are unchanged. The maintenance documents introduce no application migration.

## Required entry for future migrations

Each release must provide: source and target template versions, supported toolchain, changed/renamed/deleted files, affected contracts, before/after examples for breaking changes, ordered manual steps, persisted-data handling, validation steps, and rollback limitations. Keep older entries available for customers who skip releases.

The current mock store uses versioned browser-storage keys. Do not silently discard customized or real data as an upgrade mechanism. Resetting demo data is destructive to demo edits and is not a substitute for migrating production data. Where a schema changes, document a migration or an explicitly approved reset with a backup warning.
