import { describe, it, expect } from "vitest";
import { BUSINESS_CONFIG, getPlanByLevel } from "../src/config/business";
import { addHours, isBefore } from "date-fns";

describe("Chess Hub Business Logic & Policies", () => {
  describe("Direct Contact & Payment Enquiry Workflow", () => {
    it("coaches are strictly Shreyash and Tapesnu", () => {
      const coachNames = BUSINESS_CONFIG.coaches.map((c) => c.name);
      expect(coachNames).toContain("Shreyash");
      expect(coachNames).toContain("Tapesnu");
      // Spelling check
      expect(coachNames).not.toContain("Tapesh");
    });

    it("payment policy mandates direct coach communication", () => {
      expect(BUSINESS_CONFIG.paymentPolicy.requireDirectContact).toBe(true);
      expect(BUSINESS_CONFIG.paymentPolicy.description).toContain("No online payments");
    });

    it("correct mailto URL is constructed with prefilled booking details", () => {
      const mockBooking = {
        reference: "CH-AB12CD",
        level: "beginner",
        date: "2026-11-20",
        timeSlot: "10:00",
        priceRupees: 500,
        fullName: "Rahul Varma",
      };

      const mailtoSubject = encodeURIComponent(
        `Chess Hub Booking Confirmation - Ref: ${mockBooking.reference}`
      );
      const mailtoBody = encodeURIComponent(
        `Hello Shreyash & Tapesnu,\n\nI have submitted a booking request on Chess Hub with the following details:\n\nReference: ${
          mockBooking.reference
        }\nStudent Name: ${mockBooking.fullName}\nLevel: ${mockBooking.level.toUpperCase()} Coaching\nDate: ${
          mockBooking.date
        }\nTime Slot: ${mockBooking.timeSlot} IST\nPrice: ₹${
          mockBooking.priceRupees
        } per session\n\nI would like to discuss payment arrangements and finalize my session confirmation.\n\nThank you,\n${
          mockBooking.fullName
        }`
      );

      const generatedLink = `mailto:${BUSINESS_CONFIG.email}?subject=${mailtoSubject}&body=${mailtoBody}`;

      expect(generatedLink).toContain(`mailto:${BUSINESS_CONFIG.email}`);
      expect(generatedLink).toContain(encodeURIComponent(mockBooking.reference));
      expect(generatedLink).toContain(encodeURIComponent("₹500 per session"));
    });

    it("tel link targets Coach Tapesnu correctly", () => {
      expect(BUSINESS_CONFIG.phone).toBe("+91 9930917551");
      expect(BUSINESS_CONFIG.contactCoachName).toBe("Tapesnu");
      const telLink = `tel:${BUSINESS_CONFIG.phone}`;
      expect(telLink).toBe("tel:+91 9930917551");
    });
  });

  describe("Coaching Pricing Single Source of Truth", () => {
    it("Beginner coaching is integer 500 rupees", () => {
      expect(BUSINESS_CONFIG.plans.beginner.priceRupees).toBe(500);
      expect(BUSINESS_CONFIG.plans.beginner.pricePaise).toBe(50000);
    });

    it("Advanced coaching is integer 800 rupees", () => {
      expect(BUSINESS_CONFIG.plans.advanced.priceRupees).toBe(800);
      expect(BUSINESS_CONFIG.plans.advanced.pricePaise).toBe(80000);
    });

    it("resolves plan case-insensitively and returns correct defaults", () => {
      expect(getPlanByLevel("BEGINNER").priceRupees).toBe(500);
      expect(getPlanByLevel("beginner").priceRupees).toBe(500);
      expect(getPlanByLevel("ADVANCED").priceRupees).toBe(800);
      expect(getPlanByLevel("advanced").priceRupees).toBe(800);
      expect(getPlanByLevel("unknown").priceRupees).toBe(500); // safe fallback
    });
  });
});
