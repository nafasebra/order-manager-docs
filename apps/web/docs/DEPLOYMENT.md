# Server deployment guide

This guide covers the standalone `apps/web` dashboard on a Linux server using Docker and an HTTPS reverse proxy. It does not deploy the independent `apps/shop` application.

Only the Dockerfile is active. Shell commands, Compose configuration, workflow templates, and .dockerignore patterns are intentionally commented. Nothing has been built, published, or deployed by adding these files. All command examples below remain commented as well.

## 1. Requirements

- A Linux server with Docker and authorized access to manage containers.
- `curl` for health checks and `tar` for an allowlisted build context.
- A domain pointing to the server and an existing reverse proxy, such as Nginx or Caddy, with valid HTTPS.
- A container registry and secure authentication mechanism.
- Capacity for both the candidate and previous release. Measure build memory and disk requirements before deployment.
- For application validation: Node 22.x, at least 22.12, and npm using the committed lockfile.

The container listens on port 8080. Bind its host port to loopback; expose the application through the HTTPS reverse proxy, not directly to the internet.

## 2. Files and activation status

Paths are relative to the repository root.

| File | Purpose | Status |
| --- | --- | --- |
| `apps/web/Dockerfile` | Node build stage and unprivileged Nginx runtime | Active definition; unvalidated |
| `apps/web/.dockerignore` | Exclude local files from a directory build context | Commented; inactive |
| `apps/web/compose.yaml` | Server container configuration | Commented; inactive |
| `apps/web/scripts/deploy/build.sh` | Build and push a versioned image | Commented; inactive |
| `apps/web/scripts/deploy/deploy.sh` | Start and check a candidate release | Commented; inactive |
| `apps/web/scripts/deploy/rollback.sh` | Verify the retained previous release | Commented; inactive |
| `.github/workflow-templates/web-ci.yaml` | Pull-request/manual application checks | Commented; outside workflow discovery |
| `.github/workflow-templates/web-image.yaml` | Manual image publication proposal | Commented; outside workflow discovery |

Uncomment only reviewed configuration or command lines. Do not automatically remove every `#`: explanatory prose is not executable code. Compose and direct Docker scripts are alternative deployment approaches, not steps to run on top of each other.

## 3. Prepare a release

1. Review the changelog and migration instructions.
2. Record the template version, source identifier, and exact validated Node/npm versions.
3. Perform a clean locked install, automated checks, and [browser QA](./QA.md) in an isolated copy.
4. Keep local environment files, credentials, customer data, and development dependencies out of the build context.
5. Choose a unique image release tag; do not rely on `latest` for traceable deployments.

These are maintainer instructions, not checks already performed:

```sh
# cd apps/web
# npm ci
# npm run check
```

The commented .dockerignore currently excludes nothing. Before building from a directory context, activate its reviewed patterns. Alternatively, use the allowlisted tar pipeline in build.sh, which sends only build-required files. Selective Dockerfile COPY instructions alone do not stop sensitive files from entering a directory build context.

## 4. Build-time configuration

`VITE_DEMO_MODE` and `VITE_API_BASE_URL` are compiled into browser JavaScript. Changing the Nginx container's environment does not update them; build a new image instead.

- `VITE_DEMO_MODE=true`: fixed demo login and mock data.
- `VITE_API_BASE_URL=/api/v1`: API client base path; a real backend needs routing and adapters.
- `VITE_DEMO_MODE=false`: does not convert mock resource hooks into live API integrations.

Vite variables are public. Never include private keys, payment credentials, or secrets. The mock template is suitable for demonstrations, not real financial transactions.

## 5. Build and publish an image

1. Set IMAGE_REPOSITORY and RELEASE_TAG in the build environment.
2. Review and activate the allowlisted build pipeline in scripts/deploy/build.sh.
3. Authenticate securely and push the image to your registry.
4. Record the resulting digest. Deploy `repository@sha256:...`, not a mutable tag.

Replace these example values before use:

```sh
# export IMAGE_REPOSITORY=registry.example.com/commerce/web
# export RELEASE_TAG=0.1.0-20261009-1
```

The Dockerfile uses mutable Node and Nginx image tags. After security and compatibility validation, pin approved digests for reproducible release builds. The build architecture must match the server; multi-architecture publishing is not implemented in these templates.

No public directory currently exists. If one is added, include it in both Dockerfile COPY and the build-context allowlist.

## 6. Start a candidate on the server

Use the reviewed deploy.sh commands:

1. Authenticate to the registry without storing credentials in source or scripts.
2. Set IMAGE_REF to the approved digest.
3. Choose a unique RELEASE_TAG and an unused loopback CANDIDATE_PORT, for example 8082.
4. Start the candidate container and wait for its health endpoint.
5. Inspect logs and verify the login URL, deep links, assets, and application behavior.

The script does not stop or delete the previous release. A failed candidate also remains available for diagnosis. Remove containers only after identifying and approving the exact target.

