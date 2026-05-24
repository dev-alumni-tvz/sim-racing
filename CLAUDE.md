# Sim Racing Go-Cart System

## Project Overview

A go-cart racing event system with 3 frontend apps, one shared UI package, deployed on Vercel via a Turborepo monorepo.

## Repository Structure

```
gocart-monorepo/
├── apps/
│   ├── user-web/        → app.yourdomain.com      (mobile, public QR code access)
│   ├── admin-panel/     → admin.yourdomain.com    (admin's monitor 1, landscape)
│   └── user-monitor/    → monitor.yourdomain.com  (admin's monitor 2, vertical/portrait)
└── packages/
    └── ui/              → shared dumb components (no data fetching logic)
```

## Tech Stack

- **Monorepo:** Turborepo
- **Framework:** Vite + React + TypeScript (all 3 apps)
- **Styling:** CSS Modules
- **Server state:** React Query (polling every 2-3s — REST only, no WebSockets)
- **Client state:** Zustand (timer state, queue state, modals)
- **Deployment:** Vercel (3 separate Vercel projects, same GitHub repo)
- **Auth:** JWT — `POST /auth/login` returns token, stored in localStorage, sent as `Authorization: Bearer <token>` on admin API calls

## Apps

### user-web
- Mobile-first public page accessed via QR code at the venue
- User enters first name, last name, email → joins the queue
- Gets a queue number + estimated wait time shown on screen (may also be emailed by backend)
- Shows all-time leaderboard with search
- No SEO required (event-local access only)
- No authentication

### admin-panel
- Displayed on admin's primary monitor (landscape)
- Protected by JWT login — single admin account
- **Layout: 3 columns** — left (all-time leaderboard), center (timer + controls + queue), right (user-monitor iframe). No guests panel.

#### Player Management (center panel)
- Reference timer: 5-minute countdown per player, admin-controlled (not game time)
- Timer controls: -1m, -10s, -1s, PAUSE/PLAY, +1s, +10s, +1m
- **NEXT PLAYER** button: calls `POST /api/admin/session/start` with `attendeeId` of the next waiting attendee, then auto-starts the timer
- **STOP** button: calls `POST /api/admin/session/stop` — ends session normally, lap time records
- **Cancel session**: calls `DELETE /api/admin/session/{sessionId}` — aborts session, no time recorded, attendee removed from queue. `sessionId === attendeeId`.
- Clock widget shows current wall time (HH:MM:SS)
- **NEXT QUEUE IN** countdown: pure frontend calculation — seconds until the next full hour (e.g. 12:20:37 → 39:23 until 13:00). No backend data needed.

#### Queue Display (center panel — "Current Queue")
Split into two sections based on data cross-reference:

