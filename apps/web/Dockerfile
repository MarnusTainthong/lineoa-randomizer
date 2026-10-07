FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo
COPY . .
ARG VITE_API_URL
ARG VITE_LIFF_ID
ARG VITE_LIFF_ID_RESULTS
ARG VITE_LIFF_ID_MANAGE
ENV VITE_API_URL=$VITE_API_URL \
    VITE_LIFF_ID=$VITE_LIFF_ID \
    VITE_LIFF_ID_RESULTS=$VITE_LIFF_ID_RESULTS \
    VITE_LIFF_ID_MANAGE=$VITE_LIFF_ID_MANAGE
RUN pnpm install --frozen-lockfile --filter @line-oa-randomizer/web... \
 && pnpm --filter @line-oa-randomizer/shared build \
 && pnpm --filter @line-oa-randomizer/web build

FROM nginx:alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/apps/web/dist /usr/share/nginx/html
