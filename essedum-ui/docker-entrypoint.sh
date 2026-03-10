#!/bin/sh
set -e

# =============================================================================
# 1. Generate nginx config from template
# =============================================================================
envsubst '${BACKEND_SERVICE_URL} ${LANGFLOW_SERVICE_URL} ${LANGFUSE_SERVICE_URL} ${LITELLM_SERVICE_URL}' \
  < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

echo "[entrypoint] Nginx config generated:"
echo "  BACKEND_SERVICE_URL=${BACKEND_SERVICE_URL}"
echo "  LANGFLOW_SERVICE_URL=${LANGFLOW_SERVICE_URL}"
echo "  LANGFUSE_SERVICE_URL=${LANGFUSE_SERVICE_URL}"
echo "  LITELLM_SERVICE_URL=${LITELLM_SERVICE_URL}"

# =============================================================================
# 2. Generate runtime auth-config.json for shell-app (if template exists)
# =============================================================================
AUTH_TEMPLATE="/config-templates/auth-config.json.template"
AUTH_TARGET="/app/ui/common/configs/auth-config.json"

if [ -f "$AUTH_TEMPLATE" ]; then
  envsubst '${FE_AUTH_REQUIRED} ${FE_AUTH_ISSUER} ${FE_AUTH_CLIENT_ID} ${FE_AUTH_SCOPE}' \
    < "$AUTH_TEMPLATE" > "$AUTH_TARGET"
  echo "[entrypoint] auth-config.json generated:"
  echo "  FE_AUTH_ISSUER=${FE_AUTH_ISSUER}"
  echo "  FE_AUTH_CLIENT_ID=${FE_AUTH_CLIENT_ID}"
fi

# =============================================================================
# 3. Generate runtime pipeline-config.json for aip-app (if template exists)
# =============================================================================
PIPELINE_TEMPLATE="/config-templates/pipeline-config.json.template"
PIPELINE_TARGET="/app/ui/aip/assets/agent-pipeline/pipeline-config.json"

if [ -f "$PIPELINE_TEMPLATE" ] && [ -d "$(dirname "$PIPELINE_TARGET")" ]; then
  envsubst '${FE_MINIO_ENDPOINT} ${FE_MINIO_BUCKET} ${FE_CONTAINER_REGISTRY_PREFIX} ${FE_CONTAINER_REGISTRY_VERSION}' \
    < "$PIPELINE_TEMPLATE" > "$PIPELINE_TARGET"
  echo "[entrypoint] pipeline-config.json generated:"
  echo "  FE_MINIO_ENDPOINT=${FE_MINIO_ENDPOINT}"
fi

# =============================================================================
# 4. Replace URL placeholders in built JS bundles
# =============================================================================
if [ -n "${FE_LANGFLOW_URL}" ]; then
  # The Angular build bakes the default langflowUrl into main*.js
  # Replace it at container startup with the runtime value
  find /app/ui/aip -name '*.js' -exec \
    sed -i "s|__LANGFLOW_URL_PLACEHOLDER__|${FE_LANGFLOW_URL}|g" {} +
  echo "[entrypoint] langflowUrl replaced in JS bundles: ${FE_LANGFLOW_URL}"
fi

if [ -n "${FE_LANGFUSE_URL}" ]; then
  find /app/ui/aip -name '*.js' -exec \
    sed -i "s|__LANGFUSE_URL_PLACEHOLDER__|${FE_LANGFUSE_URL}|g" {} +
  echo "[entrypoint] langfuseUrl replaced in JS bundles: ${FE_LANGFUSE_URL}"
fi

if [ -n "${FE_LITELLM_URL}" ]; then
  find /app/ui/aip -name '*.js' -exec \
    sed -i "s|__LITELLM_URL_PLACEHOLDER__|${FE_LITELLM_URL}|g" {} +
  echo "[entrypoint] litellmUrl replaced in JS bundles: ${FE_LITELLM_URL}"
fi

exec nginx -g 'daemon off;'
