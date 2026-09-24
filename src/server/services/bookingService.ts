import { prisma } from "@/lib/db/prisma";
import { generateSlots } from "@/lib/scheduling/slotEngine";
import { POLICY_CONFIG } from "@/config/policy";
import { notifier } from "@/lib/notifications/notifier";
import { areIntervalsOverlapping, isBefore, addHours, format } from "date-fns";

export interface CreateBookingInput {
  coachSlug: string;
  sessionTypeId: string;
  startsAt: Date;
  studentId: string;
  bookedByUserId: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export async function getCoachSlots(coachSlug: string, sessionTypeId: string) {
  const coach = await prisma.coach.findUnique({
    where: { slug: coachSlug },
    include: {
      availabilityRules: true,
      exceptions: true,
    },
  });

  if (!coach || !coach.isActive) {
    throw new Error("Coach not found or unavailable");
  }

  const sessionType = await prisma.sessionType.findUnique({
    where: { id: sessionTypeId },
  });

  if (!sessionType || !sessionType.isActive) {
    throw new Error("Session type not found or inactive");
  }

  const now = new Date();

  // Lazy cleanup of stale holds
  await prisma.booking.updateMany({
    where: {
      status: "PENDING_PAYMENT",
      holdExpiresAt: { lt: now },
    },
    data: {
      status: "EXPIRED",
    },
  });

  // Query existing active bookings and holds
  const existingBookings = await prisma.booking.findMany({
    where: {
      coachId: coach.id,
      status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
      endsAt: { gt: now },
    },
    select: {
      startsAt: true,
      endsAt: true,
      status: true,
      holdExpiresAt: true,
    },
  });

  return generateSlots({
    rules: coach.availabilityRules,
    exceptions: coach.exceptions.map((e) => ({
      date: e.date,
      kind: e.kind as "BLOCKED" | "EXTRA_OPEN",
      startMinute: e.startMinute,
      endMinute: e.endMinute,
    })),
    existingBookings,
    holds: existingBookings.filter((b) => b.status === "PENDING_PAYMENT"),
    sessionType: {
      id: sessionType.id,
      durationMinutes: sessionType.durationMinutes,
    },
    now,
    settings: {
      slotBufferMinutes: coach.slotBufferMinutes,
      minNoticeHours: coach.minNoticeHours,
      maxAdvanceDays: coach.maxAdvanceDays,
      timeZone: coach.timeZone,
    },
  });
}

function generateBookingReference(): string {
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `TR-${randNum}`;
}

export async function createPendingBooking(input: CreateBookingInput) {
  const coach = await prisma.coach.findUnique({
    where: { slug: input.coachSlug },
  });

  if (!coach || !coach.isActive) {
    throw new Error("Coach not found");
  }

  const sessionType = await prisma.sessionType.findUnique({
    where: { id: input.sessionTypeId },
  });

  if (!sessionType || !sessionType.isActive) {
    throw new Error("Session type not found");
  }

  const startsAt = new Date(input.startsAt);
  const endsAt = new Date(startsAt.getTime() + sessionType.durationMinutes * 60000);
  const now = new Date();

  // Validate notice window
  const minNoticeTime = addHours(now, coach.minNoticeHours);
  if (isBefore(startsAt, minNoticeTime)) {
    throw new Error(`Classes require at least ${coach.minNoticeHours} hours advance notice.`);
  }

  // Transaction with lock/re-check to prevent race conditions
  return prisma.$transaction(async (tx) => {
    // 1. Expire stale holds
    await tx.booking.updateMany({
      where: {
        status: "PENDING_PAYMENT",
        holdExpiresAt: { lt: now },
      },
      data: { status: "EXPIRED" },
    });

    // 2. Check coach collision
    const coachCollisions = await tx.booking.findMany({
      where: {
        coachId: coach.id,
        status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });

    if (coachCollisions.length > 0) {
      throw new Error("That slot was just booked by another student. Please pick another time.");
    }

    // 3. Check student collision
    const studentCollisions = await tx.booking.findMany({
      where: {
        studentId: input.studentId,
        status: { in: ["PENDING_PAYMENT", "CONFIRMED"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });

    if (studentCollisions.length > 0) {
      throw new Error("This student already has an active session booked at this time.");
    }

    const holdExpiresAt = new Date(now.getTime() + POLICY_CONFIG.slotHoldMinutes * 60000);
    const reference = generateBookingReference();

    const booking = await tx.booking.create({
      data: {
        reference,
        studentId: input.studentId,
        bookedByUserId: input.bookedByUserId,
        coachId: coach.id,
        sessionTypeId: sessionType.id,
        startsAt,
        endsAt,
        status: "PENDING_PAYMENT",
        holdExpiresAt,
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        meetUrl: coach.defaultMeetUrl,
      },
      include: {
        coach: true,
        sessionType: true,
        student: true,
      },
    });

    return booking;
  });
}

export async function confirmBooking(bookingId: string, paymentDetails?: { providerPaymentId?: string }) {
  const booking = await prisma.$transaction(async (tx) => {
    const b = await tx.booking.findUnique({
      where: { id: bookingId },
      include: {
        coach: { include: { user: true } },
        sessionType: true,
        student: true,
        bookedByUser: true,
      },
    });

    if (!b) throw new Error("Booking not found");

    if (b.status === "CONFIRMED") {
      return b; // Idempotent
    }

    const updated = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        holdExpiresAt: null,
      },
      include: {
        coach: { include: { user: true } },
        sessionType: true,
        student: true,
        bookedByUser: true,
      },
    });

    // Mark payment captured if exists
    if (paymentDetails?.providerPaymentId) {
      await tx.payment.updateMany({
        where: { bookingId },
        data: {
          status: "CAPTURED",
          providerPaymentId: paymentDetails.providerPaymentId,
        },
      });
    }

    return updated;
  });

  // Send notifications
  const formattedDate = format(booking.startsAt, "EEEE, MMMM d, yyyy");
  const formattedTime = format(booking.startsAt, "HH:mm");
  const resolvedMeetUrl = booking.meetUrl || booking.coach.defaultMeetUrl;

  await notifier.send({
    userId: booking.bookedByUserId,
    type: "BOOKING_CONFIRMED",
    title: "Class Confirmed!",
    body: `Your 1:1 session with ${booking.coach.displayName} is confirmed for ${formattedDate} at ${formattedTime} IST.`,
    href: `/app/classes/${booking.id}`,
    emailData: {
      to: booking.bookedByUser.email,
      subject: `[TWO ROOKS] Confirmed: 1:1 with Coach ${booking.coach.displayName} (${booking.reference})`,
      textBody: `Hello ${booking.bookedByUser.name},\n\nYour 1:1 chess coaching session is confirmed!\n\nReference: ${booking.reference}\nCoach: ${booking.coach.displayName}\nStudent: ${booking.student.displayName}\nDate & Time: ${formattedDate} at ${formattedTime} IST\nDuration: ${booking.sessionType.durationMinutes} minutes\n\nGoogle Meet Link: ${resolvedMeetUrl}\n(The link will become active 10 minutes prior to class start).\n\nNeed to reschedule? You can reschedule free of charge up to 12 hours prior directly from your dashboard: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/app`,
      meetUrl: resolvedMeetUrl,
    },
  });

  return booking;
}

export async function cancelBooking(bookingId: string, requestedByUserId: string, reason?: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      coach: { include: { user: true } },
      bookedByUser: true,
      payments: true,
    },
  });

  if (!booking) throw new Error("Booking not found");

  const isOwner = booking.bookedByUserId === requestedByUserId;
  const isCoach = booking.coach.userId === requestedByUserId;

  if (!isOwner && !isCoach) {
    throw new Error("Unauthorized to cancel this booking");
  }

  // Check 12-hour cancellation notice policy
  const now = new Date();
  const minNoticeTime = addHours(now, POLICY_CONFIG.cancelNoticeHours);

  if (isBefore(booking.startsAt, minNoticeTime) && isOwner) {
    throw new Error(
      `Cancellations must be requested at least ${POLICY_CONFIG.cancelNoticeHours} hours before class start.`
    );
  }

  const cancelled = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
      cancelledAt: now,
      cancelledBy: isCoach ? "COACH" : "STUDENT",
      cancelReason: reason || "Cancelled per user request",
    },
  });

  // Mark payments as REFUND_DUE if captured
  await prisma.payment.updateMany({
    where: { bookingId, status: "CAPTURED" },
    data: { status: "REFUND_DUE" },
  });

  // Notify student
  await notifier.send({
    userId: booking.bookedByUserId,
    type: "BOOKING_CANCELLED",
    title: "Class Cancelled",
    body: `Your booking (${booking.reference}) has been cancelled.`,
    href: "/app/classes",
    emailData: {
      to: booking.bookedByUser.email,
      subject: `[TWO ROOKS] Session Cancelled: ${booking.reference}`,
      textBody: `Your session (${booking.reference}) on ${format(booking.startsAt, "PPpp")} has been cancelled.\nReason: ${reason || "Per policy"}.`,
    },
  });

  return cancelled;
}
