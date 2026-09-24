# TWO ROOKS — Online Chess Coaching Academy

> "Live chess coaching. One coach, one student, one board."

TWO ROOKS is a premium online 1:1 chess coaching academy platform built with the Athletics gallery-grade dark monograph aesthetic (pure obsidian `#000000`, charcoal `#1d1d1d`, paper white `#ffffff`, ash `#d6d5d0`, Newsreader serif display).

Coaching is delivered live on Google Meet by two dedicated specialists:
- **Shreyash**: Foundations, beginners, children, piece coordination, checkmate patterns, opening principles, building confidence.
- **Tapeshnu (FIDE-rated)**: Intermediate & competitive players, opening repertoires, positional play, dynamic calculation, game analysis, tournament preparation.

---

## 1. Quick Start & Setup

### Prerequisites
- Node.js >= 18 (Tested on v24.18)
- npm >= 9

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Push database schema (SQLite out-of-the-box, zero external dependencies required)
npm run db:push

# 3. Seed coaches, session types, skill frameworks, and sample student data
npm run db:seed

# 4. Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 2. Default Seed Accounts

All seed passwords are initialized to `Password123!` (change on first login):

| Role | Email | Password | Access |
|---|---|---|---|
| **Admin** | `admin@tworooks.com` | `Password123!` | `/admin` (superadmin control center) |
| **Coach (Shreyash)** | `shreyash@tworooks.com` | `Password123!` | `/coach` (foundations faculty) |
| **Coach (Tapeshnu)** | `tapesh@tworooks.com` | `Password123!` | `/coach` (FIDE competitive faculty) |
| **Student / Guardian** | `guardian@example.com` | `Password123!` | `/app` (student learner portal) |

---

## 3. Architecture & Tech Stack

```text
[ Browser / Mobile Reels Traffic ]
           │
           ▼
[ Next.js 15 App Router + Middleware ] ── (Edge JWT Session Guard)
           │
 ┌─────────┴─────────────────────────────────────────┐
 │                                                   │
 ▼                                                   ▼
Public Marketing Routes                        Protected Role Dashboards
(/, /coaches, /programs, /pricing,              (/app/*, /coach/*, /admin/*)
 /how-it-works, /faq, /contact, /book)               │
           │                                         │
           └─────────────────┬───────────────────────┘
                             │
                             ▼
              [ Domain Services & Scheduling Engine ]
              ├── slotEngine.ts (Pure slot generator)
              ├── bookingService.ts (Double-booking protection & holds)
              └── paymentService.ts (Mock & Razorpay adapters)
                             │
                             ▼
              [ Persistence: Prisma ORM ]
              ├── Local Dev: SQLite (`dev.db`)
              └── Production: PostgreSQL + `btree_gist` Exclusion Constraint
```

---

## 4. Key Design System Tokens (TWOTWO Specification)

- **Colors:**
  - Voltage Lime: `#e3fc03` (functional punctuation only: CTAs, active states, last-move indicator)
  - Obsidian: `#000000` (primary text, hairline borders, inverted surfaces)
  - Graphite: `#323232` (secondary copy)
  - Carbon: `#1a1a1a` (fine details)
  - Paper White: `#ffffff` (canvas)
  - Concrete: `#e6e6e6` (quiet backdrops, alternating board squares)
  - Error Exception: `#B3261E` (13px with icon and plain text)
- **Strict Two Radii Only:**
  - `50px` for all interactive elements (buttons, inputs, tags, chips, pills)
  - `16px` for static containers (cards, images, chessboards)
  - Zero 4px, 8px, or 24px radii anywhere.
- **Typography:**
  - Headings: Inter Tight (weight 400, tight line-height)
  - Body: Inter (weight 400)
  - Metadata / Notation: JetBrains Mono (weight 400)
- **No Shadows, No Gradients, No Glows**: Elevation strictly via 1px Obsidian hairline borders.

---

## 5. Scripts

- `npm run dev`: Starts local Next.js dev server on port 3000.
- `npm run build`: Generates production build.
- `npm test`: Runs Vitest unit tests covering scheduling engine and business policies.
- `npm run db:push`: Synchronizes Prisma schema.
- `npm run db:seed`: Seeds faculty, session formats, curriculum, and demo data.

---

## 6. Pre-Launch Documentation

- Review `DECISIONS.md` for architectural assumptions and trade-offs.
- Review `LAUNCH_CHECKLIST.md` for every placeholder (pricing, Meet URLs, Razorpay keys, credentials) before production launch.
