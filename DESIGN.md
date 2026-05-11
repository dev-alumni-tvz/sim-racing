# SIM-RIG Dashboard — Design Spec

Extracted from Figma: `https://www.figma.com/design/SNaWC7kEXzFAk7B3B2d7HM/SIM-RIG-Dashboard`  
File key: `SNaWC7kEXzFAk7B3B2d7HM`  
Access token env: `FIGMA_ACCESS_TOKEN` (configured in `~/.claude/.mcp.json`)

---

## Color Tokens

```css
/* Backgrounds */
--color-bg:           #0e0f15;   /* main page background */
--color-card:         #0f131d;   /* card / table row background */
--color-card-alt:     #182a56;   /* edit panel / modal background */

/* Accents */
--color-glow-blue:    #6ac8ff;   /* decorative glow, ellipses */
--color-glow-mid:     #68bdff;
--color-deep-blue:    #004288;
--color-mid-blue:     #0074f1;

/* Interactive */
--color-btn-primary:  #0084ff;   /* play/pause, save buttons */
--color-btn-dark:     #1e4286;   /* time-offset buttons */
--color-btn-green:    #2e9d06;   /* "Next Player" */
--color-btn-red:      #bd0606;   /* "Pause", "Delete" */
--color-btn-danger:   #d22525;   /* active indicator dot */
--color-cta-yellow:   #eac31b;   /* "Join the Queue" (mobile) */

/* Text */
--color-text-primary: #ffffff;
--color-text-soft:    #eef6fa;   /* most body text */
--color-text-muted:   #81a1c0;   /* position numbers */
--color-text-dim:     #354a69;   /* disabled queue numbers */
--color-text-placeholder: #6b7280; /* search placeholder */
--color-text-label:   #314977;   /* "TIME LEFT:" style labels */
--color-queue-col:    #253759;   /* queue number column (dim) */

/* Feedback */
--color-error:        #ff4a4a;   /* gap delta, negative time */

/* Borders / Dividers */
--color-divider:      #23293b;
--color-border-dark:  #16204b;   /* navbar border */
--color-border-panel: #5b65a7;   /* edit panel border */
--color-scrollbar:    #536694;   /* scrollbar thumb */
```

---

## Typography

| Font | Weight(s) | Usage |
|---|---|---|
| **TASA Orbiter** | 800 | Large queue numbers (110px current, 64px next/prev, 48px tiles) |
| **Titillium Web** | 400 / 600 / 700 | All UI — leaderboard rows, timers, buttons, labels |
| **DM Sans** | 400 / 600 / 700 | Mobile app (user-web) — all text |
| **Poppins** | 400 | Header branding ("Powered by:") |
| **Inter** | 400 | Helper labels (column headers, small notes) |

### Key type scales
```
Queue# current:  TASA Orbiter 800 / 110px
Queue# side:     TASA Orbiter 800 / 64px
Queue# tile:     TASA Orbiter 800 / 48px
Timer display:   Titillium Web 600 / 64px (admin), 52px (clock)
Podium lap time: Titillium Web 600 / 36px  (gradient fill)
Section heading: Titillium Web 700 / 20px
Leaderboard row: Titillium Web 600 / 24px (user-monitor), ~15px (admin)
Mobile heading:  DM Sans 700 / 36px
Mobile body:     DM Sans 600 / 14px
Gap delta:       Titillium Web 400 / 16px  (#ff4a4a)
Column header:   Inter 400 / 14px
```

---

## Frame 1 — `user-view` (1440×2560 — portrait, USER MONITOR)

### Header
- Decorative particle / racing SVG background (`#010416` base ellipse)
- Glow ellipses: `#6ac8ff` (3), `#004288`, `#0074f1`, `#68bdff`
- Treblle logo (sponsor)
- "Powered by:" — Poppins 400/24px white
- "Timings, players, dashboards tracked by APIs." — Poppins 400/15px white

### Podium (Top 3 cards)
Each card is ~353×575–587px with gradient overlay rectangle

| Place | Avatar frame color | Gap color |
|---|---|---|
| 1st (center) | `#ffd365` gold | none |
| 2nd (left) | `#cdcdcd` silver | `#ff4a4a` |
| 3rd (right) | `#b38a48` bronze | `#ff4a4a` |

- Name: Inter 600/24px `#ffffff`
- "Lap Time:" label: Titillium Web 400/14px white
- Lap time value: Titillium Web 600/36px gradient fill
- Gap delta: Titillium Web 400/16px `#ff4a4a`

### Queue Countdown
- Container: 440×74, `Frame 7`
- "Queue ends:" — Inter 400/14px white
- "40m 29s" — Inter 600/14px white
- Clock icon element

### Currently Driving (3-card layout)
```
[ NEXT UP 230×230 ]  [ CURRENTLY DRIVING 299×299 ]  [ PREVIOUS 230×230 ]
```
- All cards: gradient rectangle background
- Label: Titillium Web 700/20px `#eef6fa`
- Queue number (current): TASA Orbiter 800/110px `#eef6fa`
- Queue number (side): TASA Orbiter 800/64px `#eef6fa`
- Player name below card: Titillium Web 700/14px `#eef6fa`

### Leaderboard Table
- Header row: "Pos." / "Name" / "Lap Time" / "Gap" — Inter 400/14px white
- Row size: 569×70, bg `#0f131d`
- Layout: **2 columns** (pos 4–8 left, 9–13 right)
- Position number: Titillium Web 600/24px `#81a1c0`
- Name: Titillium Web 600/24px `#eef6fa`
- Gap: Titillium Web 600/20px white / `#eef6fa`

