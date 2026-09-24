# LAUNCH CHECKLIST: TWO ROOKS

This checklist itemizes every placeholder, configuration value, credential, and asset that must be updated with production data before publicly launching the platform.

---

### 1. Brand & Contact Information (`src/config/brand.ts`)
- [ ] Confirm finalized brand name (currently placeholder: "TWO ROOKS").
- [ ] Confirm official tagline and copy tone.
- [ ] Replace placeholder WhatsApp business phone number (`+91 98765 43210`).
- [ ] Replace contact email (`hello@tworooks.com`) with active inbox.
- [ ] Update social handles (`@tworookschess` on Instagram, YouTube, X).
- [ ] Update production domain (`tworooks.com`).

### 2. Coaches & Credentials (`prisma/seed.ts` & Admin Dashboard)
- [ ] **Shreyash:**
  - [ ] Add real bio and teaching philosophy paragraphs.
  - [ ] Replace placeholder credentials (`[PLACEHOLDER: add certification or teaching experience]`).
  - [ ] Set real Google Meet personal room or default meeting link.
  - [ ] Upload coach portrait photograph (if available).
- [ ] **Tapesh:**
  - [ ] Verify FIDE ID and actual official FIDE rating. (Leave fields blank to display "FIDE-rated" without unverified numbers).
  - [ ] Add real competitive background and teaching philosophy.
  - [ ] Set real Google Meet personal room or default meeting link.
  - [ ] Upload coach portrait photograph (if available).

### 3. Session Types & Pricing (`prisma/seed.ts` & Admin Dashboard)
- [ ] Review and update all session durations and prices in paise (INR):
  - [ ] Trial Assessment Class (e.g. Free or nominal fee)
  - [ ] Foundations 1:1 with Shreyash (e.g. ₹999 / $15)
  - [ ] Intermediate 1:1 with Tapesh (e.g. ₹1,499 / $20)
  - [ ] Advanced Opening Repertoire with Tapesh (e.g. ₹1,999 / $25)
  - [ ] Tournament Preparation Analysis with Tapesh (e.g. ₹2,499 / $30)
- [ ] Verify GST tax liability and update tax note in `src/config/policy.ts`.

### 4. Payments (Razorpay Integration)
- [ ] Create and verify Razorpay Live Merchant Account (India).
- [ ] In `.env.production`:
  - [ ] Set `PAYMENT_PROVIDER=razorpay`
  - [ ] Set `RAZORPAY_KEY_ID=rzp_live_...`
  - [ ] Set `RAZORPAY_KEY_SECRET=...`
  - [ ] Set `RAZORPAY_WEBHOOK_SECRET=...`
- [ ] Configure Razorpay Webhook endpoint in Razorpay Dashboard: `https://yourdomain.com/api/webhooks/razorpay` subscribed to `payment.captured` and `payment.failed`.

### 5. Email & Transactional Notifications (Resend)
- [ ] Verify domain on Resend.
- [ ] In `.env.production`:
  - [ ] Set `RESEND_API_KEY=re_...`
  - [ ] Set `EMAIL_FROM="Two Rooks <classes@tworooks.com>"`

### 6. Legal & Policy Review
- [ ] Have a legal advisor review `/terms` (Draft provided).
- [ ] Have a legal advisor review `/privacy` (Draft provided).
- [ ] Have a legal advisor review `/refund-policy` (Draft provided).
- [ ] Confirm cancellation and reschedule window (currently 12 hours).

### 7. Real Testimonials
- [ ] Testimonials section is automatically hidden until approved testimonials are entered in the database.
- [ ] Once first students complete classes, gather authentic feedback and approve via `/admin/testimonials`.
- [ ] Never seed or publish synthetic reviews.

### 8. Production Database
- [ ] If deploying on PostgreSQL, execute the migration including `prisma/migrations/postgres_exclusion_constraint.sql` for Postgres `btree_gist` exclusion constraints.
- [ ] Set high-entropy `AUTH_SECRET`.
- [ ] Change initial coach and admin passwords on first login.
