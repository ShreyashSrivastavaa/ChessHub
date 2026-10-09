import { BUSINESS_CONFIG } from "@/config/business";

export interface BookingNotificationDetails {
  reference: string;
  fullName: string;
  email: string;
  phone: string;
  level: string;
  priceRupees: number;
  date: string;
  timeSlot: string;
  message?: string | null;
}

export async function sendBookingNotifications(booking: BookingNotificationDetails) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || `Chess Hub <notifications@chesshub.in>`;

  if (!apiKey) {
    // Email provider is not configured. Do not claim an email was sent.
    return { sent: false, reason: "No email provider configured" };
  }

  const coachName = booking.level.toLowerCase() === "advanced" ? "Tapesnu" : "Shreyash";

  const studentSubject = `[Chess Hub] Booking Request Received: ${booking.reference}`;
  const studentBody = `Hi ${booking.fullName},

We have received your booking request for ${booking.level.toUpperCase()} Chess Coaching!

Booking Details:
- Reference: ${booking.reference}
- Level: ${booking.level === "advanced" ? "Advanced Coaching (₹800/session)" : "Beginner Coaching (₹500/session)"}
- Date: ${booking.date}
- Time Slot: ${booking.timeSlot} (Asia/Kolkata)
- Status: PENDING (Awaiting Direct Contact)

NEXT STEP:
To confirm your session and discuss payment arrangements, please contact the coaches directly:
- Email: ${BUSINESS_CONFIG.email}
- Call/WhatsApp: ${BUSINESS_CONFIG.phone} (${BUSINESS_CONFIG.contactCoachName})

Please mention your booking reference (${booking.reference}) when you reach out.
Note: Payments are not processed online. All arrangements are handled directly with the coaches.

Warm regards,
Shreyash & Tapesnu
Chess Hub — ${BUSINESS_CONFIG.tagline}`;

  const adminSubject = `[Chess Hub] New Booking Request: ${booking.reference} (${booking.fullName})`;
  const adminBody = `New booking request received on Chess Hub!

Student: ${booking.fullName}
Email: ${booking.email}
Phone: ${booking.phone}
Level: ${booking.level.toUpperCase()}
Fee: ₹${booking.priceRupees}
Date: ${booking.date}
Time Slot: ${booking.timeSlot}
Reference: ${booking.reference}
Notes/Message: ${booking.message || "None"}

Please look out for direct communication from the student to finalize payment and confirm the booking in your Admin Dashboard.`;

  try {
    // Send student acknowledgement
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [booking.email],
        subject: studentSubject,
        text: studentBody,
      }),
    });

    // Send admin notification
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [BUSINESS_CONFIG.email],
        subject: adminSubject,
        text: adminBody,
      }),
    });

    return { sent: true };
  } catch (error) {
    console.error("Failed to deliver notification emails:", error);
    return { sent: false, error };
  }
}
