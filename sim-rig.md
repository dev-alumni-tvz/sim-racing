# Sim Rig Event — Frontend Spec

Base URL: `http://{LAN_IP}:5000` (local network, no HTTPS)

Admin endpoints require the header `X-Api-Key: {key}` — will be shared separately.

---

## Pages

| Route | Description |
|---|---|
| `/register` | Public registration form (QR code target) |
| `/ticket/:attendeeId` | Ticket confirmation + live wait estimate |
| `/leaderboard` | Public display screen |
| `/queue` | Public display screen — current + next driver |
| `/admin` | Session control + queue management |

---

## Registration

### `POST /api/registration`

```json
// Request
{
  "firstName": "Ana",
  "lastName": "Kovač",
  "email": "ana@example.com"
}
```

```json
// 201 Created
{
  "attendeeId": "3fa85f64-...",
  "ticketNumber": "SIM-0047",
  "queuePosition": 47,
  "estimatedWaitMinutes": 12
}
```

```json
// 409 Conflict — email already registered
{ "error": "Email already registered." }
```

After a successful registration, redirect to `/ticket/{attendeeId}`.

---

## Ticket / Wait Status

### `GET /api/queue/wait-estimate?position={n}`

```json
// 200 OK
{ "estimatedWaitMinutes": 9 }
```

Poll this every 30 seconds on the ticket page to keep the estimate fresh. The estimate is based on a rolling average of recent session durations.

---

## Queue Display

### `GET /api/queue/display`

```json
// 200 OK
{
  "currentDriver": {
    "ticketNumber": "SIM-0046",
    "firstName": "Marko",
    "sessionStartedAt": "2026-05-08T10:14:00Z",
    "elapsedSeconds": 142
  },
  "nextDriver": {
    "ticketNumber": "SIM-0047",
    "firstName": "Ana",
    "estimatedWaitMinutes": 3
  },
  "waitingCount": 11
}
```

`currentDriver` and `nextDriver` can be `null`. Prefer SignalR (`QueueHub`) over polling for the display screen.

---

## Leaderboard

### `GET /api/leaderboard`

```json
// 200 OK
{
  "entries": [
    {
      "rank": 1,
      "firstName": "Marko",
      "lastName": "Perić",
      "bestLapMs": 87432,
      "bestLapFormatted": "1:27.432",
      "completedAt": "2026-05-08T10:15:43Z"
    }
  ],
  "lastUpdated": "2026-05-08T10:15:43Z"
}
```

Prefer SignalR (`LeaderboardHub`) over polling for the display screen.

---

## Admin Endpoints

All require `X-Api-Key` header.

### `GET /api/admin/queue`

```json
// 200 OK
{
  "entries": [
    {
      "attendeeId": "3fa85f64-...",
      "ticketNumber": "SIM-0047",
      "firstName": "Ana",
      "lastName": "Kovač",
      "email": "ana@example.com",
      "queuePosition": 47,
      "status": "waiting",
      "estimatedWaitMinutes": 9
    }
  ]
}
```

Statuses: `waiting`, `driving`, `done`, `skipped`.

---

### `GET /api/admin/session/active`

```json
// 200 OK — session in progress
{
  "sessionId": "9b1deb4d-...",
  "attendeeId": "3fa85f64-...",
  "ticketNumber": "SIM-0047",
  "firstName": "Ana",
  "lastName": "Kovač",
  "startedAt": "2026-05-08T10:20:00Z"
}
```

```json
// 404 Not Found — no active session
```

---

### `POST /api/admin/session/start`

```json
// Request
{ "attendeeId": "3fa85f64-..." }
```

```json
// 200 OK
{
  "sessionId": "9b1deb4d-...",
  "attendeeId": "3fa85f64-...",
  "ticketNumber": "SIM-0047",
  "startedAt": "2026-05-08T10:20:00Z"
}
```

```json
// 409 Conflict — a session is already active
{ "error": "A session is already in progress." }
```

---

### `POST /api/admin/session/stop`

No request body. Stops whatever session is currently active.

```json
// 200 OK
{
  "sessionId": "9b1deb4d-...",
  "attendeeId": "3fa85f64-...",
  "durationSeconds": 183,
  "bestLapMs": null,
  "bridgeDataReceived": false
}
```

`bestLapMs` will be `null` immediately after stopping — it arrives shortly after via the bridge. Listen for `LeaderboardUpdated` on SignalR to get the final value.

---

### `PATCH /api/admin/attendee/{attendeeId}/skip`

No request body.

```json
// 200 OK
{ "attendeeId": "3fa85f64-...", "status": "skipped" }
```

---

### `PATCH /api/admin/session/{sessionId}/cancel`

Cancels an active session and returns the attendee to `waiting` status.

```json
// 200 OK
{ "sessionId": "9b1deb4d-...", "status": "cancelled" }
```

---

## SignalR

Connect using the SignalR JS client. No auth required for either hub.

```js
import * as signalR from "@microsoft/signalr"

const connection = new signalR.HubConnectionBuilder()
  .withUrl("http://{LAN_IP}:5000/hubs/leaderboard")
  .withAutomaticReconnect()
  .build()
```

---

### `LeaderboardHub` — `/hubs/leaderboard`

| Event | When | Payload |
|---|---|---|
| `LeaderboardUpdated` | Bridge submits lap data after a session | Full leaderboard array (same shape as `GET /api/leaderboard`) |
| `SessionCompleted` | Admin stops timer | `{ sessionId, driverName, durationSeconds }` |

---

### `QueueHub` — `/hubs/queue`

| Event | When | Payload |
|---|---|---|
| `SessionStarted` | Admin starts a session | `{ sessionId, driverName, ticketNumber, startedAt }` |
| `SessionStopped` | Admin stops a session | `{ sessionId, driverName, durationSeconds }` |
| `QueueUpdated` | Any status change | Full queue display object (same shape as `GET /api/queue/display`) |
| `AttendeeRegistered` | New registration | `{ ticketNumber, queuePosition, waitingCount }` |

---

## Notes

- `bestLapMs` is in milliseconds. `bestLapFormatted` (`"1:27.432"`) is provided for convenience but you can format it yourself from ms.
- The timer on the queue display screen should be driven client-side from `sessionStartedAt`, not polled from the server.
- There is always at most one active session at a time.
