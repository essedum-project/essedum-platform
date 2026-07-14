# Stage 1 — Build
FROM node:23-alpine AS build

WORKDIR /app

ARG NPM_REGISTRY_URL

COPY package.json ./

RUN if [ -n "$NPM_REGISTRY_URL" ]; then npm config set registry "$NPM_REGISTRY_URL"; fi

RUN npm install

COPY . .

RUN npm run build

# Stage 2 — Serve with Nginx
FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/dist/index.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3030

CMD ["nginx", "-g", "daemon off;"]
