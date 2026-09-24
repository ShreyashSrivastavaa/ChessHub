"use client";

import React, { useState } from "react";
import { BRAND_CONFIG } from "@/config/brand";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mail, MessageSquare, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [level, setLevel] = useState("");
  const [message, setMessage] = useState("");
  const [trap, setTrap] = useState(""); // Honeypot

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          level,
          message,
          website_trap: trap,
        }),
      });

      if (!res.ok) {
        throw new Error("Unable to deliver message");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setError("Failed to send message. Please try again or reach out on WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-16">
      <SectionHeader
        tag="Support & Inquiries"
        title="Get in touch"
        description="Questions about levels, scheduling for siblings, or customized tournament training."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
        {/* Left Column: Form */}
        <div className="md:col-span-7">
          <div className="p-8 border border-[#000000] rounded-[16px] bg-[#ffffff]">
            {success ? (
              <div className="flex flex-col items-center text-center py-8 gap-4">
                <CheckCircle2 size={36} strokeWidth={1.5} className="text-[#000000]" />
                <h3 className="text-[22px] font-[family-name:var(--font-heading)] text-[#000000]">
                  Message received
                </h3>
                <p className="text-[14px] text-[#323232] max-w-[360px]">
                  Thank you for writing to us. Shreyash or Tapesnu will get back to you within 24 hours.
                </p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSuccess(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Meera Patel"
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />

                {/* Honeypot hidden from humans */}
                <div style={{ display: "none" }} aria-hidden="true">
                  <label htmlFor="website_trap">Leave this blank</label>
                  <input
                    id="website_trap"
                    name="website_trap"
                    value={trap}
                    onChange={(e) => setTrap(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] uppercase font-[family-name:var(--font-mono)] tracking-[0.04em] text-[#000000]">
                    Current Level (Optional)
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full h-[46px] px-[20px] bg-[#ffffff] text-[#000000] text-[16px] rounded-[50px] border border-[#000000] focus:border-2 focus:border-[#000000] outline-none"
                  >
                    <option value="">Select level if known</option>
                    <option value="Beginner">Beginner / Learning rules</option>
                    <option value="Foundations">Foundations (under 1000)</option>
                    <option value="Intermediate">Intermediate (1000 - 1500)</option>
                    <option value="Advanced">Advanced (1500+ / Tournament)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] uppercase font-[family-name:var(--font-mono)] tracking-[0.04em] text-[#000000]">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    placeholder="Tell us what you or your child would like to achieve..."
                    className="w-full p-[16px] bg-[#ffffff] text-[#000000] text-[15px] rounded-[16px] border border-[#000000] focus:border-2 focus:border-[#000000] outline-none resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-[13px] text-[#B3261E]">
                    <AlertCircle size={15} strokeWidth={1.5} />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={loading}
                  className="mt-2"
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Direct Channels */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <Card>
            <div className="flex items-center gap-3 mb-3">
              <Mail size={18} strokeWidth={1.5} />
              <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000]">
                Email Inquiries
              </span>
            </div>
            <a
              href={`mailto:${BRAND_CONFIG.contactEmail}`}
              className="text-[15px] font-[family-name:var(--font-mono)] text-[#000000] underline"
            >
              {BRAND_CONFIG.contactEmail}
            </a>
            <p className="text-[13px] text-[#323232] mt-1">
              For scheduling questions, sibling enrollments, or invoice receipts.
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-3">
              <MessageSquare size={18} strokeWidth={1.5} />
              <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000]">
                WhatsApp Support
              </span>
            </div>
            <a
              href={`https://wa.me/${BRAND_CONFIG.whatsappNumber.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-[family-name:var(--font-mono)] text-[#000000] underline"
            >
              {BRAND_CONFIG.whatsappNumber}
            </a>
            <p className="text-[13px] text-[#323232] mt-1">
              Quick questions for parents coming from Instagram or YouTube.
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-3 mb-2">
              <Clock size={18} strokeWidth={1.5} />
              <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000]">
                Response Guarantee
              </span>
            </div>
            <p className="text-[13px] text-[#323232] leading-[1.5]">
              We reply within 24 hours on weekdays.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
