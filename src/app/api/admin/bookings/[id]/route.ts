import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  confirmBooking,
  cancelBooking,
  completeBooking,
  rescheduleBooking,
} from "@/server/services/bookingPlatformService";
import { prisma } from "@/lib/db/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: bookingId } = await params;
    const body = await request.json();
    const { action, reason, newSlotId, note } = body;

    let updated = null;

    switch (action) {
      case "CONFIRM":
        updated = await confirmBooking(bookingId, session.id);
        break;

      case "CANCEL":
        updated = await cancelBooking(bookingId, reason, session.id);
        break;

      case "COMPLETE":
        updated = await completeBooking(bookingId, session.id);
        break;

      case "RESCHEDULE":
        if (!newSlotId) {
          return NextResponse.json({ error: "newSlotId is required to reschedule" }, { status: 400 });
        }
        updated = await rescheduleBooking(bookingId, newSlotId, session.id);
        break;

      case "UPDATE_NOTE":
        updated = await prisma.booking.update({
          where: { id: bookingId },
          data: { adminNotes: note },
        });
        await prisma.bookingEvent.create({
          data: {
            bookingId,
            eventType: "NOTE_UPDATED",
            performedBy: "ADMIN",
            details: `Admin note updated: ${note}`,
          },
        });
        await prisma.auditLog.create({
          data: {
            adminUserId: session.id,
            action: "UPDATE_NOTE",
            entity: "Booking",
            entityId: bookingId,
            details: `Updated note on booking ${bookingId}`,
          },
        });
        break;

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, booking: updated });
  } catch (error: unknown) {
    console.error("PATCH /api/admin/bookings/[id] error:", error);
    const message = error instanceof Error ? error.message : "Failed to execute booking action";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
