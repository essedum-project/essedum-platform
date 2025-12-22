# Use official Node image
FROM node:24.1.0-alpine AS build

WORKDIR /aip-app-ui

COPY aip-app-ui/ ./

RUN npm install --legacy-peer-deps --verbose

RUN npm run build-prod

WORKDIR /shell-app-ui

COPY shell-app-ui/ ./

RUN npm install --legacy-peer-deps --verbose

RUN npm run build-prod

COPY nginx_ui.conf /

FROM nginx:alpine

COPY /nginx_ui.conf /etc/nginx/nginx.conf

WORKDIR /app
RUN mkdir -p /app/ui/aip /app/ui/common

COPY --from=build /shell-app-ui/dist/common-app /app/ui/common/
COPY --from=build /aip-app-ui/dist/aip-app /app/ui/aip

RUN chmod -R 755 /app/ui

# Set working directory to root
WORKDIR /

# Expose ports
EXPOSE 8082 8084

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