**Played** section — attendees who have driven today:
- Source: `GET /api/leaderboard` entries filtered by `completedAt` date = today, sorted by `completedAt` ascending (play order)
- Row format: `[today's play order] [Full Name] [ticketNumber] [all-time rank] [gap vs all-time fastest] [lap time]`
- Gap = `entry.bestLapMs - rank1.bestLapMs` (rank #1 from full leaderboard, all-time fastest)

**Next Up** section — attendees still waiting:
- Source: `GET /api/admin/queue` entries where `status === 'waiting'`, sorted by `queuePosition`
- Row format: `[queuePosition] [Full Name] [ticketNumber]`

Current driver (status `'driving'`) is shown in the timer widget, not in the queue list.

#### Edit Modal
Opens when admin clicks any row — context-aware:

**Queue row click** (waiting attendee):
- Editable fields: name, email, other personal details
- Buttons: **Spremi** (`PUT /api/admin/attendee/{attendeeId}`), **Skip** (`POST /api/admin/queue/{attendeeId}/skip` — sends to back of queue), **Izbriši** (`DELETE /api/admin/attendee/{attendeeId}` — removes attendee entirely)

**Leaderboard row click**:
- Editable fields: lap time override
- Buttons: **Spremi** (`PUT /api/admin/leaderboard/{attendeeId}`), **Izbriši** (`DELETE /api/admin/leaderboard/{attendeeId}` — removes entry from leaderboard, attendee remains in system)
- Note: `sessionId === attendeeId` — use `attendeeId` from leaderboard response as path param

#### Queue Reorder (drag-and-drop)
- Admin can drag waiting attendees up/down in the Next Up list to change drive order
- Queue numbers (ticketNumbers) do not change — only driving order changes
- Requires backend endpoint: `POST /api/admin/queue/swap` (see Backend Requirements)
- Optimistic update on drag, reverts on error

### user-monitor
- Displayed on admin's second monitor (big vertical/portrait screen, fullscreen browser)
- Public display — no authentication
- Features:
  - Top 3 podium with trophy icons
  - Full leaderboard (pos, name, lap time, gap)
  - Currently Driving card (queue number + name, highlighted)
  - Next Up and Previous player cards
  - Full queue display with queue numbers
  - "New slots open at" and "Free slots available" info cards
  - Queue ends countdown timer

## Data Flow

- Lap times come from the go-cart venue's timing system via API (pushed automatically after each session)
- Backend assigns the time to the player's username
- All apps poll the REST API every 2-3 seconds via React Query for live updates
- Admin timer is frontend-only (Zustand), purely a reference clock

## Shared UI Package (`packages/ui`)

Only stateless/dumb display components — no data fetching, no Zustand:

- `LeaderboardRow` / `LeaderboardTable`
- `PlayerCard` (queue number badge — orange for next, blue for current, grey for previous)
- `QueueDisplay`
- `TicketCard`
- `PodiumTop3`

Each app fetches its own data and passes it as props to shared components.

## Domain Plan

Buy one domain → 3 subdomains:
- `app.yourdomain.com` — user web
- `admin.yourdomain.com` — admin panel
- `monitor.yourdomain.com` — user monitor

## Queue Rules (from flowchart)

- Queue has a maximum size — when full, user sees "Queue full, new slots open at HH:MM"
- One attempt per email per day — duplicate email gets "Thanks for playing! Only one attempt possible"
- User can cancel their queue spot
- Queue shows: slot number, estimated wait time

## Asset Folders

Each app has two asset locations:

```
apps/<app>/
├── public/        ← static files served as-is; reference as /image.png in CSS/HTML
└── src/assets/   ← images imported in components (Vite hashes and bundles these)
```

Use `public/` for backgrounds, logos, and favicons referenced in CSS or `<img src>`.
Use `src/assets/` when importing images directly in TypeScript components.

## Figma Integration

Figma MCP is configured in `~/.claude/.mcp.json`. Claude Code can read Figma designs directly — paste a Figma file URL and Claude will extract colors, spacing, and component layouts.

## API Reference

**Base URL:** configured via `VITE_API_URL` env var (e.g. `https://api.sim-cd.com`)

**Admin auth:** `Authorization: Bearer <token>` — obtain token via `POST /auth/login`, store in localStorage.

**Bridge auth:** `X-Bridge-Api-Key` header (backend-to-backend, not used by frontend).

**Public endpoints** (user-web, user-monitor): no auth required.

---

### Authentication

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/auth/login` | none | Get admin JWT |

```json
// POST /auth/login — request
{ "username": "string", "password": "string" }

// POST /auth/login — response 200
{ "token": "string", "expiresAt": "ISO8601" }
```

---

### Admin — Queue

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/admin/queue` | Bearer | All attendees with status |
| POST | `/api/admin/queue/{attendeeId}/skip` | Bearer | Move attendee to back of queue → 204 |

```json
// GET /api/admin/queue — response 200
[
  {
    "attendeeId": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "ticketNumber": "string",
    "queuePosition": 0,
    "status": "waiting | driving | skipped"
  }
]
```

---

### Admin — Session

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/admin/session/start` | Bearer | Start session → 201 SessionResponse |
| POST | `/api/admin/session/stop` | Bearer | End session, lap time records → 200 SessionResponse |
| POST | `/api/admin/session/pause` | Bearer | Pause active session → 200 SessionResponse |
| POST | `/api/admin/session/resume` | Bearer | Resume paused session → 200 SessionResponse |
| GET | `/api/admin/session/active` | Bearer | Active session or 204 |
| GET | `/api/admin/session/{sessionId}` | Bearer | Session by id → 200 SessionResponse |
| DELETE | `/api/admin/session/{sessionId}` | Bearer | Cancel session, no time recorded → 200 SessionResponse |

```json
// POST /api/admin/session/start — request
{ "attendeeId": "uuid" }

// SessionResponse (used by start/stop/pause/resume/get/delete)
{
  "sessionId": "uuid",
  "attendeeId": "uuid",
  "attendeeFirstName": "string",
  "attendeeLastName": "string",
  "ticketNumber": "string",
  "status": "string",
  "startedAt": "ISO8601",
  "endedAt": "ISO8601 | null",
  "durationSeconds": 0,
  "bestLapMs": 0,
  "bestLapFormatted": "string",
  "lapsCompleted": 0,
  "bridgeDataReceived": false,
  "isPaused": false
}
```

---

### Admin — Attendees

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| PUT | `/api/admin/attendee/{attendeeId}` | Bearer | Edit personal details → 204 |
| DELETE | `/api/admin/attendee/{attendeeId}` | Bearer | Remove attendee entirely → 204 |

```json
// PUT /api/admin/attendee/{attendeeId} — request
{ "firstName": "string", "lastName": "string", "email": "string" }
```

---

### Admin — Leaderboard

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| PUT | `/api/admin/leaderboard/{sessionId}` | Bearer | Override lap time → 200 SessionResponse |
| DELETE | `/api/admin/leaderboard/{sessionId}` | Bearer | Remove leaderboard entry → 204 |

```json
// PUT /api/admin/leaderboard/{sessionId} — request
{ "bestLapMs": 0 }
```

Note: `sessionId === attendeeId` (one session per attendee, enforced at DB level).

---

### Public — Leaderboard

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/leaderboard` | none | All-time leaderboard sorted by fastest lap |

```json
// GET /api/leaderboard — response 200
{
  "entries": [
    {
      "rank": 0,
      "attendeeId": "uuid",
      "firstName": "string",
      "lastName": "string",
      "ticketNumber": "string",
      "bestLapMs": 0,
      "bestLapFormatted": "string",
      "completedAt": "ISO8601"
    }
  ]
}
```

---

### Public — Queue Display

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/queue/display` | none | Live queue state for user-monitor |
| GET | `/api/queue/wait-estimate` | none | Estimated wait in seconds (integer) |

```json
// GET /api/queue/display — response 200
{
  "currentDriver": { "firstName": "string", "lastName": "string", "ticketNumber": "string" },
  "nextDriver":    { "firstName": "string", "lastName": "string", "ticketNumber": "string" },
  "previousDriver":{ "firstName": "string", "lastName": "string", "ticketNumber": "string" },
  "waitingQueue": [
    { "firstName": "string", "lastName": "string", "ticketNumber": "string" }
  ],
  "waitingCount": 0,
  "estimatedWaitSeconds": 0
}
```

Note: `currentDriver`, `nextDriver`, `previousDriver` are `null` when no one is in that state. `QueueDriverDto` does **not** include `attendeeId`.

---

### Public — Registration

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/registration` | none | Register attendee → 202 |
| GET | `/api/registration/confirm?token={token}` | none | Confirm email → 200 |
| DELETE | `/api/registration/{attendeeId}` | none | Cancel queue spot → 204 |

```json
// POST /api/registration — request
{ "firstName": "string", "lastName": "string", "email": "string" }

// POST /api/registration — response 202
{
  "attendeeId": "uuid",
  "message": "string",
  "confirmationToken": "string"
}

// GET /api/registration/confirm — response 200
{
  "attendeeId": "uuid",
  "firstName": "string",
  "lastName": "string",
  "ticketNumber": "string",
  "queuePosition": 0,
  "estimatedWaitSeconds": 0
}
```

---

### Bridge (backend-to-backend only)

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/bridge/session/active` | X-Bridge-Api-Key | Active session for timing system |
| POST | `/api/bridge/session/{sessionId}/lap-data` | X-Bridge-Api-Key | Push lap data from timing system → 204 |

```json
// POST /api/bridge/session/{sessionId}/lap-data — request
{ "bestLapMs": 0, "lapsCompleted": 0 }
```

## Registration Confirmation Flow

1. User submits form → `POST /api/registration` → `202` → backend sends confirmation email
2. User clicks email link → `GET /api/registration/confirm?token=xxx` → attendee moves from `pending` to `waiting`
3. Frontend shows `ConfirmationPage` (loading → success/error)
4. Success response **must include `firstName` and `lastName`** — user may open the link on a different device/browser than they registered on, so localStorage name is not reliable
5. Frontend shows `ticketNumber` (not `queuePosition`) on the TicketCard — ticketNumber is the stable user-facing identity

## Backend Requirements (for backend dev)

### New endpoint needed: Queue Swap

```
POST /api/admin/queue/swap
Auth: Authorization: Bearer <token>
Body: { "attendeeIdA": "string", "attendeeIdB": "string" }
Response: 200 OK (no body) | 400 if either attendeeId not found or not in waiting status
```

**Purpose:** Swaps the driving order (queuePosition) of two waiting attendees. Used by admin drag-and-drop in the queue panel. Rules:
- Only works for attendees with `status === 'waiting'`
- Cannot swap a currently driving or completed attendee
- `ticketNumber` values do not change — only `queuePosition` swaps
- Both attendeeIds must belong to the same active queue

## Domain Glossary

- **Attendee** — a person who has registered via the user-web app. Has a `ticketNumber` and `attendeeId`.
- **Session** — a single driving run for an attendee. `sessionId === attendeeId` (one attempt per day enforced at DB level).
- **ticketNumber** — the visible queue number shown to the attendee (e.g. "007"). Stable string, assigned at registration, ranges 000–999, ~80 contestants expected. Does not change even if drive order is reordered. Always shown to the user as their identity token. Frontend parses it to int for `TicketCard` display.
- **queuePosition** — the driving order position within the active queue (max 15 slots). Changes when admin reorders. Not shown to users — internal ordering only.
- **Played** — an attendee who has completed a session and has a recorded lap time on the leaderboard. Determined by presence in `/api/leaderboard` with `completedAt` date = today.
- **Waiting** — an attendee in the queue who has not yet driven. Status `'waiting'` on the queue endpoint.
- **Current Driver** — attendee with status `'driving'`. Only one at a time, enforced at DB level.
- **Gap** — difference in milliseconds between an attendee's `bestLapMs` and the all-time fastest `bestLapMs` (rank #1). Computed on the frontend.
- **NEXT QUEUE IN** — frontend-only countdown to the next full hour from current wall time. No backend data.
