FROM node:22-alpine AS build
# Prisma detects OpenSSL from the `openssl` binary. Without it, Alpine gets the
# OpenSSL 1.1 engine, which cannot load on this image, and migrate deploy exits
# before the API process starts.
RUN apk add --no-cache openssl \
 && npm install -g pnpm@11.18.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @line-oa-randomizer/api... \
 && pnpm --filter @line-oa-randomizer/shared build \
 && pnpm --filter @line-oa-randomizer/api build

FROM node:22-alpine
RUN apk add --no-cache openssl \
 && npm install -g pnpm@11.18.0
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["sh", "-c", "cd /repo/apps/api && pnpm exec prisma migrate deploy && node dist/main.js"]
