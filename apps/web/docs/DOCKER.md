# Docker and server deployment

Only Dockerfile is active. The .dockerignore patterns and all shell-script commands are intentionally commented at the author's request. No image was built, dependency installed, script run, or server deployment performed. These files require validation before use.

The Dockerfile builds apps/web with Node 22 and npm ci, then serves only dist through Nginx as an unprivileged user on port 8080. It includes SPA deep-link fallback, /healthz, immutable asset caching, and no-cache index.html. It does not run a backend, transfer money, or terminate TLS. /api/ returns 404 intentionally; configure your external reverse proxy for a real backend when adapters are implemented.

## Before activation

- Run the existing checks and browser QA separately; Docker's build step does not replace lint/tests or security review.
- Review and uncomment only the desired scripts. Do not blindly strip every comment: explanatory text and placeholders are not shell commands.
- The inactive .dockerignore does not exclude secrets or node_modules from a directory context. Either activate its patterns before a directory build, or use the allowlisted tar pipeline in build.sh. The latter sends only build-required files to Docker.
- Run the tar pipeline from apps/web. No public directory currently exists; if one is added later, include it in both Dockerfile COPY and the allowlist.
- Base image tags are mutable. After compatibility/security validation, pin approved image digests for reproducible commercial release builds. No unverified digest is invented here.
- VITE_DEMO_MODE and VITE_API_BASE_URL are build-time public values. Passing environment variables when starting Nginx does not alter compiled JavaScript. Never pass secrets as Vite build arguments. Disabling demo mode does not implement missing backend adapters.

## Suggested server flow

Build and push a versioned image, record its digest, then deploy that digest as a candidate on an unused loopback port. Verify health, login, deep links, assets, and role/tenant behavior. After approval, switch the existing TLS reverse proxy to the candidate port. Retain the previous container, digest, and proxy configuration for rollback.

The commented deploy script deliberately performs no automatic proxy rewrite, old-container removal, or image pruning. Host-specific proxy/domain/TLS configuration must be supplied and reviewed separately. Registry credentials belong in the server's secure login/credential mechanism, never in scripts or the image.

For rollback, verify the retained previous container, restore the prior reverse-proxy configuration, validate it, and reload. Consider browser-persisted data compatibility before rolling back application versions. A healthy static server alone does not prove application correctness.

Templates: scripts/deploy/build.sh, deploy.sh, rollback.sh. All remain inactive until deliberately reviewed and uncommented.

## Inactive YAML templates

`apps/web/compose.yaml` provides a commented server container configuration. The repository's `.github/workflow-templates/web-ci.yaml` and `web-image.yaml` provide commented check and manual image-publication proposals. They are intentionally outside `.github/workflows`, so GitHub will not discover or execute them. No server-deployment workflow is enabled.

Before activation, review action support and immutable SHA pins, environment approvals, permissions, image visibility, and release policy. Move only a reviewed, uncommented workflow copy into `.github/workflows`. The image workflow proposes manual publication, not SSH deployment. Merely adding these templates does not run checks, publish images, or deploy anything.
