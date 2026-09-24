import { NextRequest, NextResponse } from "next/server";
import { getCoachSlots, createPendingBooking } from "@/server/services/bookingService";
import { getSession } from "@/lib/auth/session";
import { z } from "zod";

const createBookingSchema = z.object({
  coachSlug: z.string().min(1),
  sessionTypeId: z.string().min(1),
  startsAt: z.string().datetime(),
  studentId: z.string().min(1),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coachSlug = searchParams.get("coach");
    const sessionTypeId = searchParams.get("sessionType");

    if (!coachSlug || !sessionTypeId) {
      return NextResponse.json(
        { error: "Both 'coach' and 'sessionType' query parameters are required" },
        { status: 400 }
      );
    }

    const slots = await getCoachSlots(coachSlug, sessionTypeId);
    return NextResponse.json({ slots });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load slots";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Authentication required to book a session" }, { status: 401 });
    }

    const json = await request.json();
    const parsed = createBookingSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid booking parameters", details: parsed.error.format() }, { status: 400 });
    }

    const booking = await createPendingBooking({
      coachSlug: parsed.data.coachSlug,
      sessionTypeId: parsed.data.sessionTypeId,
      startsAt: new Date(parsed.data.startsAt),
      studentId: parsed.data.studentId,
      bookedByUserId: session.id,
      utmSource: parsed.data.utmSource,
      utmMedium: parsed.data.utmMedium,
      utmCampaign: parsed.data.utmCampaign,
    });

    return NextResponse.json({ booking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unable to reserve slot";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
