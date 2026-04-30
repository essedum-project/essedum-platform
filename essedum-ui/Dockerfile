# Use official Node image - LTS version for better compatibility
FROM node:20.12.2-alpine AS build

# Install build tools
RUN apk add --no-cache python3 make g++ git

WORKDIR /aip-app-ui

COPY essedum-ui/aip-app-ui/ ./

# Diagnostic info
RUN echo "=== AIP App UI ===" && \
    pwd && \
    ls -la && \
    echo "Node: $(node --version)" && \
    echo "NPM: $(npm --version)"

# Set npm registry and increase memory
RUN npm config set registry https://registry.npmjs.org/ && \
    npm cache clean --force

ENV NODE_OPTIONS="--max-old-space-size=16384"

# Install dependencies
RUN echo ">>> npm install aip-app-ui..." && \
    npm install 2>&1 | head -50 && npm install 2>&1 | tail -50 || { \
    echo ""; \
    echo "INSTALL FAILED - showing npm logs:"; \
    ls -la /root/.npm/_logs/ 2>/dev/null || echo "No logs dir"; \
    find /root/.npm/_logs -name "*.log" -exec tail -100 {} \; 2>/dev/null || true; \
    exit 1; \
  }

# Build the application
RUN echo ">>> Building aip-app..." && \
    npm run build-prod 2>&1 | tail -100 || { \
    echo ""; \
    echo "BUILD FAILED"; \
    exit 1; \
  }

WORKDIR /shell-app-ui

COPY essedum-ui/shell-app-ui/ ./

# Diagnostic info
RUN echo "=== Shell App UI ===" && \
    pwd && \
    ls -la && \
    echo "Node: $(node --version)" && \
    echo "NPM: $(npm --version)"

# Set npm registry
RUN npm config set registry https://registry.npmjs.org/ && \
    npm cache clean --force

# Install dependencies  
RUN echo ">>> npm install shell-app-ui..." && \
    npm install 2>&1 | head -50 && npm install 2>&1 | tail -50 || { \
    echo ""; \
    echo "INSTALL FAILED - showing npm logs:"; \
    ls -la /root/.npm/_logs/ 2>/dev/null || echo "No logs dir"; \
    find /root/.npm/_logs -name "*.log" -exec tail -100 {} \; 2>/dev/null || true; \
    exit 1; \
  }

# Build the application
RUN echo ">>> Building common-app..." && \
    npm run build-prod 2>&1 | tail -100 || { \
    echo ""; \
    echo "BUILD FAILED"; \
    exit 1; \
  }

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
 