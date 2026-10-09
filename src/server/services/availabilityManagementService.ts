import { prisma } from "@/lib/db/prisma";

export class AvailabilityGuardError extends Error {
  public conflictingBookings?: any[];
  constructor(message: string, conflictingBookings?: any[]) {
    super(message);
    this.name = "AvailabilityGuardError";
    this.conflictingBookings = conflictingBookings;
  }
}

/**
 * Configure or create a slot on a given date.
 * Guard: Cannot reduce capacity below existing active bookings.
 */
export async function upsertSlot(input: {
  id?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  durationMinutes?: number;
  capacity?: number;
  isBlocked?: boolean;
  isSoldOut?: boolean;
  adminUserId?: string;
}) {
  const duration = input.durationMinutes || 60;
  const capacity = input.capacity !== undefined ? Math.max(0, input.capacity) : 1;

  // Calculate UTC timestamps based on Asia/Kolkata
  const startsAt = new Date(`${input.date}T${input.startTime}:00+05:30`);
  const endsAt = new Date(startsAt.getTime() + duration * 60 * 1000);

  const endH = String(new Date(endsAt.getTime() + 5.5 * 3600 * 1000).getUTCHours()).padStart(2, "0");
  const endM = String(new Date(endsAt.getTime() + 5.5 * 3600 * 1000).getUTCMinutes()).padStart(2, "0");
  const endTime = input.endTime || `${endH}:${endM}`;

  return await prisma.$transaction(async (tx) => {
    let existingSlot = null;
    if (input.id) {
      existingSlot = await tx.slot.findUnique({
        where: { id: input.id },
        include: {
          bookings: {
            where: { status: { in: ["PENDING", "CONFIRMED"] } },
          },
        },
      });
    } else {
      existingSlot = await tx.slot.findUnique({
        where: { date_startTime: { date: input.date, startTime: input.startTime } },
        include: {
          bookings: {
            where: { status: { in: ["PENDING", "CONFIRMED"] } },
          },
        },
      });
    }

    if (existingSlot) {
      const activeBookingsCount = existingSlot.bookings.length;

      // GUARD: Cannot reduce capacity below active bookings
      if (input.capacity !== undefined && input.capacity < activeBookingsCount) {
        throw new AvailabilityGuardError(
          `Cannot reduce slot capacity to ${input.capacity}. There are currently ${activeBookingsCount} active bookings occupying this slot.`
        );
      }

      // GUARD: Cannot block slot if confirmed bookings exist
      if (input.isBlocked) {
        const confirmedBookings = existingSlot.bookings.filter((b) => b.status === "CONFIRMED");
        if (confirmedBookings.length > 0) {
          throw new AvailabilityGuardError(
            `Cannot block slot. It has ${confirmedBookings.length} confirmed booking(s). Please reschedule or cancel the booking(s) first.`,
            confirmedBookings
          );
        }
      }

      const updated = await tx.slot.update({
        where: { id: existingSlot.id },
        data: {
          endTime,
          durationMinutes: duration,
          capacity: input.capacity !== undefined ? input.capacity : existingSlot.capacity,
          isBlocked: input.isBlocked !== undefined ? input.isBlocked : existingSlot.isBlocked,
          isSoldOut: input.isSoldOut !== undefined ? input.isSoldOut : existingSlot.isSoldOut,
        },
      });

      if (input.adminUserId) {
        await tx.auditLog.create({
          data: {
            adminUserId: input.adminUserId,
            action: "UPDATE_SLOT",
            entity: "Slot",
            entityId: updated.id,
            details: `Updated slot ${updated.date} ${updated.startTime} (Capacity: ${updated.capacity}, Blocked: ${updated.isBlocked})`,
          },
        });
      }

      return updated;
    }

    // Create new slot
    const created = await tx.slot.create({
      data: {
        date: input.date,
        startTime: input.startTime,
        endTime,
        startsAt,
        endsAt,
        durationMinutes: duration,
        capacity,
        isBlocked: input.isBlocked || false,
        isSoldOut: input.isSoldOut || false,
      },
    });

    if (input.adminUserId) {
      await tx.auditLog.create({
        data: {
          adminUserId: input.adminUserId,
          action: "CREATE_SLOT",
          entity: "Slot",
          entityId: created.id,
          details: `Created new slot on ${created.date} at ${created.startTime} (Capacity: ${created.capacity})`,
        },
      });
    }

    return created;
  });
}

/**
 * Block an entire date.
 * Guard: Cannot block date if confirmed bookings exist on this date.
 */
