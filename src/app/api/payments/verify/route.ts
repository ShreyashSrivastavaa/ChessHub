import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/server/services/paymentService";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookingId, providerOrderId, providerPaymentId, signature } = await request.json();

    if (!bookingId || !providerOrderId || !providerPaymentId || !signature) {
      return NextResponse.json({ error: "Missing required payment verification parameters" }, { status: 400 });
    }

    const confirmedBooking = await verifyPayment({
      bookingId,
      providerOrderId,
      providerPaymentId,
      signature,
    });

    return NextResponse.json({ success: true, booking: confirmedBooking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
