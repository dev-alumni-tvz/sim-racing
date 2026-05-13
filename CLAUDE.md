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
- Features:
  - Reference timer (5-minute countdown per player, admin-controlled — not game time)
  - "Next Player" button starts the countdown
  - Admin can add/subtract small time increments for buffer purposes
  - Queue management (current player, next up, full queue list)
  - All-time leaderboard management (edit, delete entries)
  - Guest management (show, delete, edit)
  - Resort management (edit times)
  - Embedded user-monitor view (right panel on same screen)

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
