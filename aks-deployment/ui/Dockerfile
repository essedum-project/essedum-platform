# Use official Node image
FROM node:18-alpine AS build

WORKDIR /ai-platform

# Copy the entire ai-platform directory into the image
COPY ai-platform/ ./


WORKDIR /ai-platform/essedum-ui/aip-app-ui

RUN yarn install

RUN npm run build-prod

WORKDIR /ai-platform/essedum-ui/shell-app-ui

RUN yarn install

RUN npm run build-prod

FROM nginx:alpine
COPY /ai-platform/aks-deployment/ui/nginx.conf /etc/nginx/nginx.conf
WORKDIR /app
RUN mkdir -p /app/ui/aip /app/ui/common

COPY --from=build /ai-platform/essedum-ui/shell-app-ui/dist/common-app /app/ui/common/
COPY --from=build /ai-platform/essedum-ui/aip-app-ui/dist/aip-app /app/ui/aip

RUN chmod -R 755 /app/ui

# Set working directory to root
WORKDIR /

# Expose ports
EXPOSE 8082 8084

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
