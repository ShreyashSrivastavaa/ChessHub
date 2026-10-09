# Chess Hub Architecture & Codebase Audit

**Date:** 2026-10-10  
**Repository:** Chess Hub (`two-rooks-chess` / `ChessHub`)  
**Production URL:** https://chess-hub-six.vercel.app/  

---

## 1. Executive Summary

The existing codebase was previously structured as "Two Rooks" and built around online payment collection (Razorpay mock/gateway), guardian-student relational models, complex multi-step auth wizards, and unverified credentials/ratings. It contains placeholders, hardcoded brand names, and incomplete payment assumptions that directly contradict the real-world Chess Hub operational model (co-founded by Shreyash and Tapesnu, ₹500/₹800 pricing, zero online checkout, direct student-coach contact to discuss payment).

---

## 2. Structural & Route Audit

1. **Brand & Identity Inconsistencies:**
   - Brand was hardcoded as "TWO ROOKS" across `src/config/brand.ts`, metadata, navbar, emails, and footers instead of "Chess Hub".
   - Name spelling variant "Tapesh" was used across database slugs and routes instead of the exact spelling "Tapesnu".
   - Unverified FIDE claims and placeholder credentials were hardcoded into models, seed files, and public coach profiles.

2. **Routes & Content:**
   - Navigation links included `/programs`, `/pricing`, `/coaches/[slug]` with legacy 9-step booking and mock Razorpay checkout.
   - Hero copy and value propositions did not reflect the required single source of truth ("Think Smarter. Play Stronger." with ₹500 Beginner and ₹800 Advanced coaching plans).
   - Incomplete and fake data structures present: `Testimonial`, `RatingSnapshot`, `Homework`, and `SkillArea` models with placeholder entries.

---

## 3. Booking & Availability Engine Audit

1. **Payment Model Contradiction:**
   - Legacy booking system enforced an online checkout flow (`PENDING_PAYMENT` -> Razorpay modal / mock payment -> `CONFIRMED`).
   - Chess Hub operational model specifies: **NO online payments**. Booking submissions enter `PENDING` status. Students contact the coaches directly (`mailto:` / `tel:`) to discuss payment and confirm the lesson.

2. **Concurrency & Capacity Shortcomings:**
   - The previous slot engine relied on dynamic interval overlapping without explicit slot records or granular slot-level capacity.
   - Lack of atomic capacity decrement and row-level conflict checking in SQLite/PostgreSQL caused vulnerability to simultaneous double-booking of single-capacity slots.
   - Missing client-generated idempotency key constraint on booking submissions, allowing accidental double-submits.
   - Booking reference generated as `TR-XXXX` rather than `CH-XXXXXX`.

3. **Calendar & Slot Administration Gaps:**
   - No direct admin interface to view booked vs. remaining capacity per slot, configure custom slot duration/capacity, or block/reopen dates and slots with conflict guards.
   - Weekly recurring rules lacked per-date slot override management with active booking protection.

---

## 4. Auth, Admin & Security Audit

1. **Authentication:**
   - Legacy system required students to create full user accounts before submitting a booking enquiry.
   - Admin routes in `src/app/(admin)/admin` had basic role checks in React Server Components, but mutations lacked unified rate limiting and CSRF token verification.
2. **Rate Limiting:**
   - No rate limiting was enforced on `/api/bookings` or admin login endpoints, exposing endpoints to brute force or booking spam.
3. **Environment & Secrets:**
   - `.env.example` still referenced `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, and `AUTH_SECRET` defaults.
   - Missing startup environment validation (`env.ts`).

---

## 5. Accessibility (a11y) & SEO Audit

1. **Accessibility:**
   - Calendar date grid used arbitrary divs without full ARIA grid semantics or proper disabled-state announcement.
   - Missing `aria-describedby` links between form errors and inputs in several forms.
   - Focus rings on dark backgrounds lacked sufficient contrast in some custom interactive elements.
2. **SEO & Performance:**
   - Missing structured JSON-LD limited to verified facts (Chess Hub, Shreyash & Tapesnu, coaching prices ₹500 and ₹800, email, phone).
   - `robots.txt` and `sitemap.xml` did not disallow `/admin` and `/api` consistently.

---

## 6. Action Plan

1. Create `src/config/business.ts` as the sole source of truth for pricing (Beginner ₹500, Advanced ₹800), coaches (Shreyash, Tapesnu), contact info, and payment policy.
2. Refactor database schema to support clean, persistent models (`AdminUser`, `Coach`, `Slot`, `Booking`, `AvailabilityRule`, `AvailabilityDate`, `BookingEvent`, `AuditLog`, `RateLimit`).
3. Implement atomic, concurrency-safe booking reservation with idempotency keys and collision-resistant `CH-XXXXXX` references.
4. Redesign public pages with a luxury dark charcoal / warm white / subtle accent chess aesthetic, responsive navbar, coaching cards, 4-step workflow, and editable coach profiles.
5. Build the direct contact / payment enquiry workflow on booking completion (`mailto:` prefilled and `tel:`).
6. Build the comprehensive Admin Dashboard (`/admin`) for availability management, recurring rules, date overrides, slot capacities, booking status transitions, and audit logs.
7. Implement DB-backed rate limiter, unit/concurrency tests, SEO files, and update documentation.
