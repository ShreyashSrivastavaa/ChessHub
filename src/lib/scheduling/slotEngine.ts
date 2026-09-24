import { addMinutes, addDays, isBefore, isAfter, areIntervalsOverlapping, format } from "date-fns";
import { toZonedTime, fromZonedTime } from "date-fns-tz";

export interface AvailabilityRuleInput {
  weekday: number; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startMinute: number; // minutes from 00:00 (e.g. 600 for 10:00)
  endMinute: number;
  sessionTypeIds?: string | null;
  validFrom?: Date | null;
  validTo?: Date | null;
}

export interface AvailabilityExceptionInput {
  date: string; // "YYYY-MM-DD"
  kind: "BLOCKED" | "EXTRA_OPEN";
  startMinute?: number | null;
  endMinute?: number | null;
}

export interface ExistingInterval {
  startsAt: Date;
  endsAt: Date;
  status?: string;
  holdExpiresAt?: Date | null;
}

export interface CoachSchedulingSettings {
  slotBufferMinutes: number; // default 10
  minNoticeHours: number; // default 12
  maxAdvanceDays: number; // default 30
  timeZone: string; // default "Asia/Kolkata"
}

export interface SlotEngineParams {
  rules: AvailabilityRuleInput[];
  exceptions: AvailabilityExceptionInput[];
  existingBookings: ExistingInterval[];
  holds: ExistingInterval[];
  sessionType: {
    id: string;
    durationMinutes: number;
  };
  now: Date;
  settings: CoachSchedulingSettings;
}

export interface GeneratedSlot {
  startsAt: Date;
  endsAt: Date;
  dateStr: string; // "YYYY-MM-DD" in coach's timezone
  timeStr: string; // "HH:mm" in coach's timezone
  timeZone: string;
}

/**
 * Pure function to generate valid bookable slots.
 * Evaluates weekly recurrence rules, date-specific overrides/blocks, notice windows,
 * and eliminates slots overlapping confirmed bookings or active holds.
 */
export function generateSlots({
  rules,
  exceptions,
  existingBookings,
  holds,
  sessionType,
  now,
  settings,
}: SlotEngineParams): GeneratedSlot[] {
  const timeZone = settings.timeZone || "Asia/Kolkata";
  const duration = sessionType.durationMinutes;
  const buffer = settings.slotBufferMinutes;
  const slotStep = duration + buffer;

  const minNoticeTime = addMinutes(now, settings.minNoticeHours * 60);
  const maxAdvanceTime = addDays(now, settings.maxAdvanceDays);

  // Active occupied intervals = Confirmed bookings + unexpired holds
  const occupiedIntervals: { start: Date; end: Date }[] = [];

  for (const b of existingBookings) {
    if (b.status === "CONFIRMED" || b.status === "PENDING_PAYMENT") {
      occupiedIntervals.push({ start: new Date(b.startsAt), end: new Date(b.endsAt) });
    }
  }

  for (const h of holds) {
    if (h.holdExpiresAt && isAfter(new Date(h.holdExpiresAt), now)) {
      occupiedIntervals.push({ start: new Date(h.startsAt), end: new Date(h.endsAt) });
    }
  }

  const generatedSlots: GeneratedSlot[] = [];

  // Iterate over each day within [now, maxAdvanceDays]
  const startDayZoned = toZonedTime(now, timeZone);

  for (let dayOffset = 0; dayOffset <= settings.maxAdvanceDays; dayOffset++) {
    const currentZonedDate = addDays(startDayZoned, dayOffset);
    const dateStr = format(currentZonedDate, "yyyy-MM-dd");
    const weekday = currentZonedDate.getDay();

    // Check exceptions for this date
    const dayExceptions = exceptions.filter((e) => e.date === dateStr);
    const isEntireDayBlocked = dayExceptions.some(
      (e) => e.kind === "BLOCKED" && (e.startMinute == null || (e.startMinute === 0 && e.endMinute === 1440))
    );

    if (isEntireDayBlocked) {
      continue;
    }

    // Collect candidate windows for this day
    interface TimeWindow {
      startMinute: number;
      endMinute: number;
    }
    const windows: TimeWindow[] = [];

    // 1. Regular weekly rules for this weekday
    const dayRules = rules.filter((r) => {
      if (r.weekday !== weekday) return false;
      if (r.validFrom && isBefore(currentZonedDate, r.validFrom)) return false;
      if (r.validTo && isAfter(currentZonedDate, r.validTo)) return false;
      if (r.sessionTypeIds) {
        const allowedIds = r.sessionTypeIds.split(",").map((s) => s.trim());
        if (!allowedIds.includes(sessionType.id)) return false;
      }
      return true;
    });

    for (const rule of dayRules) {
      windows.push({ startMinute: rule.startMinute, endMinute: rule.endMinute });
    }

    // 2. Extra open exceptions
    for (const exc of dayExceptions) {
      if (exc.kind === "EXTRA_OPEN" && exc.startMinute != null && exc.endMinute != null) {
        windows.push({ startMinute: exc.startMinute, endMinute: exc.endMinute });
      }
    }

    // 3. Subtract partial blocked exceptions from windows
    const partialBlocks = dayExceptions.filter(
      (e) => e.kind === "BLOCKED" && e.startMinute != null && e.endMinute != null
    );

    // Generate slots within windows
    for (const win of windows) {
      let currentMinute = win.startMinute;

      while (currentMinute + duration <= win.endMinute) {
        const slotEndMinute = currentMinute + duration;

        // Check if inside any partial block
        const isBlockedByException = partialBlocks.some(
          (b) => !(slotEndMinute <= (b.startMinute ?? 0) || currentMinute >= (b.endMinute ?? 1440))
        );

        if (!isBlockedByException) {
          // Construct UTC Dates from zoned representation
          const year = currentZonedDate.getFullYear();
          const month = String(currentZonedDate.getMonth() + 1).padStart(2, "0");
          const day = String(currentZonedDate.getDate()).padStart(2, "0");
          const startH = String(Math.floor(currentMinute / 60)).padStart(2, "0");
          const startM = String(currentMinute % 60).padStart(2, "0");
          const endH = String(Math.floor(slotEndMinute / 60)).padStart(2, "0");
          const endM = String(slotEndMinute % 60).padStart(2, "0");

          const startIsoStr = `${year}-${month}-${day}T${startH}:${startM}:00`;
          const endIsoStr = `${year}-${month}-${day}T${endH}:${endM}:00`;

          const slotStartUtc = fromZonedTime(startIsoStr, timeZone);
          const slotEndUtc = fromZonedTime(endIsoStr, timeZone);

          // Validate min notice and max advance horizon
          const meetsNotice = !isBefore(slotStartUtc, minNoticeTime);
          const withinHorizon = !isAfter(slotEndUtc, maxAdvanceTime);

          if (meetsNotice && withinHorizon) {
            // Check collision with confirmed bookings or active holds
            const hasCollision = occupiedIntervals.some((occ) =>
              areIntervalsOverlapping(
                { start: slotStartUtc, end: slotEndUtc },
                { start: occ.start, end: occ.end },
                { inclusive: false } // Half-open interval comparison [start, end)
              )
            );

            if (!hasCollision) {
              generatedSlots.push({
                startsAt: slotStartUtc,
                endsAt: slotEndUtc,
                dateStr,
                timeStr: `${startH}:${startM}`,
                timeZone,
              });
            }
          }
        }

        currentMinute += slotStep;
      }
    }
  }

  // Sort slots chronologically
  return generatedSlots.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
}
