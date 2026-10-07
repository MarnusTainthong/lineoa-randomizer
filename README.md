# Secret Santa — LINE OA random draw

NestJS API + React (LIFF) app for running a gift draw inside LINE. No push messages: everything lives in LIFF.
Spec: `md-files/line-liff-randomize.md` (UI copy is Thai).

## Run locally (dev mode, no LINE needed)

```bash
pnpm install
cp .env.example .env            # set JWT_SECRET; set DEV_AUTH_ENABLED=true and VITE_DEV_AUTH=true
docker compose up -d db         # PostgreSQL
pnpm --filter @secret-santa/shared build
pnpm db:migrate                 # creates the schema (first run: name the migration "init")
pnpm db:seed                    # 10 mock users + sample room (invite code DEMO1234)
pnpm dev                        # api :3000 (Swagger at /api/docs), web :5173
```

Open `http://localhost:5173`, pick a mock user in the Dev Toolbar. Each browser tab keeps its own identity,
so open several tabs to play organizer and participants at the same time.

Other scripts: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`.

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

## Structure

```
apps/api         NestJS (modules/, common/, prisma/)
apps/web         React + Vite + Tailwind (features/, components/ui/, lib/)
packages/shared  enums + DTO/response types used by both
docs/            architecture.md
```
