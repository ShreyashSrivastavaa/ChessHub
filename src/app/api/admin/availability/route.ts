import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  upsertSlot,
  blockDate,
  unblockDate,
  generateRecurringSlots,
  AvailabilityGuardError,
} from "@/server/services/availabilityManagementService";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "UPSERT_SLOT": {
        const slot = await upsertSlot({
          id: body.id,
          date: body.date,
          startTime: body.startTime,
          endTime: body.endTime,
          durationMinutes: body.durationMinutes,
          capacity: body.capacity,
          isBlocked: body.isBlocked,
          isSoldOut: body.isSoldOut,
          adminUserId: session.id,
        });
        return NextResponse.json({ success: true, slot });
      }

      case "BLOCK_DATE": {
        const record = await blockDate(body.date, body.reason, session.id);
        return NextResponse.json({ success: true, record });
      }

      case "UNBLOCK_DATE": {
        const record = await unblockDate(body.date, session.id);
        return NextResponse.json({ success: true, record });
      }

      case "GENERATE_RECURRING": {
        const horizon = body.horizonDays ? Number(body.horizonDays) : 30;
        const result = await generateRecurringSlots(horizon, session.id);
        return NextResponse.json({ success: true, ...result });
      }

      case "ADD_RULE": {
        const rule = await prisma.availabilityRule.create({
          data: {
            dayOfWeek: Number(body.dayOfWeek),
            startTime: body.startTime,
            endTime: body.endTime,
            duration: Number(body.duration || 60),
            capacity: Number(body.capacity || 1),
            isActive: true,
          },
        });
        await prisma.auditLog.create({
          data: {
            adminUserId: session.id,
            action: "ADD_RULE",
            entity: "AvailabilityRule",
            entityId: rule.id,
            details: `Added rule for day ${rule.dayOfWeek} (${rule.startTime}-${rule.endTime})`,
          },
        });
        return NextResponse.json({ success: true, rule });
      }

      case "DELETE_RULE": {
        await prisma.availabilityRule.delete({
          where: { id: body.ruleId },
        });
        await prisma.auditLog.create({
          data: {
            adminUserId: session.id,
            action: "DELETE_RULE",
            entity: "AvailabilityRule",
            entityId: body.ruleId,
            details: `Deleted rule ${body.ruleId}`,
          },
        });
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error("POST /api/admin/availability error:", error);
    if (error instanceof AvailabilityGuardError) {
      return NextResponse.json(
        {
          error: error.message,
          conflictingBookings: error.conflictingBookings,
          guardViolated: true,
        },
        { status: 400 }
      );
    }
    const message = error instanceof Error ? error.message : "Failed to execute availability action";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
