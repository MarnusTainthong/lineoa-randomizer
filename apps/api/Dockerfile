FROM node:22-alpine AS build
RUN npm install -g pnpm@11.18.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile --filter @line-oa-randomizer/api... \
 && pnpm --filter @line-oa-randomizer/shared build \
 && pnpm --filter @line-oa-randomizer/api build

FROM node:22-alpine
RUN npm install -g pnpm@11.18.0
WORKDIR /repo
ENV NODE_ENV=production
COPY --from=build /repo /repo
WORKDIR /repo/apps/api
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
