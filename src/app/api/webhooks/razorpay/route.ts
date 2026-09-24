import { NextRequest, NextResponse } from "next/server";
import { processWebhook } from "@/server/services/paymentService";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const result = await processWebhook(rawBody, request.headers);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook processing failed";
    console.error("[Razorpay Webhook Error]", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
