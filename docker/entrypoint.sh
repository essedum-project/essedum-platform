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

# ── Patch nginx DNS resolver for Kubernetes (nginx resolver ignores /etc/resolv.conf search domains) ──
if [ -n "$KUBERNETES_SERVICE_HOST" ]; then
  NAMESERVER=$(awk '/^nameserver/{print $2; exit}' /etc/resolv.conf)
  K8S_NAMESPACE=$(cat /var/run/secrets/kubernetes.io/serviceaccount/namespace 2>/dev/null || echo "essedum")
  SEARCH_SUFFIX="${K8S_NAMESPACE}.svc.cluster.local"
  if [ -n "$NAMESERVER" ]; then
    sed -i "s|resolver 127.0.0.11|resolver ${NAMESERVER}|g" /etc/nginx/nginx.conf
  fi
  # Append FQDN suffix to short Kubernetes service names used in set $upstream and proxy_pass
  for svc in essedum-backend-service adk-code-builder-deployer langflow-stable langfuse-web langfuse-db litellm keycloak salus-shell; do
    sed -i "s|${svc}:|${svc}.${SEARCH_SUFFIX}:|g" /etc/nginx/nginx.conf
  done
fi

# ── Start Nginx ──
exec nginx -g "daemon off;"
 