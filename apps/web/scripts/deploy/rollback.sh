# INACTIVE: every command is commented intentionally.
# Rollback switches the host reverse proxy back to the retained previous release.
# set -eu
# : "${PREVIOUS_CONTAINER:?Set the retained previous container name}"
# : "${PREVIOUS_PORT:?Set its existing loopback port}"
# docker inspect "$PREVIOUS_CONTAINER"
# docker start "$PREVIOUS_CONTAINER"
# curl --fail --silent "http://127.0.0.1:$PREVIOUS_PORT/healthz"
# MANUAL GATE: restore the previously saved reverse-proxy configuration.
# Validate that configuration using your proxy's native validation command.
# Reload the proxy only after validation and confirm the public login/deep links.
# Keep the failed release for diagnosis. Browser data migrations may prevent rollback.
