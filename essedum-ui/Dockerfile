# Multi-stage build for the Essedum MFE topology: 1 host (shell) + 4 child MFEs.
# Build context is expected to be the essedum-platform/ parent directory.

FROM node:24.1.0-alpine AS build

WORKDIR /workspace

# ---- Host (shell) ----------------------------------------------------------
# Built first so its node_modules and dist exist before the MFEs compile.
# MFE tsconfigs reference ../../shell/projects/shared-lib via the
# "@essedum/shared-lib" path alias, so the shell sources must be on disk.
COPY essedum-ui/shell/ ./shell/
WORKDIR /workspace/shell
RUN npm install --legacy-peer-deps --verbose
RUN npm run build-prod

# ---- MFEs ------------------------------------------------------------------
COPY essedum-ui/modules/ /workspace/modules/

WORKDIR /workspace/modules/agent-studio
RUN npm install --legacy-peer-deps --verbose
RUN npm run build-prod

WORKDIR /workspace/modules/data-ops
RUN npm install --legacy-peer-deps --verbose
RUN npm run build-prod

WORKDIR /workspace/modules/integration-hub
RUN npm install --legacy-peer-deps --verbose
RUN npm run build-prod

WORKDIR /workspace/modules/vibe-studio
RUN npm install --legacy-peer-deps --verbose
RUN npm run build-prod


# ---- Runtime ---------------------------------------------------------------
FROM nginx:alpine

RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 3650 \
      -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/server.key \
      -out /etc/nginx/ssl/server.crt \
      -subj "/CN=localhost"

COPY essedum-ui/nginx_ui_multi.conf /etc/nginx/nginx.conf

WORKDIR /app
RUN mkdir -p /app/ui/shell \
             /app/ui/agent \
             /app/ui/data-ops \
             /app/ui/integration \
             /app/ui/vibe-studio

COPY --from=build /workspace/shell/dist/shell                            /app/ui/shell/
COPY --from=build /workspace/modules/agent-studio/dist/agent-studio       /app/ui/agent/
COPY --from=build /workspace/modules/data-ops/dist/data-ops               /app/ui/data-ops/
COPY --from=build /workspace/modules/integration-hub/dist/integration-hub /app/ui/integration/
COPY --from=build /workspace/modules/vibe-studio/dist/vibe-studio         /app/ui/vibe-studio/

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN chmod -R 755 /app/ui

WORKDIR /

# Single ingress port served by nginx_ui_multi.conf (HTTPS).
EXPOSE 8084

ENTRYPOINT ["/entrypoint.sh"]
