import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { notifier } from "@/lib/notifications/notifier";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: true });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user) {
      const rawToken = crypto.randomBytes(24).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt,
        },
      });

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`;

      await notifier.send({
        userId: user.id,
        type: "PASSWORD_RESET",
        title: "Password Reset Request",
        body: `Use this link to reset your password: ${resetUrl}`,
        emailData: {
          to: user.email,
          subject: "[TWO ROOKS] Reset your password",
          textBody: `Hello ${user.name},\n\nYou requested a password reset. Click the link below to set a new password:\n\n${resetUrl}\n\nThis link will expire in 1 hour. If you did not request this, please ignore this email.`,
        },
      });
    }

    // Always return success to prevent email enumeration
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[ForgotPassword Error]", err);
    return NextResponse.json({ success: true });
  }
}
