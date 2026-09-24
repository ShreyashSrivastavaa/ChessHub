import { describe, it, expect, vi } from "vitest";
import { POLICY_CONFIG } from "../src/config/policy";
import { addHours, subHours, isBefore } from "date-fns";
import { MockPaymentProvider } from "../src/lib/payments/provider";

describe("Business Logic & Policies", () => {
  describe("Policy Windows", () => {
    it("enforces 12-hour cancellation notice window", () => {
      const now = new Date();
      const sessionIn10Hours = addHours(now, 10);
      const sessionIn14Hours = addHours(now, 14);

      const minNoticeTime = addHours(now, POLICY_CONFIG.cancelNoticeHours);

      // Session inside 12h: cannot cancel without penalty
      expect(isBefore(sessionIn10Hours, minNoticeTime)).toBe(true);

      // Session outside 12h: can cancel free of charge
      expect(isBefore(sessionIn14Hours, minNoticeTime)).toBe(false);
    });

    it("enforces 12-hour rescheduling notice window", () => {
      const now = new Date();
      const sessionIn5Hours = addHours(now, 5);
      const sessionIn20Hours = addHours(now, 20);

      const minNoticeTime = addHours(now, POLICY_CONFIG.rescheduleNoticeHours);

      expect(isBefore(sessionIn5Hours, minNoticeTime)).toBe(true);
      expect(isBefore(sessionIn20Hours, minNoticeTime)).toBe(false);
    });
  });

  describe("Payment Provider Abstraction", () => {
    const mockProvider = new MockPaymentProvider();

    it("creates orders with INR currency and correct paise amount", async () => {
      const order = await mockProvider.createOrder({
        bookingId: "b_test_123",
        amountPaise: 99900,
        currency: "INR",
        receipt: "TR-0142",
      });

      expect(order.providerOrderId).toContain("order_mock_");
      expect((order.clientPayload as any).amount).toBe(99900);
      expect((order.clientPayload as any).currency).toBe("INR");
    });

    it("verifies mock client signatures accurately", () => {
      const valid = mockProvider.verifyClientSignature({
        providerOrderId: "order_mock_test_1",
        providerPaymentId: "pay_123",
        signature: "mock_valid_signature",
      });
      expect(valid).toBe(true);

      const invalid = mockProvider.verifyClientSignature({
        providerOrderId: "order_real_123",
        providerPaymentId: "pay_123",
        signature: "invalid_sig",
      });
      expect(invalid).toBe(false);
    });

    it("parses webhooks and validates signature header", async () => {
      const headers = new Headers();
      headers.set("x-mock-signature", "mock_valid");

      const event = await mockProvider.parseAndVerifyWebhook(
        JSON.stringify({
          event_id: "evt_100",
          event: "payment.captured",
          orderId: "order_mock_1",
          paymentId: "pay_mock_1",
          amount: 99900,
        }),
        headers
      );

      expect(event.providerEventId).toBe("evt_100");
      expect(event.status).toBe("captured");
      expect(event.amountPaise).toBe(99900);
    });
  });
});
