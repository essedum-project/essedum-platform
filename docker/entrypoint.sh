#!/bin/sh
set -e

# ── Replace build-time placeholders in compiled JS with runtime env vars ──

replace_placeholder() {
  placeholder="$1"
  value="$2"
  if [ -n "$value" ]; then
    find /app/ui -type f -name '*.js' -exec sed -i "s|${placeholder}|${value}|g" {} +
  fi
}

replace_placeholder '__FE_LANGFLOW_URL__'                "$FE_LANGFLOW_URL"
replace_placeholder '__FE_LANGFUSE_URL__'                "$FE_LANGFUSE_URL"
replace_placeholder '__FE_LITELLM_URL__'                 "$FE_LITELLM_URL"
replace_placeholder '__FE_SALUS_URL__'                   "$FE_SALUS_URL"
replace_placeholder '__FE_MINIO_ENDPOINT__'              "$FE_MINIO_ENDPOINT"
replace_placeholder '__FE_MINIO_BUCKET__'                "$FE_MINIO_BUCKET"
replace_placeholder '__FE_CONTAINER_REGISTRY_PREFIX__'   "$FE_CONTAINER_REGISTRY_PREFIX"
replace_placeholder '__FE_CONTAINER_REGISTRY_VERSION__'  "$FE_CONTAINER_REGISTRY_VERSION"

# ── Replace Keycloak issuer URL in auth-config.json ──
if [ -n "$KEYCLOAK_ISSUER" ]; then
  auth_config="/app/ui/shell/configs/auth-config.json"
  if [ -f "$auth_config" ] && [ -w "$auth_config" ]; then
    sed -i "s|__KEYCLOAK_ISSUER__|${KEYCLOAK_ISSUER}|g" "$auth_config"
  fi
fi

# ── Render Nginx config with runtime-configurable upstreams ──
# All frontend images (Dockerfile, Dockerfile.shell, per-MFE) copy their
# nginx config as nginx.conf.template so upstreams can be overridden at
# runtime without rebuilding the image. The guard safely skips images
# that pre-date this pattern and still ship a static nginx.conf.
if [ -f /etc/nginx/nginx.conf.template ]; then
  : "${ESSEDUM_BACKEND_UPSTREAM:=essedum-backend-api-gateway-service:8080}"
  : "${ESSEDUM_KEYCLOAK_UPSTREAM:=keycloak:8180}"
  envsubst '${ESSEDUM_BACKEND_UPSTREAM} ${ESSEDUM_KEYCLOAK_UPSTREAM}' \
    < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
fi

# ── Start Nginx ──
exec nginx -g "daemon off;"
 