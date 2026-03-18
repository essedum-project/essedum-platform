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
replace_placeholder '__FE_MINIO_ENDPOINT__'              "$FE_MINIO_ENDPOINT"
replace_placeholder '__FE_MINIO_BUCKET__'                "$FE_MINIO_BUCKET"
replace_placeholder '__FE_CONTAINER_REGISTRY_PREFIX__'   "$FE_CONTAINER_REGISTRY_PREFIX"
replace_placeholder '__FE_CONTAINER_REGISTRY_VERSION__'  "$FE_CONTAINER_REGISTRY_VERSION"

# ── Start Nginx ──
exec nginx -g "daemon off;"
 