export async function blockDate(date: string, reason?: string, adminUserId?: string) {
  return await prisma.$transaction(async (tx) => {
    // Check for confirmed bookings on this date
    const confirmedBookings = await tx.booking.findMany({
      where: {
        date,
        status: "CONFIRMED",
      },
      select: {
        id: true,
        reference: true,
        fullName: true,
        timeSlot: true,
      },
    });

    if (confirmedBookings.length > 0) {
      const summary = confirmedBookings.map((b) => `${b.reference} (${b.fullName} at ${b.timeSlot})`).join(", ");
      throw new AvailabilityGuardError(
        `Cannot block date ${date}. Conflicting confirmed session(s) exist: ${summary}. Please reschedule or cancel them first.`,
        confirmedBookings
      );
    }

    const record = await tx.availabilityDate.upsert({
      where: { date },
      create: {
        date,
        isBlocked: true,
        reason: reason || "Blocked by administrator",
      },
      update: {
        isBlocked: true,
        reason: reason || "Blocked by administrator",
      },
    });

    // Also mark individual slots on this date as blocked
    await tx.slot.updateMany({
      where: { date },
      data: { isBlocked: true },
    });

    if (adminUserId) {
      await tx.auditLog.create({
        data: {
          adminUserId,
          action: "BLOCK_DATE",
          entity: "AvailabilityDate",
          entityId: record.id,
          details: `Blocked date ${date}. Reason: ${reason || "None"}`,
        },
      });
    }

    return record;
  });
}

/**
 * Reopen a blocked date.
 */
export async function unblockDate(date: string, adminUserId?: string) {
  return await prisma.$transaction(async (tx) => {
    const record = await tx.availabilityDate.upsert({
      where: { date },
      create: {
        date,
        isBlocked: false,
      },
      update: {
        isBlocked: false,
        reason: null,
      },
    });

    // Reopen non-conflicted slots on this date
    await tx.slot.updateMany({
      where: { date },
      data: { isBlocked: false },
    });

    if (adminUserId) {
      await tx.auditLog.create({
        data: {
          adminUserId,
          action: "UNBLOCK_DATE",
          entity: "AvailabilityDate",
          entityId: record.id,
          details: `Reopened date ${date}`,
        },
      });
    }

    return record;
  });
}

/**
 * Generate slots for a configurable horizon (e.g. 14, 30, or 60 days)
 * based on recurring weekly availability rules.
 * Respects date-level overrides and never overwrites existing active slots or bookings.
 */
export async function generateRecurringSlots(horizonDays = 30, adminUserId?: string) {
  const rules = await prisma.availabilityRule.findMany({
    where: { isActive: true },
  });

  const today = new Date();
  let generatedCount = 0;

  for (let d = 1; d <= horizonDays; d++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + d);

    const dayOfWeek = targetDate.getDay();
    const dateStr = targetDate.toISOString().split("T")[0];

    // Check if date is blocked in overrides
    const dateOverride = await prisma.availabilityDate.findUnique({
      where: { date: dateStr },
    });
    if (dateOverride && dateOverride.isBlocked) continue;

    // Find rules for this day of week
    const matchingRules = rules.filter((r) => r.dayOfWeek === dayOfWeek);

    for (const rule of matchingRules) {
      // Step from startTime to endTime in increments of duration
      const [startH, startM] = rule.startTime.split(":").map(Number);
      const [endH, endM] = rule.endTime.split(":").map(Number);

      let currentMinute = startH * 60 + startM;
      const endMinute = endH * 60 + endM;

      while (currentMinute + rule.duration <= endMinute) {
        const h = Math.floor(currentMinute / 60);
        const m = currentMinute % 60;
        const timeStr = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

        const nextMinute = currentMinute + rule.duration;
        const nextH = Math.floor(nextMinute / 60);
        const nextM = nextMinute % 60;
        const endTimeStr = `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;

        const startsAt = new Date(`${dateStr}T${timeStr}:00+05:30`);
        const endsAt = new Date(`${dateStr}T${endTimeStr}:00+05:30`);

        // Check if slot exists already
        const existing = await prisma.slot.findUnique({
          where: { date_startTime: { date: dateStr, startTime: timeStr } },
        });

        if (!existing) {
          await prisma.slot.create({
            data: {
              date: dateStr,
              startTime: timeStr,
              endTime: endTimeStr,
              startsAt,
              endsAt,
              durationMinutes: rule.duration,
              capacity: rule.capacity,
              isBlocked: false,
              isSoldOut: false,
            },
          });
          generatedCount++;
        }

        currentMinute += rule.duration;
      }
    }
  }

  if (adminUserId) {
    await prisma.auditLog.create({
      data: {
        adminUserId,
        action: "GENERATE_RECURRING_SLOTS",
        entity: "Slot",
        details: `Generated ${generatedCount} slots across ${horizonDays}-day horizon from weekly rules.`,
      },
    });
  }

  return { generatedCount };
}
