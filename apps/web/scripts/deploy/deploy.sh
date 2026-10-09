# INACTIVE: every command is commented intentionally.
# Blue/green candidate: this never deletes or stops the existing application.
# Requires Docker and curl on the Linux server, plus an existing TLS reverse proxy.
# set -eu
# : "${IMAGE_REF:?Set registry/repository@sha256:digest}"
# : "${RELEASE_TAG:?Set release identifier}"
# : "${CANDIDATE_PORT:?Set an unused loopback port, e.g. 8082}"
# case "$RELEASE_TAG" in *[!a-zA-Z0-9_.-]*|'') exit 1 ;; esac
# CONTAINER_NAME="commerce-web-$RELEASE_TAG"
# docker pull "$IMAGE_REF"
# docker run --detach --name "$CONTAINER_NAME" --restart unless-stopped \
#   --read-only --tmpfs /tmp:rw,noexec,nosuid,size=64m \
#   --cap-drop ALL --security-opt no-new-privileges \
#   --publish "127.0.0.1:$CANDIDATE_PORT:8080" "$IMAGE_REF"
# attempt=0
# until curl --fail --silent "http://127.0.0.1:$CANDIDATE_PORT/healthz"; do
#   attempt=$((attempt + 1))
#   if [ "$attempt" -ge 30 ]; then
#     docker logs "$CONTAINER_NAME"
#     exit 1
#   fi
#   sleep 2
# done
# curl --fail --silent "http://127.0.0.1:$CANDIDATE_PORT/auth/login" > /dev/null
# MANUAL GATE: verify browser QA, then point your host reverse proxy to this port.
# Keep the previous container and proxy configuration for rollback.
# Do not automatically stop/delete containers or prune images.
