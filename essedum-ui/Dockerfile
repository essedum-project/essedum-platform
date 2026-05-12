# Use official Node image
FROM node:22-alpine AS build

# Force yarn to use public registry, ignoring any global/system .yarnrc with Artifactory
ENV YARN_REGISTRY=https://registry.npmjs.org/
ENV NPM_CONFIG_REGISTRY=https://registry.npmjs.org/

WORKDIR /aip-app-ui

COPY essedum-ui/aip-app-ui/ ./

# Install dependencies and build aip-app with error checking
RUN yarn install --frozen-lockfile --network-timeout 600000 --registry https://registry.npmjs.org/ && \
    echo "Building aip-app..." && \
    yarn run build-prod && \
    echo "Verifying aip-app build..." && \
    test -f dist/aip-app/index.html || (echo "ERROR: aip-app/index.html not found after build" && exit 1) && \
    test -f dist/aip-app/styles.*.css || (echo "ERROR: No styles CSS file found in aip-app build" && exit 1) && \
    ls -lh dist/aip-app/styles.*.css && \
    echo "aip-app build verified successfully"

WORKDIR /shell-app-ui

COPY essedum-ui/shell-app-ui/ ./

# Install dependencies and build shell-app-ui with error checking
RUN yarn install --frozen-lockfile --network-timeout 600000 --registry https://registry.npmjs.org/ && \
    echo "Building shell-app-ui..." && \
    yarn run build-prod && \
    echo "Verifying shell-app-ui build..." && \
    test -f dist/common-app/index.html || (echo "ERROR: common-app/index.html not found after build" && exit 1) && \
    ls -lh dist/common-app/ && \
    echo "shell-app-ui build verified successfully"

COPY essedum-ui/nginx_ui.conf /

FROM nginx:alpine

RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 3650 \
      -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/server.key \
      -out /etc/nginx/ssl/server.crt \
      -subj "/CN=localhost"

COPY essedum-ui/nginx_ui.conf /etc/nginx/nginx.conf

WORKDIR /app
RUN mkdir -p /app/ui/aip /app/ui/common

COPY --from=build /shell-app-ui/dist/common-app /app/ui/common/
COPY --from=build /aip-app-ui/dist/aip-app /app/ui/aip

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

RUN chmod -R 755 /app/ui

# Set working directory to root
WORKDIR /

# Expose ports
EXPOSE 8082 8083 8084 8085 8086 8087 4000 8089

# Start with entrypoint that replaces env-var placeholders, then launches Nginx
ENTRYPOINT ["/entrypoint.sh"]
 