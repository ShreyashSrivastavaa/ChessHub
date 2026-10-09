import { prisma } from "@/lib/db/prisma";
import { BUSINESS_CONFIG, getPlanByLevel } from "@/config/business";
import { z } from "zod";
import crypto from "crypto";

export class SlotConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SlotConflictError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const createBookingSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[0-9\s\-()]{7,20}$/, "Please enter a valid phone number (e.g. +91 9876543210)"),
  level: z.enum(["beginner", "advanced"], {
    errorMap: () => ({ message: "Coaching level must be Beginner or Advanced" }),
  }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD"),
  slotId: z.string().min(1, "Please select an available time slot"),
  idempotencyKey: z.string().trim().min(8, "Idempotency key required"),
  message: z.string().max(1000, "Message must be under 1000 characters").optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

/**
 * Generate human-friendly reference e.g. "CH-7X8K2M"
 * Uses uppercase characters excluding confusing characters (0, O, 1, I).
 */
export async function generateBookingReference(): Promise<string> {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  for (let attempt = 0; attempt < 5; attempt++) {
    let rand = "";
    const bytes = crypto.randomBytes(6);
    for (let i = 0; i < 6; i++) {
      rand += chars[bytes[i] % chars.length];
    }
    const ref = `CH-${rand}`;
    const exists = await prisma.booking.findUnique({
      where: { reference: ref },
    });
    if (!exists) return ref;
  }
  // Fallback with timestamp suffix
  return `CH-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

/**
 * Get available dates for the public booking calendar.
 * Returns only dates starting from today up to 30 days ahead that are:
 * 1. Not admin-blocked in AvailabilityDate
 * 2. Contain at least one slot where active bookings < slot capacity
 */
export async function getAvailableDates(horizonDays = 30): Promise<string[]> {
  const todayStr = new Date().toISOString().split("T")[0];

  // Fetch blocked dates
  const blockedDates = await prisma.availabilityDate.findMany({
    where: { isBlocked: true },
    select: { date: true },
  });
  const blockedSet = new Set(blockedDates.map((b) => b.date));

  // Fetch all future slots
  const slots = await prisma.slot.findMany({
    where: {
      date: { gte: todayStr },
      isBlocked: false,
    },
    include: {
      bookings: {
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { id: true },
      },
    },
    orderBy: { startsAt: "asc" },
  });

  const availableDateSet = new Set<string>();

  for (const slot of slots) {
    if (blockedSet.has(slot.date)) continue;
    const activeCount = slot.bookings.length;
    if (activeCount < slot.capacity) {
      availableDateSet.add(slot.date);
    }
  }

  return Array.from(availableDateSet).sort();
}

/**
 * Get slots for a specific date with remaining capacity calculations.
 */
export async function getSlotsForDate(dateStr: string) {
  // Check if date is blocked
  const dateBlock = await prisma.availabilityDate.findUnique({
    where: { date: dateStr },
  });

  if (dateBlock && dateBlock.isBlocked) {
    return [];
  }

  const slots = await prisma.slot.findMany({
    where: {
      date: dateStr,
      isBlocked: false,
    },
    include: {
      bookings: {
        where: {
          status: { in: ["PENDING", "CONFIRMED"] },
        },
        select: { id: true, status: true },
      },
    },
    orderBy: { startTime: "asc" },
  });

  return slots.map((s) => {
    const activeBookings = s.bookings.length;
    const remainingCapacity = Math.max(0, s.capacity - activeBookings);
    const isAvailable = remainingCapacity > 0 && !s.isSoldOut;

    return {
      id: s.id,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      durationMinutes: s.durationMinutes,
      capacity: s.capacity,
      activeBookings,
      remainingCapacity,
      isAvailable,
    };
  });
}

/**
 * Atomically create a booking with concurrency protection,
 * idempotency safety, and price recomputation from the server.
 */
export async function createBooking(input: CreateBookingInput) {
  const parsed = createBookingSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid booking data";
    throw new ValidationError(firstError);
  }

  const { fullName, email, phone, level, date, slotId, idempotencyKey, message } = parsed.data;

  // 1. Idempotency Check: if identical key exists, return the previously created booking
  if (idempotencyKey) {
    const existing = await prisma.booking.findUnique({
      where: { idempotencyKey },
      include: { slot: true },
    });
    if (existing) {
      return {
        booking: existing,
        isDuplicate: true,
      };
    }
  }

  // 2. Reject past dates
  const todayStr = new Date().toISOString().split("T")[0];
  if (date < todayStr) {
    throw new ValidationError("Cannot book sessions in the past.");
  }

  // 3. Recompute price on server: NEVER trust browser price
  const plan = getPlanByLevel(level);
  const priceRupees = plan.priceRupees;

  // 4. Concurrency-safe atomic transaction
  return await prisma.$transaction(async (tx) => {
    // Check if date is blocked
    const dateBlock = await tx.availabilityDate.findUnique({
      where: { date },
    });
    if (dateBlock && dateBlock.isBlocked) {
      throw new SlotConflictError("This date has been marked unavailable by the coaches.");
    }

    // Lock and inspect slot
    const slot = await tx.slot.findUnique({
      where: { id: slotId },
    });

    if (!slot) {
      throw new ValidationError("The selected time slot does not exist.");
    }

    if (slot.isBlocked) {
      throw new SlotConflictError("This time slot is currently unavailable.");
    }

    // Count active bookings (PENDING + CONFIRMED) inside the transaction
    const activeBookingsCount = await tx.booking.count({
      where: {
        slotId: slot.id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (activeBookingsCount >= slot.capacity) {
      // Mark slot as sold out for future queries
      await tx.slot.update({
        where: { id: slot.id },
        data: { isSoldOut: true },
      });
      throw new SlotConflictError("This slot was just booked by another student. Please select another time.");
    }

    // Assign appropriate coach attribution (default to Shreyash for beginner, Tapesnu for advanced)
    const coachSlug = level === "advanced" ? "tapesnu" : "shreyash";
    const coach = await tx.coach.findUnique({
      where: { slug: coachSlug },
    });

    const reference = await generateBookingReference();

    const booking = await tx.booking.create({
      data: {
        reference,
        idempotencyKey,
        fullName,
        email,
        phone,
        level,
        priceRupees,
        currency: "INR",
        date: slot.date,
        timeSlot: slot.startTime,
        startsAt: slot.startsAt,
        endsAt: slot.endsAt,
        status: "PENDING",
        message: message || null,
        slotId: slot.id,
        coachId: coach?.id || null,
      },
      include: {
        slot: true,
        coach: true,
      },
    });

    // Record creation event in audit history
    await tx.bookingEvent.create({
      data: {
        bookingId: booking.id,
        eventType: "CREATED",
        performedBy: "STUDENT",
        details: JSON.stringify({
          level,
          priceRupees,
          date: slot.date,
          timeSlot: slot.startTime,
        }),
      },
    });

    // If capacity reached, flag sold out
    if (activeBookingsCount + 1 >= slot.capacity) {
      await tx.slot.update({
        where: { id: slot.id },
        data: { isSoldOut: true },
      });
    }

    return {
      booking,
      isDuplicate: false,
    };
  });
}

/**
 * Admin action: Confirm Booking
 */
export async function confirmBooking(bookingId: string, adminUserId?: string) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");

    if (booking.status === "CONFIRMED") return booking;

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED" },
    });

    await tx.bookingEvent.create({
      data: {
        bookingId,
        eventType: "CONFIRMED",
        performedBy: "ADMIN",
        details: "Booking confirmed by administrator.",
      },
    });

    if (adminUserId) {
      await tx.auditLog.create({
        data: {
          adminUserId,
          action: "CONFIRM_BOOKING",
          entity: "Booking",
          entityId: bookingId,
          details: `Confirmed booking ${booking.reference}`,
        },
      });
    }

    return updated;
  });
}

/**
 * Admin action: Cancel Booking
 * Frees up slot capacity since CANCELLED bookings do not count against capacity.
 */
export async function cancelBooking(bookingId: string, reason?: string, adminUserId?: string) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({
      where: { id: bookingId },
      include: { slot: true },
    });
    if (!booking) throw new Error("Booking not found");

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        adminNotes: reason ? `Cancelled: ${reason}` : booking.adminNotes,
      },
    });

    // Reopen slot if it was previously marked sold out
    if (booking.slotId) {
      await tx.slot.update({
        where: { id: booking.slotId },
        data: { isSoldOut: false },
      });
    }

    await tx.bookingEvent.create({
      data: {
        bookingId,
        eventType: "CANCELLED",
        performedBy: "ADMIN",
        details: reason || "Cancelled by administrator.",
      },
    });

    if (adminUserId) {
      await tx.auditLog.create({
        data: {
          adminUserId,
          action: "CANCEL_BOOKING",
          entity: "Booking",
          entityId: bookingId,
          details: `Cancelled booking ${booking.reference}. Reason: ${reason || "None specified"}`,
        },
      });
    }

    return updated;
  });
}

/**
 * Admin action: Mark Booking Completed
 */
export async function completeBooking(bookingId: string, adminUserId?: string) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: { status: "COMPLETED" },
    });

    await tx.bookingEvent.create({
      data: {
        bookingId,
        eventType: "COMPLETED",
        performedBy: "ADMIN",
        details: "Class completed.",
      },
    });

    if (adminUserId) {
      await tx.auditLog.create({
        data: {
          adminUserId,
          action: "COMPLETE_BOOKING",
          entity: "Booking",
          entityId: bookingId,
          details: `Marked booking ${booking.reference} as completed`,
        },
      });
    }

    return updated;
  });
}

/**
 * Admin action: Reschedule Booking
 * Checks for conflict on the new slot before moving.
 */
export async function rescheduleBooking(bookingId: string, newSlotId: string, adminUserId?: string) {
  return await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) throw new Error("Booking not found");

    const newSlot = await tx.slot.findUnique({ where: { id: newSlotId } });
    if (!newSlot) throw new Error("Destination slot not found");
    if (newSlot.isBlocked) throw new Error("Destination slot is blocked");

    // Check capacity on destination slot
    const activeInNewSlot = await tx.booking.count({
      where: {
        slotId: newSlot.id,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });

    if (activeInNewSlot >= newSlot.capacity) {
      throw new SlotConflictError("Destination slot does not have available capacity.");
    }

    const oldSlotId = booking.slotId;

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        slotId: newSlot.id,
        date: newSlot.date,
        timeSlot: newSlot.startTime,
        startsAt: newSlot.startsAt,
        endsAt: newSlot.endsAt,
      },
    });

    // Reopen old slot if it was sold out
    if (oldSlotId) {
      await tx.slot.update({
        where: { id: oldSlotId },
        data: { isSoldOut: false },
      });
    }

    await tx.bookingEvent.create({
      data: {
        bookingId,
        eventType: "RESCHEDULED",
        performedBy: "ADMIN",
        details: `Rescheduled to ${newSlot.date} at ${newSlot.startTime}`,
      },
    });

    if (adminUserId) {
      await tx.auditLog.create({
        data: {
          adminUserId,
          action: "RESCHEDULE_BOOKING",
          entity: "Booking",
          entityId: bookingId,
          details: `Rescheduled booking ${booking.reference} to ${newSlot.date} at ${newSlot.startTime}`,
        },
      });
    }

    return updated;
  });
}
