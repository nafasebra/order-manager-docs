# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json tsconfig.node.json vite.config.ts index.html ./
COPY src ./src
ARG VITE_DEMO_MODE=true
ARG VITE_API_BASE_URL=/api/v1
ENV VITE_DEMO_MODE=$VITE_DEMO_MODE
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:stable-alpine AS runtime
RUN cat > /etc/nginx/nginx.conf <<'NGINX'
worker_processes auto;
pid /tmp/nginx.pid;
error_log /dev/stderr warn;
events { worker_connections 1024; }
http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;
  access_log /dev/stdout;
  sendfile on;
  server_tokens off;
  client_body_temp_path /tmp/client_temp;
  proxy_temp_path /tmp/proxy_temp;
  fastcgi_temp_path /tmp/fastcgi_temp;
  uwsgi_temp_path /tmp/uwsgi_temp;
  scgi_temp_path /tmp/scgi_temp;
  server {
    listen 8080;
    root /usr/share/nginx/html;
    index index.html;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location = /healthz {
      access_log off;
      default_type text/plain;
      return 200 "ok\n";
    }
    location /api/ { return 404; }
    location /assets/ {
      try_files $uri =404;
      add_header Cache-Control "public, max-age=31536000, immutable";
      add_header X-Content-Type-Options nosniff always;
    }
    location = /index.html {
      add_header Cache-Control "no-cache";
      add_header X-Content-Type-Options nosniff always;
    }
    location / { try_files $uri $uri/ /index.html; }
  }
}
NGINX
COPY --from=build /app/dist /usr/share/nginx/html
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
