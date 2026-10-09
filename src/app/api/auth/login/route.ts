import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/security/rateLimiter";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Rate limiting on login attempts: max 5 attempts per minute per IP
    const forwardedFor = request.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";
    const rateLimit = await checkRateLimit(`login:${ip}`, 5, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: "Too many login attempts. Please wait 1 minute before trying again.",
          resetAt: rateLimit.resetAt,
        },
        { status: 429 }
      );
    }

    const json = await request.json();
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid email or password format." }, { status: 400 });
    }

    const email = parsed.data.email.toLowerCase().trim();

    // Check AdminUser first, then User
    let account = await prisma.adminUser.findUnique({
      where: { email },
    });

    if (!account) {
      account = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!account) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const passwordMatch = await verifyPassword(parsed.data.password, account.passwordHash);
    if (!passwordMatch) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    await createSession({
      id: account.id,
      email: account.email,
      name: account.name,
      role: account.role as "STUDENT" | "COACH" | "ADMIN",
    });

    // Record login in audit log if admin
    if (account.role === "ADMIN") {
      await prisma.auditLog.create({
        data: {
          adminUserId: account.id,
          action: "ADMIN_LOGIN",
          entity: "AdminUser",
          entityId: account.id,
          ipAddress: ip,
          details: `Admin login successful for ${account.email}`,
        },
      });
    }

    return NextResponse.json({
      user: {
        id: account.id,
        email: account.email,
        name: account.name,
        role: account.role,
      },
    });
  } catch (err: unknown) {
    console.error("POST /api/auth/login error:", err);
    return NextResponse.json({ error: "Login service error. Please retry." }, { status: 500 });
  }
}
