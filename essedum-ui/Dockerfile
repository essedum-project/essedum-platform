#Use official Node image
FROM node:24.1.0-alpine AS build

WORKDIR /aip-app-ui

COPY aip-app-ui/ ./

RUN npm install --legacy-peer-deps --verbose

RUN npm run build-prod

WORKDIR /shell-app-ui

COPY shell-app-ui/ ./

RUN npm install --legacy-peer-deps --verbose

RUN npm run build-prod

FROM nginx:alpine

# Copy nginx config
COPY nginx_ui.conf /etc/nginx/nginx.conf

# Generate self-signed SSL certificates
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout /etc/nginx/ssl/server.key \
      -out /etc/nginx/ssl/server.crt \
      -subj "/CN=localhost" && \
    apk del openssl

WORKDIR /app
RUN mkdir -p /app/ui/aip /app/ui/common

# Copy built applications from build stage
COPY --from=build /shell-app-ui/dist/common-app /app/ui/common/
COPY --from=build /aip-app-ui/dist/aip-app /app/ui/aip

RUN chmod -R 755 /app/ui

# Set proper permissions for SSL certificates
RUN chmod 644 /etc/nginx/ssl/server.crt && chmod 600 /etc/nginx/ssl/server.key

# Set working directory to root
WORKDIR /

# Expose HTTP and HTTPS ports
EXPOSE 8082 8083 8084 8085

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