The runtime uses a read-only filesystem, temporary /tmp storage, dropped capabilities, and no-new-privileges. These settings still need an actual container build/run validation.

## 7. Compose alternative

The commented compose.yaml provides the same static-service deployment approach. After deliberate activation, supply IMAGE_REF as a digest and WEB_PORT as an unused loopback port.

```sh
# cd apps/web
# export IMAGE_REF=registry.example.com/commerce/web@sha256:REPLACE_WITH_VALIDATED_DIGEST
# export WEB_PORT=8082
# docker compose -p commerce-candidate -f compose.yaml config
# docker compose -p commerce-candidate -f compose.yaml up -d
```

The digest above is a placeholder, not a usable image reference. Use separate Compose project names and ports for old and candidate releases if keeping both alive. Reusing the same project/service replaces its container and does not provide the candidate-isolation strategy described here. Compose does not configure TLS, route traffic, or automatically prove application readiness.

## 8. GitHub workflow proposals

Both YAML templates are entirely commented and stored in .github/workflow-templates, not .github/workflows. GitHub will not discover or run them in their current location.

- web-ci.yaml proposes checks on matching pull requests and manual dispatch after activation.
- web-image.yaml proposes manual checks, image building, and publication to GitHub Container Registry. It does not SSH into a server or switch production traffic.

Before activation:

1. Confirm GitHub hosting and approve the automation scope.
2. Review current action compatibility and pin approved immutable commit SHAs; the proposed action tags are not validated pins.
3. Configure the marketplace-release environment with required reviewers where available. Do not assume an environment name alone enforces approval.
4. Review contents/packages permissions, registry authentication and visibility, immutable-tag policy, and the trusted source ref.
5. Complete browser QA and migration review before approving image publication.
6. Move only a reviewed, uncommented copy into .github/workflows.

The image workflow checks for an existing release tag, but registry/authentication failures must be distinguished from a genuinely missing tag before publication. It is not a transactional guarantee of tag immutability. Never expose publishing credentials to untrusted pull-request code.

After image publication, record its digest and follow the separate server deployment process. No active workflow or automatic deployment is supplied.

## 9. Domain, HTTPS, and API routing

Point the host reverse proxy at the selected loopback port. Domain, TLS, and proxy reload configuration are server-specific and intentionally not automated.

- Validate the proxy configuration before reloading it.
- Check JavaScript, CSS, login, and deep links through the public HTTPS domain.
- Nginx provides SPA fallback to index.html; missing files under /assets/ return 404.
- /healthz indicates static-server availability, not application correctness or backend health.
- /api/ returns 404 inside the current image. Route real API requests to a backend at the host proxy and validate authentication, cookies, CORS, and TLS as appropriate.
- This guide assumes deployment at the domain root. A subpath such as /dashboard/ requires reviewing Vite base settings and router paths.

## 10. Switch traffic and acceptance checks

After candidate approval, switch the reverse proxy upstream to its loopback port. Keep the prior container and proxy configuration for rollback. Running both releases supports a controlled cutover, but does not by itself guarantee zero downtime.

- [ ] Health endpoint responds successfully.
- [ ] Login and refresh on a detail URL work.
- [ ] Admin, Support, Editor, Seller, and Buyer have the correct access.
- [ ] Seller data is isolated across tenants.
- [ ] Mock edits persist after refresh and reset behavior is understood.
- [ ] CSV download and PDF printing work in the target browsers.
- [ ] Reports preserve private staff notes and reporter scope.
- [ ] Settlement controls are correctly permission-gated and clearly mock-only.
- [ ] Responsive layouts, themes, and navigation pass QA.
- [ ] HTTPS is valid, with no mixed content.
- [ ] Browser console and service logs contain no significant errors.

## 11. Rollback

1. Retrieve the previous container/project name, image digest, port, and proxy configuration from the release record.
2. Verify that release's health using rollback.sh or the corresponding retained Compose project.
3. Restore the previous upstream configuration, validate it, and reload the proxy.
4. Check login and a detail deep link through the public domain.
5. Retain the failed release and logs for diagnosis.

Mock data lives in browser localStorage, not the container. Rolling back an image does not restore browser data. Check persisted-schema compatibility first. Resetting demo data deletes user edits and is not a substitute for production migrations or backups.

## 12. Release records and maintenance

Record the template version, publication time, source identifier, image digest, exact Node/npm versions, container or Compose project name, port, previous release, QA results, configuration changes, and approver.

Monitor health, logs, disk capacity, and restarts. Retire old images only after the rollback retention period and with explicitly identified targets. The templates intentionally omit broad deletion and prune operations.

Build, runtime, Compose, and workflow validation remain pending. No successful deployment is claimed. See [Docker notes](./DOCKER.md), [release checklist](./RELEASE.md), and [customer upgrade instructions](../UPGRADE.md) for related processes.
