# Use official Node image - LTS version for better compatibility
FROM node:20.12.2-alpine AS build

# Install build tools and yarn
RUN apk add --no-cache python3 make g++ git yarn

WORKDIR /aip-app-ui

COPY essedum-ui/aip-app-ui/ ./

# Diagnostic info
RUN echo "=== Directory Structure ===" && \
    pwd && \
    ls -la && \
    echo "" && \
    echo "=== package.json ===" && \
    head -30 package.json && \
    echo "" && \
    echo "=== yarn version ===" && \
    yarn --version && node --version

# Clean yarn cache and set registry
RUN yarn cache clean && \
    yarn config set registry https://registry.npmjs.org/ && \
    echo "Installing dependencies with yarn..."

# Try to install with verbose output to see actual error
RUN yarn install --frozen-lockfile 2>&1 | tee /tmp/install.log || { \
    echo ""; \
    echo "=== YARN INSTALL FAILED ==="; \
    echo "Last 300 lines of install output:"; \
    tail -300 /tmp/install.log; \
    exit 1; \
  }

RUN yarn run build-prod

WORKDIR /shell-app-ui

COPY essedum-ui/shell-app-ui/ ./

# Diagnostic info
RUN echo "=== Directory Structure ===" && \
    pwd && \
    ls -la && \
    echo "" && \
    echo "=== package.json ===" && \
    head -30 package.json

# Clean yarn cache and set registry
RUN yarn cache clean && \
    yarn config set registry https://registry.npmjs.org/ && \
    echo "Installing dependencies with yarn..."

# Try to install with verbose output to see actual error
RUN yarn install --frozen-lockfile 2>&1 | tee /tmp/install-shell.log || { \
    echo ""; \
    echo "=== YARN INSTALL FAILED ==="; \
    echo "Last 300 lines of install output:"; \
    tail -300 /tmp/install-shell.log; \
    exit 1; \
  }

RUN yarn run build-prod

RUN npm run build-prod

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
 