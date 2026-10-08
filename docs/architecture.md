# Architecture

## Modules (apps/api/src/modules)

| Module | Responsibility |
|---|---|
| `auth` | Verifies the LIFF ID token with LINE, upserts the `User`, issues a JWT |
| `events` | Room CRUD, invite preview/join, close (PDPA wipe) |
| `participants` | List, add guests by name, remove (before draw) |
| `rules` | Rule CRUD (organizer only) |
| `feasibility` | Dry-run after every participant/rule change; stores `OK / INFEASIBLE / TOO_FEW_PARTICIPANTS` |
| `draw` | Transactional draw / re-draw; pure engine in `draw/engine/` |
| `results` | My result, history, ack, guest results, all results (visibility rules) |
| `line` | Webhook: follow + keyword replies only. **No push API anywhere.** |
| `dev` | Mock users + `/dev/*`; registered only when `DEV_AUTH_ENABLED=true` |

Layers: Controller (HTTP only) → Service (business logic) → Prisma.

## Draw flow

1. Organizer opens `/manage/:id/draw` (button disabled unless cached feasibility is `OK`).
2. `POST /events/:id/draw` (or `/redraw`) opens a transaction and locks the event row (`FOR UPDATE`).
3. Status is checked (`OPEN` for draw, `DRAWN` for re-draw) and feasibility is re-computed inside the transaction.
4. `findAssignments` returns a random valid permutation: Kuhn matching proves feasibility, randomized
   backtracking (most constrained giver first, `crypto.randomInt`) picks the result, with a randomized
   matching fallback if backtracking exceeds its step budget.
5. A `DrawRound` (version +1) and new `Assignment` rows are inserted. Old rounds are never edited or deleted.

## Rich Menu → LIFF result flow

There are two LIFF apps on one web origin. The results LIFF opens `/results`; the manage LIFF opens `/manage`.
`/` is a landing page for those two menus (and, in dev, the mock-user picker).

A rich menu created in LINE Official Account Manager opens `https://liff.line.me/<LIFF_ID_RESULTS>/results` → LIFF opens the web app → `liff.getIDToken()` →
`POST /auth/line` → JWT → `/results` lists rooms → `/results/:id` shows the envelope card. Opening it calls
`POST /events/:id/my-result/ack`, which sets `lastSeenDrawVersion`. The manage button uses `LIFF_ID_MANAGE` and `/manage`.

## Result visibility

| Data | Who can read it |
|---|---|
| Own current / past results | The participant themself |
| Guests' results (`guest-results`) | The organizer who added those guests (guests only) |
| Everyone's results (`all-results`) | Any participant, only when `allowViewAllResults = true` |

Every endpoint checks membership first; non-members get 404. Logs never contain draw results.

## Re-draw banner

`hasNewDraw = lastSeenDrawVersion > 0 && lastSeenDrawVersion < currentDrawVersion`. The list page shows a
"จับใหม่" badge from the same flag.
