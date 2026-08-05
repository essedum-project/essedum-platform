# Stage 1 — Build
FROM node:23-alpine AS build

ARG NPM_REGISTRY_URL
ARG NPM_AUTH_TOKEN
ARG NPM_ALWAYS_AUTH=true

# Configure Artifactory npm registry when credentials are supplied
RUN if [ -n "${NPM_REGISTRY_URL}" ] && [ -n "${NPM_AUTH_TOKEN}" ]; then \
      REGISTRY_HOST=$(echo "${NPM_REGISTRY_URL}" | sed 's|https:||'); \
      echo "registry=${NPM_REGISTRY_URL}" >> /root/.npmrc && \
      echo "${REGISTRY_HOST}:_authToken=${NPM_AUTH_TOKEN}" >> /root/.npmrc && \
      echo "always-auth=${NPM_ALWAYS_AUTH}" >> /root/.npmrc && \
      echo "strict-ssl=false" >> /root/.npmrc; \
    fi

WORKDIR /app

COPY package.json ./

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
