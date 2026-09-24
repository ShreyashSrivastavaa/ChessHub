import crypto from "crypto";

export interface CreateOrderInput {
  bookingId: string;
  amountPaise: number;
  currency: "INR";
  receipt: string;
  notes?: Record<string, string>;
}

export interface VerifySignatureInput {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
}

export interface PaymentWebhookEvent {
  providerEventId: string;
  type: string;
  orderId: string;
  paymentId: string;
  amountPaise: number;
  status: "captured" | "failed";
  rawPayload: Record<string, unknown>;
}

export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<{ providerOrderId: string; clientPayload: unknown }>;
  verifyClientSignature(input: VerifySignatureInput): boolean;
  parseAndVerifyWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent>;
  refund?(input: { providerPaymentId: string; amountPaise: number; reason?: string }): Promise<{ providerRefundId: string }>;
}

/**
 * Mock Provider for local development, demo sessions, and Vitest/Playwright tests.
 * Produces realistic order IDs and validates signatures predictably without external network calls.
 */
export class MockPaymentProvider implements PaymentProvider {
  async createOrder(input: CreateOrderInput): Promise<{ providerOrderId: string; clientPayload: unknown }> {
    const providerOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      providerOrderId,
      clientPayload: {
        provider: "mock",
        orderId: providerOrderId,
        amount: input.amountPaise,
        currency: input.currency,
        key: "mock_key_public",
        name: "TWO ROOKS Chess Academy",
        description: `Booking ref: ${input.receipt}`,
      },
    };
  }

  verifyClientSignature(input: VerifySignatureInput): boolean {
    // In mock mode, any signature starting with 'mock_sig_' or matching hash is valid
    if (input.signature.startsWith("mock_sig_") || input.signature === "mock_valid_signature") {
      return true;
    }
    // Alternatively test orderId matching
    return input.providerOrderId.startsWith("order_mock_");
  }

  async parseAndVerifyWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent> {
    const signature = headers.get("x-razorpay-signature") || headers.get("x-mock-signature");
    if (!signature) {
      throw new Error("Missing webhook signature");
    }

    const payload = JSON.parse(rawBody);
    return {
      providerEventId: payload.event_id || `evt_mock_${Date.now()}`,
      type: payload.event || "payment.captured",
      orderId: payload.payload?.payment?.entity?.order_id || payload.orderId || "order_mock",
      paymentId: payload.payload?.payment?.entity?.id || payload.paymentId || "pay_mock",
      amountPaise: payload.payload?.payment?.entity?.amount || payload.amount || 0,
      status: "captured",
      rawPayload: payload,
    };
  }

  async refund(input: { providerPaymentId: string; amountPaise: number; reason?: string }): Promise<{ providerRefundId: string }> {
    return {
      providerRefundId: `rfnd_mock_${Date.now()}`,
    };
  }
}

/**
 * Razorpay Production Provider using standard HMAC-SHA256 verification and Razorpay REST API
 */
export class RazorpayPaymentProvider implements PaymentProvider {
  private keyId: string;
  private keySecret: string;
  private webhookSecret: string;

  constructor() {
    this.keyId = process.env.RAZORPAY_KEY_ID || "";
    this.keySecret = process.env.RAZORPAY_KEY_SECRET || "";
    this.webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";
  }

  async createOrder(input: CreateOrderInput): Promise<{ providerOrderId: string; clientPayload: unknown }> {
    if (!this.keyId || !this.keySecret) {
      throw new Error("Razorpay credentials missing in environment");
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amountPaise,
        currency: input.currency,
        receipt: input.receipt,
        notes: input.notes,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Razorpay order creation failed: ${err}`);
    }

    const data = await res.json();
    return {
      providerOrderId: data.id,
      clientPayload: {
        provider: "razorpay",
        orderId: data.id,
        amount: input.amountPaise,
        currency: input.currency,
        key: this.keyId,
        name: "TWO ROOKS Chess Academy",
        description: `Session Booking ${input.receipt}`,
      },
    };
  }

  verifyClientSignature(input: VerifySignatureInput): boolean {
    if (!this.keySecret) return false;
    const body = `${input.providerOrderId}|${input.providerPaymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", this.keySecret)
      .update(body)
      .digest("hex");
    return expectedSignature === input.signature;
  }

  async parseAndVerifyWebhook(rawBody: string, headers: Headers): Promise<PaymentWebhookEvent> {
    const signature = headers.get("x-razorpay-signature");
    if (!signature || !this.webhookSecret) {
      throw new Error("Missing or invalid Razorpay webhook signature");
    }

    const expectedSignature = crypto
      .createHmac("sha256", this.webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      throw new Error("Invalid Razorpay webhook signature");
    }

    const json = JSON.parse(rawBody);
    const paymentEntity = json.payload?.payment?.entity;
    const isCaptured = json.event === "payment.captured";

    return {
      providerEventId: json.event_id || `evt_${Date.now()}`,
      type: json.event,
      orderId: paymentEntity?.order_id || "",
      paymentId: paymentEntity?.id || "",
      amountPaise: paymentEntity?.amount || 0,
      status: isCaptured ? "captured" : "failed",
      rawPayload: json,
    };
  }

  async refund(input: { providerPaymentId: string; amountPaise: number; reason?: string }): Promise<{ providerRefundId: string }> {
    if (!this.keyId || !this.keySecret) {
      throw new Error("Razorpay credentials missing");
    }
    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString("base64");
    const res = await fetch(`https://api.razorpay.com/v1/payments/${input.providerPaymentId}/refund`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: input.amountPaise,
        notes: { reason: input.reason || "Customer requested refund" },
      }),
    });

    if (!res.ok) {
      throw new Error(`Refund failed: ${await res.text()}`);
    }

    const data = await res.json();
    return { providerRefundId: data.id };
  }
}

export function getPaymentProvider(): PaymentProvider {
  const providerType = process.env.PAYMENT_PROVIDER || "mock";
  if (providerType.toLowerCase() === "razorpay") {
    return new RazorpayPaymentProvider();
  }
  return new MockPaymentProvider();
}
