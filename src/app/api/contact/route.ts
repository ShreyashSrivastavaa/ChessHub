import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
  level: z.string().optional(),
  website_trap: z.string().optional(), // Honeypot field for bot detection
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = contactSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid contact form input" }, { status: 400 });
    }

    // Honeypot check
    if (parsed.data.website_trap && parsed.data.website_trap.length > 0) {
      return NextResponse.json({ success: true });
    }

    // Persist as audit log entry
    await prisma.auditLog.create({
      data: {
        action: "CONTACT_INQUIRY",
        entity: "Contact",
        entityId: parsed.data.email,
        details: JSON.stringify({
          name: parsed.data.name,
          email: parsed.data.email,
          level: parsed.data.level,
          message: parsed.data.message,
        }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to record message";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
