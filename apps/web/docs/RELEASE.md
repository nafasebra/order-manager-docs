# Marketplace release checklist

This is a manual, repeatable release process, not an automated publisher. No release, upload, version bump, install, or validation is performed by adding this file.

## 1. Scope and dependency compatibility

- [ ] Choose the source and target template versions; confirm whether this is the first published release. Keep template SemVer separate from library versions.
- [ ] Read MAINTENANCE.md findings. Review direct/transitive dependency changes, upstream support, deprecations, advisories, licenses, engines, and peer ranges. Obtain explicit approval before major dependency changes.
- [ ] Confirm npm is used only within apps/web; do not alter the independent shop lockfile.
- [ ] Decide and document the supported Node/npm and browser versions. Record exact versions used for validation. Investigate any mismatch instead of ignoring peer warnings.
- [ ] Assess changes to customer contracts, styling, storage, backend adapters, and tooling requirements. Schedule breaking changes for the appropriate release with migration instructions.

## 2. Validation (to be run by the maintainer)

- [ ] In an isolated clean copy, install using npm ci and the shipped lockfile. Do not regenerate it during customer-install validation.
- [ ] Run npm run check; retain output for type checks, lint, formatting, tests/coverage, and production build. Include new root Markdown documents in a separate formatting review because the current formatting script only includes README.md and docs.
- [ ] Review security advisories/audit findings for both runtime and development dependencies; triage exposure rather than automatically applying forced fixes.
- [ ] Complete docs/QA.md, including all roles, permissions, tenant boundaries, data persistence/reset, keyboard interactions, charts, themes, responsive layouts, and deployed deep links.
- [ ] Validate the supported Node baseline and proposed new LTS separately. Do not claim support for a version from engine metadata alone.
- [ ] Test an upgrade from the previous published ZIP and the oldest still-supported version with representative custom branding/styles/API changes. Verify rollback.

## 3. Version and release notes

- [ ] Update apps/web/package.json version and the lockfile's top-level version and packages[""].version together using the established npm release tooling. Review the diff; dependency resolutions must not drift in a metadata-only bump.
- [ ] Move approved Unreleased entries to a dated CHANGELOG.md release. Never fabricate historical release dates.
- [ ] Add UPGRADE.md instructions for every affected source version, especially breaking contracts and storage migrations. Include unchanged-contract notes for patch/minor releases.
- [ ] Generate a changed/added/renamed/deleted-file inventory against the previous release. Include dependency version deltas and configuration changes. Retain prior changelogs and migration instructions.

## 4. Marketplace ZIP

- [ ] Stage a clean, allowlisted copy rather than zipping the working repository. Suggested archive: mintcommerce-web-X.Y.Z.zip with source/ (the standalone apps/web project), documentation/, and release-manifest.json. Explain that customers run installation inside source/.
- [ ] Include source, public assets when present, index.html, package.json, package-lock.json, all required build/type/lint/test configuration, .nvmrc, .env.example, tests, README, CHANGELOG, UPGRADE, and docs. Include approved license/support information and required third-party notices.
- [ ] Exclude node_modules, .git, dist unless intentionally supplied as a separately labeled preview, coverage, caches, logs, local environment files/secrets, customer data, and unrelated apps/shop or internal files.
- [ ] Check screenshots, fonts, icons, and other assets for redistribution rights. Confirm marketplace requirements and the author's chosen licensing/support terms; this process does not assign a license.
- [ ] Supply release metadata: template version, actual release date, exact validated Node/npm versions, direct dependency baseline, tested browsers, previous supported versions, file inventory, known issues, and migration references. Include SHA-256 hashes for shipped files; publish the final ZIP checksum alongside the download, not inside an archive that hashes itself.
- [ ] Extract the final ZIP into a fresh directory with no repository access. Follow only its README; perform clean install, checks, preview, and deep-link tests. Verify no essential dotfiles/configs were omitted.

## 5. Publication and support

- [ ] Require author approval before tagging, uploading, or publishing. Use an immutable versioned archive and keep the exact artifact and validation record.
- [ ] Publish release notes, compatibility changes, known issues, upgrade guidance, and support/end-of-support dates alongside the download.
- [ ] Retain original previous-version ZIPs securely for customer three-way merges and rollback; do not require access to the author's Git repository.
- [ ] If a shipped regression is found, publish a new patch and affected-version notice. Do not silently replace the same-version ZIP. Review whether rollback can safely read newer persisted data.

## Current setup status

Documentation and maintenance policy only. Package version remains 0.1.0; dependency versions, lockfile, Node configuration, application source, and CI are unchanged. All checklist validation remains pending for the next release. Dependabot/CI activation and dependency-major remediation require separate approval.
