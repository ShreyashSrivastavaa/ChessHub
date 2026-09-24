-- PostgreSQL Exclusion Constraint Migration for TWO ROOKS
-- This migration guarantees that no two active bookings (PENDING_PAYMENT or CONFIRMED)
-- can overlap for the same coach at the database level.

-- 1. Enable btree_gist extension (required for combining scalar coachId with tstzrange)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Add exclusion constraint on Booking
-- Note: In PostgreSQL, tstzrange(startsAt, endsAt) defines the half-open time interval [startsAt, endsAt)
ALTER TABLE "Booking"
ADD CONSTRAINT "no_overlapping_coach_active_bookings"
EXCLUDE USING gist (
  "coachId" WITH =,
  tstzrange("startsAt", "endsAt") WITH &&
)
WHERE ("status" IN ('PENDING_PAYMENT', 'CONFIRMED'));

-- 3. Prevent the same student from double-booking overlapping slots across any coach
ALTER TABLE "Booking"
ADD CONSTRAINT "no_overlapping_student_active_bookings"
EXCLUDE USING gist (
  "studentId" WITH =,
  tstzrange("startsAt", "endsAt") WITH &&
)
WHERE ("status" IN ('PENDING_PAYMENT', 'CONFIRMED'));
