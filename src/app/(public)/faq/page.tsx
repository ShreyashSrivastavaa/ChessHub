import React from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { POLICY_CONFIG } from "@/config/policy";
import { BRAND_CONFIG } from "@/config/brand";
import { Button } from "@/components/ui/Button";

export default function FaqPage() {
  const allFaqItems = [
    {
      question: "How do I join my live class?",
      answer:
        "Every session takes place 1:1 on Google Meet. You receive your secure Meet link on your booking confirmation page, via email, and directly on your student dashboard. The join button becomes active 10 minutes prior to class start.",
    },
    {
      question: "What equipment do I or my child need?",
      answer:
        "A laptop, tablet, or desktop computer with a working webcam, microphone, and stable internet. A physical chessboard is optional but helpful; your coach shares an interactive digital board on screen.",
    },
    {
      question: "What age range is the academy designed for?",
      answer:
        "We teach students from age 6 upward to adults. Shreyash specializes in absolute beginners, young children, and foundational mechanics. Tapeshnu works with intermediate and competitive tournament players.",
    },
    {
      question: "Can a parent book and manage classes for a child?",
      answer:
        "Yes. Parents create a guardian account and can add one or more student profiles. You receive all schedule updates, homework assignments, and coach notes directly in your portal.",
    },
    {
      question: "Which level or coach should I choose?",
      answer:
        "If you are new to chess, learning rules, or booking for a child, choose Foundations with Shreyash. If you already play games online or at a club and want tournament calculation and opening repertoires, choose Tapeshnu. You can also book a diagnostic assessment class.",
    },
    {
      question: "What is the cancellation and rescheduling policy?",
      answer: `You can reschedule or cancel any session free of charge up to ${POLICY_CONFIG.cancelNoticeHours} hours before start time directly from your dashboard. Inside ${POLICY_CONFIG.cancelNoticeHours} hours, the session is reserved and treated as delivered.`,
    },
    {
      question: "What happens if I miss a scheduled class?",
      answer:
        "If you are unable to attend and do not reschedule before the 12-hour policy window, the session will be marked as a no-show. Coaches wait in the Google Meet classroom for 15 minutes before closing the room.",
    },
    {
      question: "How are payments handled?",
      answer:
        "Payments are processed securely in INR via Razorpay. We support UPI (Google Pay, PhonePe, Paytm), debit/credit cards, and netbanking. There are no automatic subscription rebills; you only pay for classes you book.",
    },
    {
      question: "Are classes recorded?",
      answer:
        "Classes are private and not recorded by default. If you wish to have a recording for post-class review, you may ask your coach at the start of the session.",
    },
  ];

  return (
    <div className="max-w-[840px] mx-auto px-4 md:px-8 py-12 md:py-16">
      <SectionHeader
        tag="Help & Knowledge"
        title="Frequently Asked Questions"
        description="Believable, clear answers regarding scheduling, technology, and learning outcomes."
      />

      <FaqAccordion items={allFaqItems} className="mt-8" />

      <div className="mt-14 p-6 border border-[#d6d5d0]/20 rounded-[8px] bg-[#1d1d1d] text-center flex flex-col items-center gap-3">
        <h3 className="text-[18px] font-[family-name:var(--font-heading)] font-light text-[#ffffff]">
          Still have a question not covered here?
        </h3>
        <p className="text-[14px] text-[#d6d5d0]">
          Reach out directly to the academy team.
        </p>
        <div className="flex gap-4 mt-2 items-center">
          <Button href="/contact" variant="secondary" size="sm">
            Contact Form
          </Button>
          <a
            href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-[13px] font-[family-name:var(--font-mono)] text-[#ffffff] underline px-3 py-1"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
