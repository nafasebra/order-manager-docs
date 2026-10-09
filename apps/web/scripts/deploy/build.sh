# INACTIVE: every command is commented intentionally.
# Linux server / workstation; run from apps/web after reviewing this script.
# set -eu
# : "${RELEASE_TAG:?Set an immutable release tag, e.g. 0.1.0-20261009-1}"
# : "${IMAGE_REPOSITORY:?Set registry/repository, e.g. registry.example.com/commerce/web}"
# case "$RELEASE_TAG" in *[!a-zA-Z0-9_.-]*|'') exit 1 ;; esac
# Build using an allowlisted tar context to avoid sending local secrets/dependencies.
# tar -cf - Dockerfile package.json package-lock.json tsconfig.json \
#   tsconfig.node.json vite.config.ts index.html src | \
#   docker build --pull --tag "$IMAGE_REPOSITORY:$RELEASE_TAG" \
#     --build-arg VITE_DEMO_MODE=true --build-arg VITE_API_BASE_URL=/api/v1 -
# docker push "$IMAGE_REPOSITORY:$RELEASE_TAG"
# Record the pushed digest; use it for server deployment rather than a mutable tag.
