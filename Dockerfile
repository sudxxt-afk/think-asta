# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Also the image the one-shot migrate service runs (prisma db push + seed)
FROM deps AS tools
COPY . .
RUN npx prisma generate

FROM tools AS build
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx next build

FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 UPLOAD_DIR=/data/uploads
RUN useradd -r -u 1001 app && mkdir -p /data/uploads && chown -R app /data
COPY --from=build --chown=app /app/.next/standalone ./
COPY --from=build --chown=app /app/.next/static ./.next/static
USER app
EXPOSE 3000
CMD ["node", "server.js"]
