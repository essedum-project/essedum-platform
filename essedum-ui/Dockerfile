# Use official Node image - LTS version for better compatibility
FROM node:20.12.2-alpine AS build

# Install build tools
RUN apk add --no-cache python3 make g++ git

WORKDIR /aip-app-ui

COPY essedum-ui/aip-app-ui/ ./

# Set npm registry and increase memory
ENV NODE_OPTIONS="--max-old-space-size=16384"

RUN npm config set registry https://registry.npmjs.org/ && \
    npm cache clean --force

# Install dependencies for aip-app-ui
RUN echo ">>> Installing aip-app-ui dependencies..." && \
    npm install

# Build aip-app-ui
RUN echo ">>> Building aip-app..." && \
    npm run build-prod

WORKDIR /shell-app-ui

COPY essedum-ui/shell-app-ui/ ./

# Install dependencies for shell-app-ui
RUN echo ">>> Installing shell-app-ui dependencies..." && \
    npm install

# Build shell-app-ui
RUN echo ">>> Building common-app..." && \
    npm run build-prod

# Copy nginx config for use in runtime stage
COPY essedum-ui/nginx_ui.conf /nginx_ui.conf
COPY docker/entrypoint.sh /entrypoint.sh

FROM nginx:alpine

RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 3650 \
      -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/server.key \
      -out /etc/nginx/ssl/server.crt \
      -subj "/CN=localhost"

# Copy nginx config
COPY --from=build /nginx_ui.conf /etc/nginx/nginx.conf

WORKDIR /app
RUN mkdir -p /app/ui/aip /app/ui/common

# Copy built artifacts
COPY --from=build /aip-app-ui/dist/aip-app /app/ui/aip
COPY --from=build /shell-app-ui/dist/common-app /app/ui/common

# Copy and configure entrypoint
COPY --from=build /entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && chmod -R 755 /app/ui

# Set working directory to root
WORKDIR /

# Expose ports
EXPOSE 8082 8083 8084 8085 8086 8087 4000 8089

# Start with entrypoint
ENTRYPOINT ["/entrypoint.sh"]
 