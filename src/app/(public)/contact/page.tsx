"use client";

import React, { useState } from "react";
import { BUSINESS_CONFIG } from "@/config/business";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Phone, Clock, CheckCircle2, MessageSquare } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For direct contact enquiries without external DB form dependence
    const mailtoSubject = encodeURIComponent(`Chess Hub Inquiry from ${name}`);
    const mailtoBody = encodeURIComponent(
      `Hello Shreyash & Tapesnu,\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}\n`
    );
    window.location.href = `mailto:${BUSINESS_CONFIG.email}?subject=${mailtoSubject}&body=${mailtoBody}`;
    setSubmitted(true);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-12 md:py-20">
      <SectionHeader
        tag="Support & Enquiries"
        title="Get in Touch"
        description="Reach out directly to Shreyash or Tapesnu for questions regarding coaching levels, customized scheduling, or payments."
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-10">
        {/* Left Column: Direct Channels */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <div className="p-8 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-[#cfa859]">
              <Mail size={18} />
              <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em]">
                Email Chess Hub
              </span>
            </div>
            <a
              href={`mailto:${BUSINESS_CONFIG.email}`}
              className="text-[18px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] hover:text-[#cfa859] transition-colors"
            >
              {BUSINESS_CONFIG.email}
            </a>
            <p className="text-[13px] text-[#a8a39a]">
              Best for booking confirmation details, payment discussion, and syllabus inquiries.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col gap-3">
            <div className="flex items-center gap-2.5 text-[#cfa859]">
              <Phone size={18} />
              <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em]">
                Call / WhatsApp (Tapesnu)
              </span>
            </div>
            <a
              href={`tel:${BUSINESS_CONFIG.phone}`}
              className="text-[18px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] hover:text-[#cfa859] transition-colors"
            >
              {BUSINESS_CONFIG.phoneDisplay}
            </a>
            <div className="pt-2">
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  "Hi Tapesnu, I'm reaching out regarding Chess Hub coaching."
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#2e5a44]/30 border border-[#2e5a44] text-[13px] font-[family-name:var(--font-mono)] text-[#4e8765] hover:bg-[#2e5a44]/50 transition-colors"
              >
                <MessageSquare size={14} />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#1a1a1e] border border-[#2e2e36] flex items-center gap-3 text-[13px] text-[#a8a39a]">
            <Clock size={16} className="text-[#cfa859] shrink-0" />
            <span>Coaching hours: Mon-Sat, 10:00 AM – 6:00 PM IST (Asia/Kolkata).</span>
          </div>
        </div>

        {/* Right Column: Quick Contact Form */}
        <div className="md:col-span-7">
          <div className="p-8 md:p-10 rounded-2xl bg-[#141418] border border-[#2e2e36]">
            <h2 className="text-[24px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef] mb-2">
              Send a Direct Message
            </h2>
            <p className="text-[14px] text-[#a8a39a] mb-6">
              Fill in your details below to open a pre-filled email to Shreyash and Tapesnu.
            </p>

            {submitted ? (
              <div className="p-6 rounded-xl bg-[#1a1a1e] border border-[#2e2e36] text-center flex flex-col items-center gap-3">
                <CheckCircle2 size={32} className="text-[#4e8765]" />
                <h3 className="text-[18px] font-medium text-[#f5f3ef]">Ready to Send</h3>
                <p className="text-[14px] text-[#a8a39a]">
                  Your email client has been prepared. If it didn&apos;t open automatically, please write to{" "}
                  <a href={`mailto:${BUSINESS_CONFIG.email}`} className="text-[#cfa859] underline">
                    {BUSINESS_CONFIG.email}
                  </a>
                  .
                </p>
                <Button variant="secondary" size="sm" onClick={() => setSubmitted(false)}>
                  Write another note
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Your Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                />

                <Input
                  label="Email Address"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />

                <Input
                  label="Phone / WhatsApp Number"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] uppercase font-[family-name:var(--font-mono)] tracking-[0.06em] text-[#dcd8d0]">
                    Your Message / Goals
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your or your child's chess experience and goals..."
                    className="w-full p-4 bg-[#1a1a1e] text-[#f5f3ef] placeholder:text-[#6e6a64] text-[15px] rounded-xl border border-[#2e2e36] focus:border-[#cfa859] outline-none resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="mt-2 !bg-[#cfa859] !text-[#0e0e10] hover:!bg-[#e0b86a] !font-medium"
                >
                  Send Message via Email &rarr;
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
