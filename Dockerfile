FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile --production=false

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM nginx:alpine AS app

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN addgroup -g 1001 -S nodejs && \
    adduser -S react -u 1001 && \
    chown -R react:nodejs /usr/share/nginx/html && \
    chown -R react:nodejs /var/cache/nginx && \
    chown -R react:nodejs /var/log/nginx && \
    chown -R react:nodejs /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R react:nodejs /var/run/nginx.pid

USER react

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health || exit 1
    
CMD ["nginx", "-g", "daemon off;"]

