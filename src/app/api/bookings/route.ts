import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  getAvailableDates,
  getSlotsForDate,
  SlotConflictError,
  ValidationError,
} from "@/server/services/bookingPlatformService";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { sendBookingNotifications } from "@/lib/notifications/notifier";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (date) {
      const slots = await getSlotsForDate(date);
      return NextResponse.json({ date, slots });
    }

    const availableDates = await getAvailableDates();
    return NextResponse.json({ availableDates });
  } catch (err: unknown) {
    console.error("GET /api/bookings error:", err);
    return NextResponse.json(
      { error: "Failed to retrieve availability information." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. IP-based Rate Limiting (10 booking submissions per minute per IP)
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const rateLimit = await checkRateLimit(`booking:${ip}`, 10, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many booking requests. Please wait a moment before trying again.",
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    // 2. Parse & Validate Payload
    const json = await request.json();
    const result = await createBooking(json);

    // 3. Dispatch notifications asynchronously without blocking response
    sendBookingNotifications({
      reference: result.booking.reference,
      fullName: result.booking.fullName,
      email: result.booking.email,
      phone: result.booking.phone,
      level: result.booking.level,
      priceRupees: result.booking.priceRupees,
      date: result.booking.date,
      timeSlot: result.booking.timeSlot,
      message: result.booking.message,
    }).catch((e) => console.error("Notification dispatch error:", e));

    return NextResponse.json({
      success: true,
      booking: result.booking,
      isDuplicate: result.isDuplicate,
    });
  } catch (err: unknown) {
    if (err instanceof ValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof SlotConflictError) {
      return NextResponse.json({ error: err.message, conflict: true }, { status: 409 });
    }
    console.error("POST /api/bookings unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred while reserving your session. Please retry." },
      { status: 500 }
    );
  }
}
