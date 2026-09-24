import { prisma } from "@/lib/db/prisma";
import { getPaymentProvider } from "@/lib/payments/provider";
import { confirmBooking } from "./bookingService";

export async function initiatePayment(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      sessionType: true,
      coach: true,
      bookedByUser: true,
    },
  });

  if (!booking) throw new Error("Booking not found");

  const amountPaise = booking.sessionType.pricePaise;

  // Free trial class handler (₹0)
  if (amountPaise === 0) {
    const confirmed = await confirmBooking(bookingId);
    return {
      free: true,
      booking: confirmed,
    };
  }

  const provider = getPaymentProvider();
  const { providerOrderId, clientPayload } = await provider.createOrder({
    bookingId: booking.id,
    amountPaise,
    currency: "INR",
    receipt: booking.reference,
    notes: {
      bookingId: booking.id,
      coach: booking.coach.displayName,
      sessionType: booking.sessionType.name,
    },
  });

  // Create payment record
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      provider: process.env.PAYMENT_PROVIDER || "mock",
      providerOrderId,
      amountPaise,
      currency: "INR",
      status: "CREATED",
    },
  });

  return {
    free: false,
    providerOrderId,
    clientPayload,
  };
}

export async function verifyPayment(input: {
  bookingId: string;
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}) {
  const provider = getPaymentProvider();
  const isValid = provider.verifyClientSignature({
    providerOrderId: input.providerOrderId,
    providerPaymentId: input.providerPaymentId,
    signature: input.signature,
  });

  if (!isValid) {
    await prisma.payment.updateMany({
      where: { providerOrderId: input.providerOrderId },
      data: { status: "FAILED", failureReason: "Invalid client signature" },
    });
    throw new Error("Invalid payment signature verification");
  }

  // Update payment status and confirm booking
  await prisma.payment.updateMany({
    where: { providerOrderId: input.providerOrderId },
    data: {
      status: "AUTHORIZED",
      providerPaymentId: input.providerPaymentId,
    },
  });

  return confirmBooking(input.bookingId, {
    providerPaymentId: input.providerPaymentId,
  });
}

export async function processWebhook(rawBody: string, headers: Headers) {
  const provider = getPaymentProvider();
  const event = await provider.parseAndVerifyWebhook(rawBody, headers);

  // Idempotency check: have we already processed this provider event?
  const existing = await prisma.paymentEvent.findUnique({
    where: { providerEventId: event.providerEventId },
  });

  if (existing) {
    return { status: "already_processed", eventId: event.providerEventId };
  }

  // Record event
  await prisma.paymentEvent.create({
    data: {
      providerEventId: event.providerEventId,
      type: event.type,
      payload: JSON.stringify(event.rawPayload),
    },
  });

  if (event.status === "captured") {
    const payment = await prisma.payment.findFirst({
      where: { providerOrderId: event.orderId },
    });

    if (payment) {
      await confirmBooking(payment.bookingId, {
        providerPaymentId: event.paymentId,
      });
    }
  }

  return { status: "success", eventId: event.providerEventId };
}
