"use client";

import React, { useState, useEffect, useId } from "react";
import { useSearchParams } from "next/navigation";
import { BUSINESS_CONFIG, getPlanByLevel, CoachingLevelId } from "@/config/business";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isBefore,
  startOfToday,
  parseISO,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  MessageSquare,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  User,
} from "lucide-react";

interface SlotItem {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  capacity: number;
  activeBookings: number;
  remainingCapacity: number;
  isAvailable: boolean;
}

export function ChessHubBookingFlow() {
  const searchParams = useSearchParams();

  // Form Inputs
  const [level, setLevel] = useState<CoachingLevelId>(
    searchParams.get("level")?.toLowerCase() === "advanced" ? "advanced" : "beginner"
  );
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [message, setMessage] = useState("");

  // UI & Data State
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [slots, setSlots] = useState<SlotItem[]>([]);
  const [isLoadingDates, setIsLoadingDates] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [conflictMessage, setConflictMessage] = useState("");

  // Current calendar month view
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Idempotency Key (generated once on mount)
  const [idempotencyKey, setIdempotencyKey] = useState<string>("");

  // Confirmed booking state
  const [bookingResult, setBookingResult] = useState<{
    reference: string;
    level: string;
    priceRupees: number;
    date: string;
    timeSlot: string;
    fullName: string;
    email: string;
    phone: string;
    status: string;
  } | null>(null);

  // Initialize idempotency key
  useEffect(() => {
    setIdempotencyKey(`idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`);
  }, []);

  // Sync level if query parameter changes
  useEffect(() => {
    const queryLevel = searchParams.get("level")?.toLowerCase();
    if (queryLevel === "advanced" || queryLevel === "beginner") {
      setLevel(queryLevel);
    }
  }, [searchParams]);

  // Load available dates on mount
  useEffect(() => {
    setIsLoadingDates(true);
    fetch("/api/bookings")
      .then((res) => res.json())
      .then((data) => {
        if (data.availableDates) {
          setAvailableDates(data.availableDates);
          // If first available date is present, select it automatically
          if (data.availableDates.length > 0 && !selectedDate) {
            setSelectedDate(data.availableDates[0]);
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load available dates:", err);
      })
      .finally(() => {
        setIsLoadingDates(false);
      });
  }, []);

  // Load slots whenever selected date changes
  useEffect(() => {
    if (!selectedDate) {
      setSlots([]);
      return;
    }

    setIsLoadingSlots(true);
    setSelectedSlotId("");
    setConflictMessage("");

    fetch(`/api/bookings?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.slots) {
          setSlots(data.slots);
        } else {
          setSlots([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load slots:", err);
        setSlots([]);
      })
      .finally(() => {
        setIsLoadingSlots(false);
      });
  }, [selectedDate]);

  const activePlan = getPlanByLevel(level);
  const selectedSlot = slots.find((s) => s.id === selectedSlotId);

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setConflictMessage("");

    if (!selectedDate || !selectedSlotId) {
      setErrorMessage("Please select an available date and time slot.");
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage("Please fill in your name, email, and contact number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          level,
          date: selectedDate,
          slotId: selectedSlotId,
          idempotencyKey,
          message: message.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          // Slot taken conflict! Refresh availability
          setConflictMessage(
            data.error || "That slot was just booked by another student. Please select another time."
          );
          // Re-fetch slots for this date
          fetch(`/api/bookings?date=${selectedDate}`)
            .then((r) => r.json())
            .then((d) => setSlots(d.slots || []));
          setSelectedSlotId("");
          return;
        }
        throw new Error(data.error || "Failed to submit booking request.");
      }

      setBookingResult({
        reference: data.booking.reference,
        level: data.booking.level,
        priceRupees: data.booking.priceRupees,
        date: data.booking.date,
        timeSlot: data.booking.timeSlot,
        fullName: data.booking.fullName,
        email: data.booking.email,
        phone: data.booking.phone,
        status: data.booking.status,
      });

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while booking.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calendar generation helpers
  const today = startOfToday();
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay(); // 0 is Sunday

  // SUCCESS VIEW
  if (bookingResult) {
    const mailtoSubject = encodeURIComponent(
      `Chess Hub Booking Confirmation - Ref: ${bookingResult.reference}`
    );
    const mailtoBody = encodeURIComponent(
      `Hello Shreyash & Tapesnu,\n\nI have submitted a booking request on Chess Hub with the following details:\n\nReference: ${
        bookingResult.reference
      }\nStudent Name: ${bookingResult.fullName}\nLevel: ${bookingResult.level.toUpperCase()} Coaching\nDate: ${
        bookingResult.date
      }\nTime Slot: ${bookingResult.timeSlot} IST\nPrice: ₹${
        bookingResult.priceRupees
      } per session\n\nI would like to discuss payment arrangements and finalize my session confirmation.\n\nThank you,\n${
        bookingResult.fullName
      }\nPhone: ${bookingResult.phone}`
    );

    return (
      <div className="w-full max-w-[800px] mx-auto px-4 py-12 md:py-16">
        <div className="p-8 md:p-12 rounded-3xl bg-[#141418] border border-[#2e2e36] flex flex-col gap-8 shadow-2xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-[#2e5a44]/20 border border-[#4e8765]/50 flex items-center justify-center text-[#4e8765]">
              <CheckCircle2 size={36} />
            </div>
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.1em] px-3.5 py-1 rounded-full bg-[#cfa859]/20 text-[#cfa859] border border-[#cfa859]/40 mt-2">
              Status: Pending Confirmation
            </span>
            <h1 className="text-[32px] md:text-[40px] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef]">
              Booking Request Received
            </h1>
            <p className="text-[15px] text-[#dcd8d0] max-w-[540px]">
              Thank you, <span className="text-[#f5f3ef] font-medium">{bookingResult.fullName}</span>. Your session request has been registered in our system.
            </p>
          </div>

          {/* Important Notice */}
          <div className="p-5 rounded-2xl bg-[#1a1a1e] border-2 border-[#cfa859]/40 flex items-start gap-3.5">
            <ShieldAlert size={22} className="text-[#cfa859] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-1 text-[14px]">
              <span className="font-medium text-[#f5f3ef]">Payment & Confirmation Policy</span>
              <p className="text-[#dcd8d0] leading-relaxed">
                Payments are not taken online on this website. Your session is currently <strong className="text-[#cfa859]">Pending</strong>. Please contact the coaches directly using the options below to discuss payment and receive your final confirmation.
              </p>
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="p-6 rounded-2xl bg-[#0e0e10] border border-[#2e2e36] grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
            <div>
              <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                Booking Reference
              </span>
              <span className="text-[20px] font-[family-name:var(--font-mono)] font-semibold text-[#cfa859]">
                {bookingResult.reference}
              </span>
            </div>
            <div>
              <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                Coaching Level
              </span>
              <span className="text-[16px] text-[#f5f3ef] capitalize font-medium">
                {bookingResult.level} Coaching
              </span>
            </div>
            <div>
              <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                Date & Time
              </span>
              <span className="text-[15px] text-[#f5f3ef] font-[family-name:var(--font-mono)]">
                {bookingResult.date} at {bookingResult.timeSlot} IST
              </span>
            </div>
            <div>
              <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#a8a39a] block">
                Session Fee
              </span>
              <span className="text-[18px] text-[#f5f3ef] font-[family-name:var(--font-mono)] font-semibold">
                ₹{bookingResult.priceRupees} (per session)
              </span>
            </div>
          </div>

          {/* Action CTAs: Direct Contact */}
          <div className="flex flex-col gap-4">
            <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#cfa859] text-center">
              Next Step: Contact Coaches Directly
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`mailto:${BUSINESS_CONFIG.email}?subject=${mailtoSubject}&body=${mailtoBody}`}
                className="flex items-center justify-center gap-2.5 h-[50px] px-6 rounded-full bg-[#cfa859] text-[#0e0e10] font-medium hover:bg-[#e0b86a] transition-colors"
              >
                <Mail size={16} />
                <span>Email Chess Hub</span>
              </a>
              <a
                href={`tel:${BUSINESS_CONFIG.phone}`}
                className="flex items-center justify-center gap-2.5 h-[50px] px-6 rounded-full bg-[#1a1a1e] border border-[#2e2e36] hover:border-[#cfa859] text-[#f5f3ef] transition-colors"
              >
                <Phone size={16} />
                <span>Call Tapesnu ({BUSINESS_CONFIG.phoneDisplay})</span>
              </a>
            </div>

            <div className="text-center pt-2">
              <a
                href={`https://wa.me/${BUSINESS_CONFIG.phone.replace(/[^0-9]/g, "")}?text=${mailtoBody}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-[#4e8765] hover:underline inline-flex items-center gap-1.5"
              >
                <MessageSquare size={14} />
                <span>Prefer WhatsApp? Message Coach Tapesnu directly &rarr;</span>
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-[#2e2e36] flex justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setBookingResult(null);
                setSelectedSlotId("");
                setMessage("");
              }}
            >
              Book Another Session
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // BOOKING FORM VIEW
  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-10 md:py-16">
      {/* Title */}
      <div className="mb-10 text-center max-w-[700px] mx-auto">
        <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.12em] text-[#cfa859] block mb-2">
          Reserve Your Slot
        </span>
        <h1 className="text-[36px] md:text-[48px] font-[family-name:var(--font-heading)] font-light text-[#f5f3ef]">
          Book a Coaching Session
        </h1>
        <p className="text-[15px] text-[#dcd8d0] mt-2">
          Choose your level, select an available date and time slot, and submit your request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Level & Calendar & Slots */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* 1. Coaching Level Selection */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#141418] border border-[#2e2e36]">
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-[#cfa859] block mb-4">
              Step 1: Coaching Level
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Beginner card */}
              <button
                type="button"
                onClick={() => setLevel("beginner")}
                className={`p-5 rounded-xl border text-left transition-all ${
                  level === "beginner"
                    ? "bg-[#1a1a1e] border-2 border-[#cfa859] shadow-lg shadow-[#cfa859]/5"
                    : "bg-[#0e0e10] border-[#2e2e36] hover:border-[#a8a39a]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[18px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef]">
                    Beginner Coaching
                  </span>
                  <span className="text-[16px] font-[family-name:var(--font-mono)] text-[#cfa859] font-medium">
                    ₹500
                  </span>
                </div>
                <p className="text-[13px] text-[#a8a39a] leading-relaxed">
                  Rules, piece harmony, opening principles & fundamental checkmates.
                </p>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a] block mt-3">
                  ₹500 / 60 min session
                </span>
              </button>

              {/* Advanced card */}
              <button
                type="button"
                onClick={() => setLevel("advanced")}
                className={`p-5 rounded-xl border text-left transition-all ${
                  level === "advanced"
                    ? "bg-[#1a1a1e] border-2 border-[#cfa859] shadow-lg shadow-[#cfa859]/5"
                    : "bg-[#0e0e10] border-[#2e2e36] hover:border-[#a8a39a]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[18px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef]">
                    Advanced Coaching
                  </span>
                  <span className="text-[16px] font-[family-name:var(--font-mono)] text-[#cfa859] font-medium">
                    ₹800
                  </span>
                </div>
                <p className="text-[13px] text-[#a8a39a] leading-relaxed">
                  Opening preparation, dynamic tactics, calculation & endgame mastery.
                </p>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a] block mt-3">
                  ₹800 / 60 min session
                </span>
              </button>
            </div>
          </div>

          {/* 2. Interactive Calendar */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#141418] border border-[#2e2e36]">
            <div className="flex items-center justify-between pb-4 border-b border-[#2e2e36] mb-4">
              <div>
                <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-[#cfa859] block mb-1">
                  Step 2: Choose Date
                </span>
                <span className="text-[18px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef]">
                  {format(currentMonth, "MMMM yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
                  disabled={isBefore(currentMonth, new Date())}
                  className="w-8 h-8 rounded-full border border-[#2e2e36] flex items-center justify-center text-[#f5f3ef] hover:border-[#cfa859] disabled:opacity-30 disabled:cursor-not-allowed"
                  aria-label="Previous month"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
                  className="w-8 h-8 rounded-full border border-[#2e2e36] flex items-center justify-center text-[#f5f3ef] hover:border-[#cfa859]"
                  aria-label="Next month"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-1 text-center text-[12px] font-[family-name:var(--font-mono)] text-[#a8a39a] mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1.5 text-center">
              {/* Empty leading cells */}
              {Array.from({ length: startDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} className="h-10" />
              ))}

              {daysInMonth.map((day) => {
                const dateString = format(day, "yyyy-MM-dd");
                const isPast = isBefore(day, today);
                const hasSlots = availableDates.includes(dateString);
                const isSelected = selectedDate === dateString;
                const isSelectable = !isPast && hasSlots;

                return (
                  <button
                    key={dateString}
                    type="button"
                    disabled={!isSelectable}
                    onClick={() => setSelectedDate(dateString)}
                    className={`h-10 rounded-xl text-[14px] font-[family-name:var(--font-mono)] flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-[#cfa859] text-[#0e0e10] font-semibold shadow-md shadow-[#cfa859]/20"
                        : isSelectable
                        ? "bg-[#1a1a1e] text-[#f5f3ef] hover:bg-[#2e2e36] hover:text-[#cfa859] cursor-pointer"
                        : "text-[#6e6a64] opacity-35 cursor-not-allowed"
                    }`}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#2e2e36] text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#cfa859]" /> Selected
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#1a1a1e] border border-[#2e2e36]" /> Available
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded opacity-35 bg-[#6e6a64]" /> Unavailable / Blocked
              </span>
            </div>
          </div>

          {/* 3. Slot Picker */}
          <div className="p-6 md:p-8 rounded-2xl bg-[#141418] border border-[#2e2e36]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-[#cfa859]">
                Step 3: Select Time Slot
              </span>
              {selectedDate && (
                <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
                  Date: {selectedDate}
                </span>
              )}
            </div>

            {conflictMessage && (
              <div className="p-3 mb-4 rounded-xl bg-[#b3261e]/15 border border-[#b3261e]/50 text-[#ff6b6b] text-[13px] flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{conflictMessage}</span>
              </div>
            )}

            {isLoadingSlots ? (
              <div className="py-8 text-center text-[#a8a39a] text-[14px]">
                Checking slot availability...
              </div>
            ) : slots.length === 0 ? (
              <div className="py-8 text-center text-[#a8a39a] text-[14px] bg-[#0e0e10] rounded-xl border border-[#2e2e36]">
                {selectedDate
                  ? "No slots available for this date. Please pick another date above."
                  : "Select a date above to view available time slots."}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slots.map((s) => {
                  const isSelected = selectedSlotId === s.id;
                  const isAvailable = s.isAvailable;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlotId(s.id)}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "bg-[#cfa859] border-[#cfa859] text-[#0e0e10] font-semibold"
                          : isAvailable
                          ? "bg-[#1a1a1e] border-[#2e2e36] text-[#f5f3ef] hover:border-[#cfa859]"
                          : "bg-[#0e0e10] border-[#2e2e36] text-[#6e6a64] opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div className="text-[15px] font-[family-name:var(--font-mono)] font-medium">
                        {s.startTime}
                      </div>
                      <div className="text-[11px] opacity-75 mt-0.5">
                        {s.durationMinutes} min · {isAvailable ? "Open" : "Booked"}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Student Details & Summary */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 md:p-8 rounded-2xl bg-[#141418] border border-[#2e2e36]">
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.08em] text-[#cfa859] block mb-4">
              Step 4: Student Details
            </span>

            <div className="flex flex-col gap-4">
              <Input
                label="Full Name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Student or parent's name"
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
                  Goals or Current Rating (Optional)
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="e.g. Learning basic openings, tournament preparation, beginner foundations..."
                  className="w-full p-3.5 bg-[#1a1a1e] text-[#f5f3ef] placeholder:text-[#6e6a64] text-[14px] rounded-xl border border-[#2e2e36] focus:border-[#cfa859] outline-none resize-none"
                />
              </div>
            </div>

            {/* Summary & Price Confirmation */}
            <div className="mt-6 pt-6 border-t border-[#2e2e36] flex flex-col gap-3">
              <div className="flex items-center justify-between text-[14px] text-[#a8a39a]">
                <span>Coaching Tier:</span>
                <span className="text-[#f5f3ef] font-medium">{activePlan.name}</span>
              </div>

              <div className="flex items-center justify-between text-[14px] text-[#a8a39a]">
                <span>Selected Time:</span>
                <span className="text-[#f5f3ef] font-[family-name:var(--font-mono)]">
                  {selectedDate && selectedSlot
                    ? `${selectedDate} at ${selectedSlot.startTime}`
                    : "Not chosen yet"}
                </span>
              </div>

              <div className="flex items-center justify-between text-[16px] pt-2 border-t border-[#2e2e36]">
                <span className="font-medium text-[#f5f3ef]">Session Fee:</span>
                <span className="text-[22px] font-[family-name:var(--font-mono)] font-semibold text-[#cfa859]">
                  ₹{activePlan.priceRupees}
                </span>
              </div>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a] text-right">
                Per 60-minute session · No online payment taken now
              </span>
            </div>

            {errorMessage && (
              <div className="mt-4 p-3 rounded-xl bg-[#b3261e]/15 border border-[#b3261e]/50 text-[#ff6b6b] text-[13px] flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting || !selectedSlotId}
              className="mt-6 !bg-[#cfa859] hover:!bg-[#e0b86a] !text-[#0e0e10] !font-medium"
            >
              {isSubmitting ? "Reserving Slot..." : "Submit Booking Request &rarr;"}
            </Button>

            <p className="text-[12px] text-[#a8a39a] text-center mt-3 leading-relaxed">
              Submitting places your booking in <strong>Pending</strong> status. You will contact the coaches directly to confirm.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
