# DECISIONS & ARCHITECTURAL LOG

This file logs all product, design, and technical decisions made during the implementation of **TWO ROOKS**.

---

### 1. Brand & Identity
- **Placeholder Name:** "TWO ROOKS" (uppercase in navigation and display contexts).
- **Tagline:** "Live chess coaching. One coach, one student, one board."
- **Config Single Source of Truth:** Centralized in `src/config/brand.ts`. No hardcoded brand strings in UI components.
- **Piece Glyphs & Line Icons:** Minimalist 1.5px stroke custom SVG chess icons (King, Queen, Rook, Bishop, Knight, Pawn) designed cleanly to match `lucide-react` line weight (strokeWidth=1.5).

### 2. Design System & Tokens
- **Source of Truth:** `DESIGN.md` (TWOTWO padel store aesthetic adapted for chess academy).
- **Color Palette:**
  - Voltage Lime: `#e3fc03` (functional punctuation only: primary CTA, active states, last-move indicator, key phrase in Obsidian hero). Never used as background wash or text on white.
  - Obsidian: `#000000` (primary text, hairline borders, inverted surfaces, footer).
  - Graphite: `#323232` (secondary copy).
  - Carbon: `#1a1a1a` (fine details and borders).
  - Paper White: `#ffffff` (primary canvas).
  - Concrete: `#e6e6e6` (quiet section background, alternating board squares, skeleton loader).
- **Two Radii Only:**
  - `50px` (buttons, inputs, tags, chips, pills).
  - `16px` (cards, containers, chessboards).
  - Absolutely no 4px, 8px, or 24px radii anywhere.
- **Typography:**
  - Headings: Inter Tight (weight 400).
  - Body: Inter (weight 400).
  - Mono / Inktrap metadata: JetBrains Mono (weight 400).
  - Loaded via `next/font/google`.
- **Form Error Exception:** `#B3261E` at 13px paired with an alert icon and plain-language text for accessibility compliance.

### 3. Database & Deployment Target
- **Database Engine Decision:**
  - For local development and out-of-the-box zero-setup execution, SQLite is used via Prisma (`prisma/schema.prisma`).
  - For PostgreSQL production deployment, a dual schema / raw SQL migration file is prepared in `prisma/migrations/postgres_exclusion_constraint.sql` containing the `btree_gist` extension and PostgreSQL exclusion constraint `(coachId, tstzrange(startsAt, endsAt))` where status is active.
  - In application logic, double-booking prevention is enforced with defensive depth: active 10-minute slot holds (`PENDING_PAYMENT`), transaction-level slot verification, and student-level overlap checks.

### 4. Authentication & Security
- **Auth Strategy:** Lightweight, edge-compatible JWT session cookie mechanism with `jose` and `bcryptjs`. Role-based access control for `STUDENT`, `COACH`, and `ADMIN`.
- **Server Verification:** Permissions and resource ownership are enforced inside server actions and route handlers, never solely in client UI.
- **Guardian & Minor Protection:** Guardians can create multiple `Student` learner profiles. Minors have an explicit guardian consent checkbox at signup.

### 5. Payments Architecture
- **Provider Interface:** `PaymentProvider` interface in `src/lib/payments/provider.ts`.
- **Adapters:**
  - `MockProvider`: Active when `PAYMENT_PROVIDER=mock`. Simulates real checkout modals, verifies mock signatures, and triggers the exact same state machine as production.
  - `RazorpayProvider`: Active when `PAYMENT_PROVIDER=razorpay`. Validates orders, HMAC-SHA256 signatures, and webhooks.
- **Webhook Source of Truth:** `POST /api/webhooks/razorpay` with idempotent `PaymentEvent` tracking.
- **Free Trial Sessions:** Classes with price = ₹0 bypass the payment provider and invoke `confirmBooking()` directly.

### 6. Google Meet Integration
- **Default & Override:** Each coach has a `defaultMeetUrl`. Each session/booking has an optional `meetUrl` override.
- **Security:** Meet URLs are never rendered in public payloads; accessible only to the assigned coach, the booking owner, and admins.
- **Active State Rule:** The Meet button is disabled with a countdown until 10 minutes prior to class start, illuminates in Voltage Lime during class, and moves to history once concluded.

### 7. Progress & Skill Tracking
- **Chess-Specific Model:** No generic percentages or rings. Tracking uses 4-square ranks across predefined skill areas (Foundations track & Improvement track).
- **Stages:** `Introduced` -> `Developing` -> `Reliable` -> `Fluent`.
- **Sparklines:** Real 1px black sparkline ending in a lime dot rendered only if `RatingSnapshot` data exists.

### 8. Strict DESIGN.md Compliance Audit (TWOTWO System)
- **CSS Custom Properties & @theme:** Integrated the exact `--font-whyte*`, typography scale tokens (`--text-display` 72px, `--text-heading-lg` 38px, `--text-heading` 32px, `--text-heading-sm` 26px, `--text-subheading` 22px, `--text-body` 18px, `--text-body-sm` 16px, `--text-caption` 13px), spacing scale (`--spacing-4` through `--spacing-68`), and surface colors directly into `globals.css`.
- **Weight Discipline:** Audited and normalized every heading and body text element across all public, auth, student, coach, and admin pages to weight 400 (`font-normal`), fulfilling the strict Whyte Book / Whyte Regular 400 design rule.
- **Header Floating Canvas:** Removed bottom hairline border from top navigation bar, ensuring the full-width white bar floats freely without dividing lines.
- **Footer Typography:** Aligned column headers to 16px uppercase Whyte Inktrap tokens and link lists to 13px Whyte Book.
- **Two-Radius System:** Preserved 50px pill radius for interactive elements (buttons, inputs, tags) and 16px radius for containers and cards with 0px deviation.

### 9. Athletics Dark Monograph Migration & Tapesnu Update
- **Faculty Update:** Coach Tapesh renamed to **Tapesnu** across the entire academy (configuration, database seed, public pages, student portals, and legal disclosures).
- **Design System Overhaul:** Migrated from TWOTWO light theme to **Athletics — Style Reference ("monograph on black velvet")**:
  - Ruthlessly monochromatic dark palette: Obsidian `#000000` canvas, Charcoal `#1d1d1d` elevated card containers, Paper White `#ffffff` crisp typography, and Ash `#d6d5d0` hairline accents.
  - Typography: Feature Deck (loaded via `Newsreader` 300 light serif display, 72–116px) paired with Söhne (loaded via `Inter` 300/400 grotesque) and JetBrains Mono for metadata.
  - Radii: 9999px full pills for interactive elements (buttons, inputs, tags) and 8px subtle corners for structural cards.
  - Micro-interactions: Fluid hover transitions, quiet ash borders, high-contrast editorial photography and chess diagram treatments.

