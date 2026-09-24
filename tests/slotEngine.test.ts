import { describe, it, expect } from "vitest";
import { generateSlots, SlotEngineParams } from "../src/lib/scheduling/slotEngine";
import { addHours, addDays } from "date-fns";

describe("Scheduling Slot Engine", () => {
  const baseSettings = {
    slotBufferMinutes: 10,
    minNoticeHours: 12,
    maxAdvanceDays: 7,
    timeZone: "Asia/Kolkata",
  };

  const defaultSessionType = {
    id: "session_foundations",
    durationMinutes: 50,
  };

  const mockNow = new Date("2026-10-01T00:00:00Z"); // Thursday morning UTC

  it("generates slots based on availability rules with buffer", () => {
    const params: SlotEngineParams = {
      rules: [
        {
          weekday: 4, // Thursday
          startMinute: 600, // 10:00 (600)
          endMinute: 720, // 12:00 (720) -> should fit 10:00-10:50 and buffer to 11:00-11:50
        },
      ],
      exceptions: [],
      existingBookings: [],
      holds: [],
      sessionType: defaultSessionType,
      now: mockNow,
      settings: { ...baseSettings, minNoticeHours: 2 },
    };

    const slots = generateSlots(params);
    expect(slots.length).toBeGreaterThanOrEqual(2);
    expect(slots[0].timeStr).toBe("10:00");
    expect(slots[1].timeStr).toBe("11:00");
  });

  it("excludes slots that do not meet minNoticeHours", () => {
    const params: SlotEngineParams = {
      rules: [
        {
          weekday: 4,
          startMinute: 600, // 10:00
          endMinute: 720, // 12:00
        },
      ],
      exceptions: [],
      existingBookings: [],
      holds: [],
      sessionType: defaultSessionType,
      now: new Date("2026-10-01T04:30:00Z"), // 10:00 IST!
      settings: { ...baseSettings, minNoticeHours: 12 },
    };

    const slots = generateSlots(params);
    // Same-day slots inside 12 hours notice must not be returned
    const sameDaySlots = slots.filter((s) => s.dateStr === "2026-10-01");
    expect(sameDaySlots.length).toBe(0);
  });

  it("excludes slots that collide with confirmed bookings", () => {
    const params: SlotEngineParams = {
      rules: [
        {
          weekday: 5, // Friday
          startMinute: 600, // 10:00
          endMinute: 720, // 12:00
        },
      ],
      exceptions: [],
      existingBookings: [],
      holds: [],
      sessionType: defaultSessionType,
      now: mockNow,
      settings: baseSettings,
    };

    const initialSlots = generateSlots(params);
    expect(initialSlots.length).toBeGreaterThan(0);

    const firstSlot = initialSlots[0];

    // Book the first slot
    const withBooking = generateSlots({
      ...params,
      existingBookings: [
        {
          startsAt: firstSlot.startsAt,
          endsAt: firstSlot.endsAt,
          status: "CONFIRMED",
        },
      ],
    });

    expect(withBooking.length).toBe(initialSlots.length - 1);
    expect(withBooking.some((s) => s.timeStr === firstSlot.timeStr && s.dateStr === firstSlot.dateStr)).toBe(false);
  });

  it("respects active 10-minute holds", () => {
    const params: SlotEngineParams = {
      rules: [
        {
          weekday: 5,
          startMinute: 600,
          endMinute: 720,
        },
      ],
      exceptions: [],
      existingBookings: [],
      holds: [],
      sessionType: defaultSessionType,
      now: mockNow,
      settings: baseSettings,
    };

    const initialSlots = generateSlots(params);
    const targetSlot = initialSlots[0];

    // Add an active unexpired hold
    const withHold = generateSlots({
      ...params,
      holds: [
        {
          startsAt: targetSlot.startsAt,
          endsAt: targetSlot.endsAt,
          holdExpiresAt: addHours(mockNow, 1), // active hold
        },
      ],
    });

    expect(withHold.some((s) => s.timeStr === targetSlot.timeStr && s.dateStr === targetSlot.dateStr)).toBe(false);

    // If hold has expired, the slot should be available again
    const withExpiredHold = generateSlots({
      ...params,
      holds: [
        {
          startsAt: targetSlot.startsAt,
          endsAt: targetSlot.endsAt,
          holdExpiresAt: new Date(mockNow.getTime() - 1000), // expired hold
        },
      ],
    });

    expect(withExpiredHold.some((s) => s.timeStr === targetSlot.timeStr && s.dateStr === targetSlot.dateStr)).toBe(true);
  });

  it("respects blocked exceptions for specific dates", () => {
    const params: SlotEngineParams = {
      rules: [
        {
          weekday: 5,
          startMinute: 600,
          endMinute: 720,
        },
      ],
      exceptions: [
        {
          date: "2026-10-02",
          kind: "BLOCKED",
        },
      ],
      existingBookings: [],
      holds: [],
      sessionType: defaultSessionType,
      now: mockNow,
      settings: baseSettings,
    };

    const slots = generateSlots(params);
    expect(slots.filter((s) => s.dateStr === "2026-10-02").length).toBe(0);
  });
});