### Queue Grid
- Tiles: ~184×184px, bg `#0f131d`
- Queue number: TASA Orbiter 800/48px `#354a69`
- **"NEW SLOTS OPEN AT:"** info tile: gradient bg, Titillium Web 700/20px + 32px time value
- **"FREE SLOTS AVAILABLE:"** info tile: same style

### Footer
- "View full leaderboard: simrig.com" — Inter 400/16px white

---

## Frame 2 — `admin-panel` (1920×1080 — landscape, ADMIN MONITOR)

### Layout
```
| All-time LB  | Timer + Controls | Queue panel | Embedded user-monitor |
| (367px wide) |   (464px wide)   | (464×603)   |      (607px wide)     |
```

### All-time Leaderboard (left, Group 73)
- Title: "ALL TIME Leaderboard" — Titillium Web 700/16px `#eef6fa`
- Rows: 367×37
  - Top 3: gradient bg, text `#0e0f15` (dark on light)
  - Rest: `#0f131d` bg, pos `#81a1c0`, name `#eef6fa`
- Columns: Pos / Name / Lap Time / Gap — Titillium Web 600 ~15px / 12px
- Scrollbar track `#23293b`, thumb `#536694`
- Active position indicator: vertical bar `#536694` (6×38)

### Timer Widget (Group 70, 464×176)
- Background: `#0f131d`
- "TIME LEFT:" — Titillium Web 400/10px `#314977`
- Timer display: "00:00" — Titillium Web 600/64px white
- **Play/Pause button** (96×44): `#0084ff`
  - Pause icon frame inside
- **Time offset buttons** (56×44 each, `#1e4286`):
  - Row left → right: `-1m` / `-10s` / `-1s` / [Play/Pause] / `+1s` / `+10s` / `+1m`
- Reset icon component (18×18)

### Current Time Widget (Group 48, 300×176)
- Background: `#0f131d`
- "CURRENT TIME" label: Titillium Web 700/~13px `#eef6fa`
- Clock: "12:20:23" — Titillium Web 600/~52px white
- "NEXT QUEUE IN: 39:23" — Titillium Web 700/~13px `#314468`

### Action Buttons
- **NEXT PLAYER** (208×70): bg `#2e9d06`, Titillium Web 700/20px white
- **PAUSE** (86×70): bg `#bd0606`, Titillium Web 700/20px white

### Current Queue Panel (464×603)
- Header: "CURRENT QUEUE" — Titillium Web 700/20px `#eef6fa`
- "Played" label — Inter 400/14px white
- "Next up:" label — Inter 400/14px white
- Active dot indicator: 11×11 ellipse `#d22525`
- Rows (407×37, bg `#0f131d`): Pos / Name / Queue# / Gap / Lap Time
  - Pos: Titillium Web 600/~15px `#81a1c0`
  - Name: Titillium Web 600/~15px `#eef6fa`
  - Queue#: Titillium Web 400/~15px `#253759` (dim)
  - Gap: Titillium Web 300/~12px white
  - Lap Time: Titillium Web 600/~12px white

### Edit Guest Popup (Group 76, 338×231)
- Background: `#182a56`, border `#5b65a7`
- "Name" label — Inter 400/12px white
- "Time" label — Inter 400/12px white
- Name field row (297×35): bg `#0f131d`
- Time field row (297×35): bg `#0f131d`
- **"Spremi"** (Save) button (76×26): `#0084ff` — Titillium Web 700/10px
- **"Izbriši"** (Delete) button (76×26): `#bd0606` — Titillium Web 700/10px

> Note: "Spremi"/"Izbriši" = Croatian (Save/Delete). App targets Croatian venue (TVZ = Tehničko Veleučilište Zagreb).

---

## Frame 3 — `Mobile` (375×1584 — mobile, USER WEB)

### Navbar (375×65)
- Border: `#16204b`
- CareerDay logo + Treblle logo (sponsor)

### Hero Section (375×289)
- Background image/content frame (343×149)
- **"Join the Queue"** CTA button (199×43): bg `#eac31b` yellow
  - Text: DM Sans 700/18px white

### Leaderboard Section (FAQ frame, 375×1096)
- "Leaderboard" — DM Sans 700/36px white
- "Tko je najbrži na TVZ-u ?" — DM Sans 400/16px `#6b7280`
- **Search row** (333×37): border `#424651`, "Search" placeholder `#6b6d78` DM Sans 400/14px
- Rows (333×37, bg `#0f131d`):
  - Top 3: gradient bg, text `#0e0f15`
  - Rest: `#0f131d` bg
  - Pos: DM Sans 600/14px `#81a1c0` (or `#0e0f15` for top 3)
  - Name: DM Sans 600/14px `#eef6fa` (or `#0e0f15` for top 3)
  - Gap: Titillium Web 300/14px white
  - Lap Time: Titillium Web 600/16px white
- Footer divider: `#11294d` 321×2

---

## Avatar / Podium Colors
| Rank | Frame color |
|---|---|
| 1st | `#ffd365` (gold) |
| 2nd | `#cdcdcd` (silver) |
| 3rd | `#b38a48` (bronze) |

## Leaderboard Row Highlight (top 3)
- Background: gradient (gold/warm)
- Text color: `#0e0f15` (dark, inverted from normal)
- Normal rows: bg `#0f131d`, text `#eef6fa`
