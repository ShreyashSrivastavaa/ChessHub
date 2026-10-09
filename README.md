# Chess Hub — Online Chess Coaching Platform

> "Think Smarter. Play Stronger."  
> Personalized chess coaching for beginners and advanced players by Shreyash and Tapesnu.  
> Production Platform: [https://chess-hub-six.vercel.app/](https://chess-hub-six.vercel.app/)

---

## 1. Business Facts & Single Source of Truth

All business constants live in [`src/config/business.ts`](file:///d:/ChessHub/src/config/business.ts) and are imported across the application. Prices are recomputed and enforced on the server — never trusted from the client.

- **Organization:** Chess Hub
- **Coaches:** **Shreyash** and **Tapesnu**
- **Coaching Plans:**
  - **Beginner Coaching:** ₹500 per session (₹50,000 paise)
  - **Advanced Coaching:** ₹800 per session (₹80,000 paise)
- **Email:** [`shreyashsr2004@gmail.com`](mailto:shreyashsr2004@gmail.com)
- **Phone (Tapesnu):** [`+91 9930917551`](tel:+919930917551)
- **Timezone:** Configurable, default `Asia/Kolkata` (IST)
- **Payment Policy:** **No online checkout** (no Razorpay, Stripe, or automated card collection). Students submit a booking request and contact the coaches directly via prefilled `mailto:` and `tel:` links to discuss payment arrangements and confirm the session.
- **Capacity Rules:** `PENDING` and `CONFIRMED` consume slot capacity. Default capacity is 1 per slot. Concurrency protection uses atomic database transactions and client-generated idempotency keys (`idemp_...`).

---

## 2. Architecture & Tech Stack

```text
[ Students & Mobile Visitors ]               [ Coaches: Shreyash & Tapesnu ]
              │                                             │
              ▼                                             ▼
   Public Pages & Booking Flow                      /admin Control Center
   (Hero, 2 Plans, 4 Steps, Coaches,               (Metrics, Availability,
    Accessible Calendar, Prefilled Mailto/Tel)       Bookings, Reschedule, Audit Log)
              │                                             │
              └──────────────────────┬──────────────────────┘
                                     │
                        Next.js 15 App Router
                     (Edge Middleware + Jose JWT)
                                     │
                     Database Rate Limiting Engine
                                     │
                   Prisma ORM (PostgreSQL / SQLite)
                                     │
           ┌─────────────────────────┴────────────────────────┐
           ▼                                                  ▼
   Concurrency-Safe Booking                       Availability Manager
   - Atomic $transaction                          - Slot Capacity Guards
   - Unique Idempotency Key                       - Date Blocking & Protections
   - Human Reference (CH-XXXXXX)                  - 14-Day Weekly Rule Generator
```

- **Framework:** Next.js 15 (App Router, Server Actions, Route Handlers)
- **Language:** TypeScript 5 (Strict mode)
- **Styling:** Design tokens in Vanilla CSS / Tailwind (Dark Charcoal `#0e0e10`, Warm White `#f5f3ef`, Gold `#cfa859`, Forest Green `#2e5a44`)
- **Database & ORM:** Prisma ORM 6 with PostgreSQL (production) and SQLite (zero-config local dev)
- **Authentication:** Edge JWT cookies (`chesshub_session`), bcrypt password hashing, server-side role guard (`ADMIN`)
- **Rate Limiting:** Sliding-window DB rate limiter on `/api/bookings` (5 req / 10 min) and `/api/auth/login` (5 req / 15 min)
- **Notifications:** Optional Resend integration; acknowledgement emails explicitly state "request received" rather than "confirmed"

---

## 3. Folder Map

```text
ChessHub/
├── docs/
│   └── AUDIT.md                      # Complete audit report of previous state & fixes
├── prisma/
│   ├── schema.prisma                 # Production schema: AdminUser, Coach, Slot, Booking, etc.
│   └── seed.ts                       # Database seeder (Admin, Coaches, Weekly Rules, Slots)
├── scripts/
│   ├── create-admin.ts               # CLI script for `npm run admin:create`
│   ├── build.js                      # Production build runner
│   └── postinstall.js                # Prisma client generator
├── src/
│   ├── app/
│   │   ├── (admin)/                  # Authenticated Admin Dashboard
│   │   │   └── admin/
│   │   │       ├── availability/     # Availability Manager (slots, blocks, weekly generator)
│   │   │       ├── bookings/         # Booking Register (filters, search, modals, reschedule)
│   │   │       ├── audit/            # Immutable audit logs
│   │   │       ├── coaches/          # Faculty roster
│   │   │       └── users/            # System users
│   │   ├── (auth)/
│   │   │   └── login/                # Admin Portal Login
│   │   ├── (public)/                 # Public Website
│   │   │   ├── page.tsx              # Landing Page (Hero, Plans, 4 Steps, Coaches, Contact)
│   │   │   ├── book/                 # Interactive Booking Flow
│   │   │   ├── pricing/              # Transparent ₹500 & ₹800 Plan Cards
│   │   │   ├── how-it-works/         # 4-Step Direct Workflow
│   │   │   ├── about/ & coaches/     # Factual Coach Profiles (empty fields hidden)
│   │   │   └── contact/              # Direct Contact (mailto & tel)
│   │   ├── api/
│   │   │   ├── bookings/             # Concurrency-safe public booking API
│   │   │   ├── admin/availability/   # Admin availability management endpoint
│   │   │   ├── admin/bookings/[id]/  # Admin booking status actions (CONFIRM, CANCEL, etc.)
│   │   │   └── auth/login/           # Rate-limited admin authentication
│   │   ├── globals.css               # Design tokens, focus rings, board themes
│   │   ├── layout.tsx                # Metadata, canonical URLs, fact-only JSON-LD
│   │   ├── robots.ts & sitemap.ts    # SEO configuration
│   │   └── opengraph-image.tsx       # Dynamic OG image generator
│   ├── components/
│   │   ├── admin/                    # Admin management components
│   │   ├── booking/                  # Booking flow & calendar picker
│   │   ├── chess/                    # Chess board visual components
│   │   ├── layout/                   # TopNav, Footer, MobileCtaBar, DashboardShell
│   │   └── ui/                       # Design system components (Button, Card, Tag, Input)
│   ├── config/
│   │   ├── business.ts               # SINGLE SOURCE OF TRUTH (Prices, Coaches, Contacts)
│   │   └── env.ts                    # Zod runtime environment validator
│   ├── lib/
│   │   ├── auth/                     # JWT session creation & verification, bcrypt
│   │   ├── db/                       # Prisma client singleton
│   │   ├── notifications/            # Resend email handler (no fake claims)
│   │   └── security/                 # Rate limiter
│   ├── server/services/
│   │   ├── bookingPlatformService.ts # Concurrency lock, idempotency, reference CH-XXXXXX
│   │   └── availabilityManagementService.ts # Capacity guards, date blocking, weekly rules
│   └── middleware.ts                 # Route protection for /admin
├── tests/
│   ├── bookingPlatform.test.ts       # Concurrency, anti-tampering, idempotency tests
│   ├── services.test.ts              # Status transitions, capacity guards, mailto tests
│   └── slotEngine.test.ts            # Slot interval calculation tests
├── .env.example                      # Template with all environment variables explained
└── package.json                      # Scripts and dependencies
```

---

## 4. Environment Variables (`.env.example`)

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | Database connection string. Use SQLite for local, PostgreSQL for Neon/Vercel. | `file:./dev.db` |
| `AUTH_SECRET` | Secret key used to sign and verify JWT admin session cookies (min 32 chars). | `chess-hub-production-auth-secret-min-32-chars` |
| `NEXT_PUBLIC_APP_URL` | Canonical URL of the production deployment. Used in metadata and links. | `https://chess-hub-six.vercel.app` |
| `NEXT_PUBLIC_TIMEZONE` | Timezone for booking slots and calendar display. | `Asia/Kolkata` |
| `ADMIN_EMAIL` | Default email for seeding or initial creation. | `admin@chesshub.in` |
| `ADMIN_PASSWORD` | Default password for seeding. | `ReplaceWithSecureAdminPassword123!` |
| `RESEND_API_KEY` | *(Optional)* Resend API key for sending emails. If blank, emails are logged to console. | `re_123456...` |
| `EMAIL_FROM` | *(Optional)* From address for Resend emails. | `Chess Hub <shreyashsr2004@gmail.com>` |

---

## 5. Local Setup

### 1. Clone & Install
```bash
git clone https://github.com/ShreyashSrivastavaa/ChessHub.git
cd ChessHub
npm install
```

### 2. Set Up Environment
```bash
cp .env.example .env
```
*(On Windows PowerShell: `Copy-Item .env.example .env`)*

### 3. Provision Database & Seed Initial Slots
```bash
# Push Prisma schema to local SQLite database
npm run db:push

# Seed admin account, coaches (Shreyash & Tapesnu), and 14 days of real slots
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public site.  
Open [http://localhost:3000/admin](http://localhost:3000/admin) to log into the admin dashboard (`admin@chesshub.in` / `ReplaceWithSecureAdminPassword123!`).

---

## 6. Creating Admin Accounts (`npm run admin:create`)

You can create or update admin accounts at any time via the dedicated CLI script:

```bash
# Interactive mode (prompts for email, password, and name):
npm run admin:create

# Environment variable mode:
ADMIN_EMAIL="shreyash@chesshub.in" ADMIN_PASSWORD="MySecurePassword123" ADMIN_NAME="Shreyash" npm run admin:create
```

The script hashes the password with bcrypt (10 rounds) and upserts the record into the `AdminUser` model.

---

## 7. Configuring Availability & Slots

From the Admin Dashboard at `/admin/availability`:

1. **Add Custom Slots:** Pick any date, choose start time (e.g. `16:00`), duration in minutes (e.g. `60`), and capacity (default `1`).
2. **Capacity Guards:** You cannot lower a slot's capacity below the number of currently active (`PENDING` or `CONFIRMED`) bookings.
3. **Block Entire Dates:** Mark a date as blocked (e.g. holidays, tournaments). The system rejects date blocking if confirmed bookings exist for that date, displaying the conflicting students.
4. **Generate Recurring Slots:** Use the 14-day rule generator to automatically generate weekday slots (e.g. 17:00, 18:30, 20:00) with capacity 1 without overwriting existing bookings.

---

## 8. Enabling Email Notifications

If you have a Resend account:
1. Create an API key at [resend.com](https://resend.com).
2. Set in your `.env` or Vercel Environment Variables:
   ```env
   RESEND_API_KEY="re_your_api_key_here"
   EMAIL_FROM="Chess Hub <notifications@yourverifieddomain.com>"
   ```
3. When a booking is submitted:
   - Student receives an acknowledgement email stating **"Booking Request Received"** with instructions to contact the coaches.
   - Admin receives an instant notification with student name, reference `CH-XXXXXX`, coaching level, date, and time.
4. If `RESEND_API_KEY` is not set, bookings still complete normally, and the UI never falsely claims an email was sent.

---

## 9. Vercel Deployment Step by Step

### 1. Provision a PostgreSQL Database
- In the Vercel Dashboard, create a **Storage > Postgres (Neon or Vercel Postgres)** database, or use an external Neon database.
- Copy the connection string (`DATABASE_URL`).

### 2. Configure Vercel Project
- In Vercel Project Settings > **Environment Variables**, set:
  - `DATABASE_URL`: `postgresql://...`
  - `AUTH_SECRET`: Random 32+ character string
  - `NEXT_PUBLIC_APP_URL`: `https://chess-hub-six.vercel.app`
  - `NEXT_PUBLIC_TIMEZONE`: `Asia/Kolkata`
  - `ADMIN_EMAIL`: `admin@chesshub.in`
  - `ADMIN_PASSWORD`: Your production admin password
  - `RESEND_API_KEY`: *(Optional)* Your Resend API key
  - `EMAIL_FROM`: `Chess Hub <shreyashsr2004@gmail.com>`

### 3. Build & Deploy Configuration
- In `package.json`, the build script runs `node scripts/build.js`, which automatically executes:
  1. `npx prisma generate`
  2. `npx prisma db push --accept-data-loss` (or `npx prisma migrate deploy`)
  3. `npx tsx prisma/seed.ts` (seeds initial coaches and slots if empty)
  4. `npx next build`
- In Vercel Project Settings > Build & Development Settings:
  - **Build Command:** `npm run build`
  - **Output Directory:** `.next`
  - **Install Command:** `npm install`

---

## 10. Verification & Quality Assurance

All verification suites pass cleanly in the repository:

- **Automated Tests (`npm test`):**
  - `tests/bookingPlatform.test.ts` (10 tests): Unit & concurrency tests for price calculations, reference generation, idempotency handling, slot capacity consumption, anti-tampering, and conflict rejection.
  - `tests/services.test.ts` (7 tests): Status transition lifecycle (`PENDING` -> `CONFIRMED` -> `COMPLETED`/`CANCELLED`), capacity reduction guards, date block conflict prevention, and prefilled `mailto:` URL encoding.
  - `tests/slotEngine.test.ts` (5 tests): Slot duration interval calculations and conflict algorithms.
- **Type Check (`npx tsc --noEmit`):** 0 errors.
- **Lint (`npm run lint`):** 0 errors.
- **Production Build (`npm run build`):** Compiled 32 static and dynamic routes with full route optimization.

---

## 11. Known Limitations & Design Decisions

1. **No Online Checkout / Card Processing:** By design, students arrange payment directly with Shreyash and Tapesnu via direct email/phone contact. The platform deliberately does not integrate payment gateways.
2. **Direct Contact Prefilled Links:** The success screen formats a RFC 2368 compliant `mailto:` URL that automatically fills the email subject and body with booking reference, program level, session date/time, and price, directing students to Coach Shreyash and Coach Tapesnu.
3. **Database-Backed Rate Limiter:** Operates directly against the database `RateLimit` model, removing hard requirements on external Redis instances while preserving DDoS and brute-force protection.
