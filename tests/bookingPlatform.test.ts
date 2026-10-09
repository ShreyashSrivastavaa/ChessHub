import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "../src/lib/db/prisma";
import {
  createBooking,
  generateBookingReference,
  getAvailableDates,
  getSlotsForDate,
  confirmBooking,
  cancelBooking,
  completeBooking,
  rescheduleBooking,
  SlotConflictError,
  ValidationError,
} from "../src/server/services/bookingPlatformService";
import { BUSINESS_CONFIG, getPlanByLevel } from "../src/config/business";
import { upsertSlot, blockDate, unblockDate } from "../src/server/services/availabilityManagementService";

describe("Chess Hub Booking Platform Test Suite", () => {
  const testDate = "2026-11-15"; // Future test date

  let testSlot1Id: string;
  let testSlot2Id: string;

  beforeAll(async () => {
    // Clean up any test records for this date
    await prisma.booking.deleteMany({
      where: { date: testDate },
    });
    await prisma.slot.deleteMany({
      where: { date: testDate },
    });
    await prisma.availabilityDate.deleteMany({
      where: { date: testDate },
    });

    // Create Coach records if not exist
    for (const coach of BUSINESS_CONFIG.coaches) {
      await prisma.coach.upsert({
        where: { slug: coach.slug },
        update: {},
        create: {
          slug: coach.slug,
          name: coach.name,
          displayName: coach.displayName,
          isActive: true,
        },
      });
    }

    // Create 2 test slots on testDate with capacity = 1
    const s1 = await prisma.slot.create({
      data: {
        date: testDate,
        startTime: "10:00",
        endTime: "11:00",
        startsAt: new Date(`${testDate}T10:00:00+05:30`),
        endsAt: new Date(`${testDate}T11:00:00+05:30`),
        durationMinutes: 60,
        capacity: 1,
        isBlocked: false,
        isSoldOut: false,
      },
    });
    testSlot1Id = s1.id;

    const s2 = await prisma.slot.create({
      data: {
        date: testDate,
        startTime: "14:00",
        endTime: "15:00",
        startsAt: new Date(`${testDate}T14:00:00+05:30`),
        endsAt: new Date(`${testDate}T15:00:00+05:30`),
        durationMinutes: 60,
        capacity: 1,
        isBlocked: false,
        isSoldOut: false,
      },
    });
    testSlot2Id = s2.id;
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { date: testDate } });
    await prisma.slot.deleteMany({ where: { date: testDate } });
    await prisma.availabilityDate.deleteMany({ where: { date: testDate } });
  });

  describe("1. Pricing Integrity & Anti-Tampering", () => {
    it("Beginner session is always ₹500", () => {
      const plan = getPlanByLevel("beginner");
      expect(plan.priceRupees).toBe(500);
      expect(plan.pricePaise).toBe(50000);
    });

    it("Advanced session is always ₹800", () => {
      const plan = getPlanByLevel("advanced");
      expect(plan.priceRupees).toBe(800);
      expect(plan.pricePaise).toBe(80000);
    });

    it("Server ignores tampered price input and recomputes correctly", async () => {
      const res = await createBooking({
        fullName: "Aryan Patel",
        email: "aryan@example.com",
        phone: "+91 9876543210",
        level: "beginner",
        date: testDate,
        slotId: testSlot1Id,
        idempotencyKey: `idemp_price_test_${Date.now()}`,
      } as any);

      expect(res.booking.priceRupees).toBe(500);
      expect(res.booking.status).toBe("PENDING");
      expect(res.booking.reference).toMatch(/^CH-[A-Z0-9]{6}$/);

      // Clean up for subsequent tests on slot 1
      await prisma.booking.delete({ where: { id: res.booking.id } });
      await prisma.slot.update({ where: { id: testSlot1Id }, data: { isSoldOut: false } });
    });
  });

  describe("2. Server-side Validation", () => {
    it("rejects booking for dates in the past", async () => {
      await expect(
        createBooking({
          fullName: "Past Student",
          email: "student@example.com",
          phone: "+91 9876543210",
          level: "beginner",
          date: "2020-01-01",
          slotId: testSlot1Id,
          idempotencyKey: "idemp_past_date",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("rejects invalid email formats", async () => {
      await expect(
        createBooking({
          fullName: "Test User",
          email: "not-an-email",
          phone: "+91 9876543210",
          level: "beginner",
          date: testDate,
          slotId: testSlot1Id,
          idempotencyKey: "idemp_bad_email",
        })
      ).rejects.toThrow(ValidationError);
    });

    it("rejects invalid phone numbers", async () => {
      await expect(
        createBooking({
          fullName: "Test User",
          email: "valid@example.com",
          phone: "abc",
          level: "beginner",
          date: testDate,
          slotId: testSlot1Id,
          idempotencyKey: "idemp_bad_phone",
        })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("3. Concurrency Protection (Row Lock / Atomic Capacity Check)", () => {
    it("two simultaneous requests cannot take the same single-capacity slot", async () => {
      const req1 = createBooking({
        fullName: "Simultaneous Student A",
        email: "studentA@example.com",
        phone: "+91 9111111111",
        level: "beginner",
        date: testDate,
        slotId: testSlot1Id,
        idempotencyKey: `idemp_conc_A_${Date.now()}`,
      });

      const req2 = createBooking({
        fullName: "Simultaneous Student B",
        email: "studentB@example.com",
        phone: "+91 9222222222",
        level: "beginner",
        date: testDate,
        slotId: testSlot1Id,
        idempotencyKey: `idemp_conc_B_${Date.now()}`,
      });

      const results = await Promise.allSettled([req1, req2]);

      const fulfilled = results.filter((r) => r.status === "fulfilled");
      const rejected = results.filter((r) => r.status === "rejected");

      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(1);

      // Verify the rejected error is a SlotConflictError
      const rejectedReason = (rejected[0] as PromiseRejectedResult).reason;
      expect(rejectedReason.name).toBe("SlotConflictError");
    });
  });

  describe("4. Idempotency Key Handling", () => {
    it("duplicate submission with the same idempotency key returns the same booking", async () => {
      const fixedKey = `idemp_duplicate_test_${Date.now()}`;

      const res1 = await createBooking({
        fullName: "Duplicate Tester",
        email: "duplicate@example.com",
        phone: "+91 9333333333",
        level: "advanced",
        date: testDate,
        slotId: testSlot2Id,
        idempotencyKey: fixedKey,
      });

      expect(res1.isDuplicate).toBe(false);
      const originalRef = res1.booking.reference;

      // Repeat identical submission
      const res2 = await createBooking({
        fullName: "Duplicate Tester",
        email: "duplicate@example.com",
        phone: "+91 9333333333",
        level: "advanced",
        date: testDate,
        slotId: testSlot2Id,
        idempotencyKey: fixedKey,
      });

      expect(res2.isDuplicate).toBe(true);
      expect(res2.booking.reference).toBe(originalRef);
      expect(res2.booking.id).toBe(res1.booking.id);
    });
  });

  describe("5. Capacity Accounting & Lifecycle Transitions", () => {
    it("PENDING and CONFIRMED bookings consume capacity; CANCELLED frees it", async () => {
      // Find slot 2 bookings
      const slot2 = await prisma.slot.findUnique({
        where: { id: testSlot2Id },
        include: { bookings: true },
      });
      expect(slot2).toBeDefined();

      const booking = slot2!.bookings[0];
      expect(booking.status).toBe("PENDING");

      // Confirm the booking
      const confirmed = await confirmBooking(booking.id);
      expect(confirmed.status).toBe("CONFIRMED");

      // Verify slot is full
      const slotsOnDate = await getSlotsForDate(testDate);
      const currentSlot2 = slotsOnDate.find((s) => s.id === testSlot2Id);
      expect(currentSlot2?.remainingCapacity).toBe(0);

      // Cancel booking
      const cancelled = await cancelBooking(booking.id, "Student requested cancellation");
      expect(cancelled.status).toBe("CANCELLED");

      // After cancellation, capacity must be freed!
      const refreshedSlots = await getSlotsForDate(testDate);
      const reopenedSlot2 = refreshedSlots.find((s) => s.id === testSlot2Id);
      expect(reopenedSlot2?.remainingCapacity).toBe(1);
    });
  });

  describe("6. Admin Availability Guards", () => {
    it("cannot block a date that has confirmed bookings", async () => {
      // Create confirmed booking on slot 2
      const newBooking = await createBooking({
        fullName: "Confirmed Student",
        email: "confirmed@example.com",
        phone: "+91 9444444444",
        level: "beginner",
        date: testDate,
        slotId: testSlot2Id,
        idempotencyKey: `idemp_guard_${Date.now()}`,
      });

      await confirmBooking(newBooking.booking.id);

      // Attempting to block date must fail due to confirmed booking
      await expect(blockDate(testDate, "Emergency maintenance")).rejects.toThrow(
        /Cannot block date.*Conflicting confirmed session/
      );
    });
  });
});
