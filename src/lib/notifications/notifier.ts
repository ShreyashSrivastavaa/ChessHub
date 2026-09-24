import { prisma } from "../db/prisma";
import { BRAND_CONFIG } from "@/config/brand";

export interface NotificationPayload {
  userId: string;
  type:
    | "BOOKING_CONFIRMED"
    | "PAYMENT_FAILED"
    | "BOOKING_CANCELLED"
    | "BOOKING_RESCHEDULED"
    | "HOMEWORK_ASSIGNED"
    | "COACH_NOTE_ADDED"
    | "PASSWORD_RESET"
    | "CLASS_REMINDER_24H"
    | "CLASS_REMINDER_1H";
  title: string;
  body: string;
  href?: string;
  emailData?: {
    to: string;
    subject: string;
    textBody: string;
    meetUrl?: string;
  };
}

export interface Notifier {
  send(payload: NotificationPayload): Promise<void>;
}

export class InAppNotifier implements Notifier {
  async send(payload: NotificationPayload): Promise<void> {
    try {
      await prisma.notification.create({
        data: {
          userId: payload.userId,
          type: payload.type,
          title: payload.title,
          body: payload.body,
          href: payload.href,
        },
      });
    } catch (err) {
      console.error("[InAppNotifier] Failed to create notification:", err);
    }
  }
}

export class EmailNotifier implements Notifier {
  private apiKey: string;
  private from: string;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || "";
    this.from = process.env.EMAIL_FROM || `${BRAND_CONFIG.name} <notifications@${BRAND_CONFIG.domain}>`;
  }

  async send(payload: NotificationPayload): Promise<void> {
    if (!payload.emailData) return;

    if (!this.apiKey) {
      // In development or when Resend key is not set, log clean email preview
      console.log(`\n--- [EMAIL NOTIFICATION PREVIEW] ---`);
      console.log(`To: ${payload.emailData.to}`);
      console.log(`From: ${this.from}`);
      console.log(`Subject: ${payload.emailData.subject}`);
      console.log(`Body:\n${payload.emailData.textBody}`);
      if (payload.emailData.meetUrl) {
        console.log(`Meet Link: ${payload.emailData.meetUrl}`);
      }
      console.log(`-------------------------------------\n`);
      return;
    }

    try {
      // Direct call to Resend REST API without bloated SDK
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: this.from,
          to: [payload.emailData.to],
          subject: payload.emailData.subject,
          text: `${payload.emailData.textBody}\n\n---\n${BRAND_CONFIG.name}\n${BRAND_CONFIG.tagline}`,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[EmailNotifier] Resend API error:", errorText);
      }
    } catch (err) {
      console.error("[EmailNotifier] Network error sending email:", err);
    }
  }
}

// Composite notifier that sends both in-app and email
export class CompositeNotifier implements Notifier {
  private inApp = new InAppNotifier();
  private email = new EmailNotifier();

  async send(payload: NotificationPayload): Promise<void> {
    await Promise.all([this.inApp.send(payload), this.email.send(payload)]);
  }
}

export const notifier = new CompositeNotifier();
