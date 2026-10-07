# LINE OA Randomizer — random draw

NestJS API + React (LIFF) app for running a gift draw inside LINE. No push messages: everything lives in LIFF.
Spec: `md-files/line-liff-randomize.md` (UI copy is Thai).

## Run locally (dev mode, no LINE needed)

```bash
pnpm install
cp .env.example .env            # set JWT_SECRET; set DEV_AUTH_ENABLED=true and VITE_DEV_AUTH=true
docker compose up -d db         # PostgreSQL
pnpm --filter @line-oa-randomizer/shared build
pnpm db:migrate                 # creates the schema (first run: name the migration "init")
pnpm db:seed                    # 10 mock users + sample room (invite code DEMO1234)
pnpm dev                        # api :3000 (Swagger at /api/docs), web :5173
```

Open `http://localhost:5173`, pick a mock user in the Dev Toolbar. Each browser tab keeps its own identity,
so open several tabs to play organizer and participants at the same time.

Other scripts: `pnpm build`, `pnpm build:api`, `pnpm build:web`, `pnpm test`, `pnpm lint`, `pnpm typecheck`.

## LINE setup

1. **Messaging API channel (OA)** → `LINE_CHANNEL_ACCESS_TOKEN`, `LINE_CHANNEL_SECRET`. Webhook URL: `https://<domain>/api/line/webhook`. Turn off OA Manager auto-reply/greeting.
2. **LINE Login channel** → `LINE_LOGIN_CHANNEL_ID`. Link the OA to it (bot link).
3. **LIFF app**: size Full, scope `profile openid`, bot link on, endpoint URL = web root → `VITE_LIFF_ID`.
4. **Rich menu**: put a 2500×843 PNG (two halves) at `apps/api/scripts/richmenu.png`, then `pnpm line:setup-richmenu`.
   Left = `/results`, right = `/manage`.
5. Local testing with real LINE: run a tunnel (ngrok / cloudflared) and use it for the webhook and LIFF endpoint URL.
   Keep the LIFF app in Development status and add testers.

## Production

`docker compose up --build` runs db, api (`prisma migrate deploy` on start) and web (nginx). The API refuses to
boot if `DEV_AUTH_ENABLED=true` with `NODE_ENV=production`.

## Deploy

The API is configured for Railway and the LIFF web app is configured for Cloudflare Pages.

### Railway API

1. Create a Railway project with a PostgreSQL service and an API service linked to this repository.
2. Set the API service root directory to `/` and deploy. `railway.json` selects `apps/api/Dockerfile`.
3. Set these API variables in Railway:
   `DATABASE_URL`, `JWT_SECRET`, `LINE_LOGIN_CHANNEL_ID`, `LINE_CHANNEL_ACCESS_TOKEN`,
   `LINE_CHANNEL_SECRET`, `LIFF_ID`, `APP_BASE_URL`, `CORS_ORIGINS`, and `NODE_ENV=production`.
4. Set `PORT` only if needed; Railway supplies it automatically. The container runs Prisma migrations before starting.
5. Add the Railway public API URL to `CORS_ORIGINS` and use `https://<api-domain>/api` as the web app's `VITE_API_URL`.

From a logged-in Railway CLI:

```bash
pnpm deploy:railway
```

The API health check is `GET /api/health`.

### Cloudflare Pages web app

Create a Pages project connected to this repository with:

- Build command: `pnpm build:web`
- Build output directory: `apps/web/dist`
- Root directory: `/`
- Environment variable: `VITE_API_URL=https://<api-domain>/api`
- Environment variable: `VITE_LIFF_ID=<your-liff-id>`

The included `apps/web/public/_redirects` keeps React Router routes working on refresh. To deploy from the
Cloudflare CLI, authenticate with `pnpm dlx wrangler login`, set `CLOUDFLARE_PROJECT_NAME` if needed, then run:

```bash
pnpm deploy:cloudflare
```

After both services are deployed, set the LIFF endpoint URL to the Cloudflare Pages domain and update
`APP_BASE_URL` and `CORS_ORIGINS` on Railway to that same URL.

## Structure

```
apps/api         NestJS (modules/, common/, prisma/)
apps/web         React + Vite + Tailwind (features/, components/ui/, lib/)
packages/shared  enums + DTO/response types used by both
docs/            architecture.md
```
