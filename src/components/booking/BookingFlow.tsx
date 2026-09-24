"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { BRAND_CONFIG } from "@/config/brand";
import { POLICY_CONFIG } from "@/config/policy";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Tag } from "../ui/Tag";
import { Input } from "../ui/Input";
import { KnightPath } from "../chess/KnightPath";
import { PieceIcon } from "../chess/PieceIcon";
import { format, addMonths, subMonths, isSameDay, parseISO } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Video,
  Download,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface CoachData {
  id: string;
  slug: string;
  displayName: string;
  focusLevels: string; // JSON
  defaultMeetUrl: string;
  fideId?: string | null;
  fideRating?: number | null;
}

export interface SessionTypeData {
  id: string;
  coachId: string;
  name: string;
  level: string;
  durationMinutes: number;
  pricePaise: number;
  description: string;
  isTrial: boolean;
}

export interface SlotData {
  startsAt: string;
  endsAt: string;
  dateStr: string;
  timeStr: string;
  timeZone: string;
}

export interface BookingFlowProps {
  coaches: CoachData[];
  sessionTypes: SessionTypeData[];
  initialUser?: {
    id: string;
    email: string;
    name: string;
    students: { id: string; displayName: string; level: string }[];
  } | null;
}

export function BookingFlow({
  coaches,
  sessionTypes,
  initialUser = null,
}: BookingFlowProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  // User state
  const [currentUser, setCurrentUser] = useState(initialUser);

  // Stepper State (1 to 9)
  const [step, setStep] = useState<number>(1);

  // Selections
  const [selectedLevel, setSelectedLevel] = useState<string>(
    searchParams.get("level") || ""
  );
  const [selectedCoachSlug, setSelectedCoachSlug] = useState<string>(
    searchParams.get("coach") || ""
  );
  const [selectedSessionTypeId, setSelectedSessionTypeId] = useState<string>(
    searchParams.get("type") || ""
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    searchParams.get("date") || ""
  );
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);

  // Learner info
  const [isForChild, setIsForChild] = useState<boolean>(false);
  const [learnerName, setLearnerName] = useState<string>(
    currentUser?.students?.[0]?.displayName || currentUser?.name || ""
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    currentUser?.students?.[0]?.id || ""
  );

  // Inline Auth form state (if not logged in)
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Slots fetching state
  const [availableSlots, setAvailableSlots] = useState<SlotData[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [slotsError, setSlotsError] = useState<string>("");

  // Booking & Payment submission state
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string>("");
  const [confirmedBookingData, setConfirmedBookingData] = useState<{
    reference: string;
    startsAt: string;
    durationMinutes: number;
    coachName: string;
    meetUrl: string;
    pricePaise: number;
  } | null>(null);

  // Calendar display month
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());

  // Auto-route level & coach logic
  useEffect(() => {
    if (selectedLevel === "BEGINNER" || selectedLevel === "FOUNDATIONS") {
      if (!selectedCoachSlug) setSelectedCoachSlug("shreyash");
    } else if (selectedLevel === "INTERMEDIATE" || selectedLevel === "ADVANCED") {
      if (!selectedCoachSlug) setSelectedCoachSlug("tapesh");
    }
  }, [selectedLevel, selectedCoachSlug]);

  // Fetch slots whenever coach and sessionType are picked
  useEffect(() => {
    if (selectedCoachSlug && selectedSessionTypeId) {
      setIsLoadingSlots(true);
      setSlotsError("");
      fetch(`/api/bookings?coach=${selectedCoachSlug}&sessionType=${selectedSessionTypeId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setSlotsError(data.error);
            setAvailableSlots([]);
          } else {
            setAvailableSlots(data.slots || []);
          }
        })
        .catch(() => {
          setSlotsError("Could not retrieve availability. Please retry.");
        })
        .finally(() => {
          setIsLoadingSlots(false);
        });
    }
  }, [selectedCoachSlug, selectedSessionTypeId]);

  // Derived objects
  const activeCoach = coaches.find((c) => c.slug === selectedCoachSlug);
  const activeSessionType = sessionTypes.find((s) => s.id === selectedSessionTypeId);

  // Dates that have available slots
  const datesWithSlots = Array.from(new Set(availableSlots.map((s) => s.dateStr)));

  // Filter slots for selected date
  const slotsForSelectedDate = availableSlots.filter(
    (s) => s.dateStr === selectedDate
  );

  // Step names
  const stepLabels = [
    "01 LEVEL",
    "02 COACH",
    "03 SESSION",
    "04 DATE",
    "05 TIME",
    "06 LEARNER",
    "07 ACCOUNT",
    "08 REVIEW",
    "09 CONFIRMED",
  ];

  // Helper to handle inline auth submission
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmittingAuth(true);

    try {
      if (authMode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: authName,
            email: authEmail,
            password: authPassword,
            isMinor: isForChild,
            studentName: learnerName || authName,
            studentLevel: selectedLevel || "BEGINNER",
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");

        setCurrentUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          students: data.user.students || [],
        });
        setSelectedStudentId(data.user.students?.[0]?.id || "");
        setStep(8); // Move to review & pay
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: authEmail, password: authPassword }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");

        // Fetch user profiles
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        setCurrentUser({
          id: meData.user.id,
          email: meData.user.email,
          name: meData.user.name,
          students: meData.user.studentProfiles || [],
        });
        setSelectedStudentId(meData.user.studentProfiles?.[0]?.id || "");
        setStep(8); // Move to review & pay
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed";
      setAuthError(msg);
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Helper to trigger booking and payment
  const handleConfirmAndPay = async () => {
    if (!selectedSlot || !activeCoach || !activeSessionType) return;
    setIsBookingSubmitting(true);
    setBookingError("");

    try {
      // 1. Create pending booking
      const bookRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coachSlug: activeCoach.slug,
          sessionTypeId: activeSessionType.id,
          startsAt: selectedSlot.startsAt,
          studentId: selectedStudentId || currentUser?.students?.[0]?.id,
          utmSource: searchParams.get("utm_source") || undefined,
          utmMedium: searchParams.get("utm_medium") || undefined,
          utmCampaign: searchParams.get("utm_campaign") || undefined,
        }),
      });

      const bookData = await bookRes.json();
      if (!bookRes.ok) {
        throw new Error(bookData.error || "Failed to create booking");
      }

      const booking = bookData.booking;

      // 2. Initiate payment or confirm free trial
      const payRes = await fetch("/api/payments/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking.id }),
      });

      const payData = await payRes.json();
      if (!payRes.ok) {
        throw new Error(payData.error || "Payment initiation failed");
      }

      // If session is ₹0 (Free trial), confirmBooking was invoked automatically
      if (payData.free) {
        setConfirmedBookingData({
          reference: booking.reference,
          startsAt: booking.startsAt,
          durationMinutes: activeSessionType.durationMinutes,
          coachName: activeCoach.displayName,
          meetUrl: booking.meetUrl || activeCoach.defaultMeetUrl,
          pricePaise: 0,
        });
        setStep(9);
        return;
      }

      // If mock or real provider:
      if (payData.clientPayload.provider === "mock") {
        // Complete simulated verification
        const verifyRes = await fetch("/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookingId: booking.id,
            providerOrderId: payData.providerOrderId,
            providerPaymentId: `pay_mock_${Date.now()}`,
            signature: "mock_valid_signature",
          }),
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          throw new Error(verifyData.error || "Payment verification failed");
        }

        setConfirmedBookingData({
          reference: booking.reference,
          startsAt: booking.startsAt,
          durationMinutes: activeSessionType.durationMinutes,
          coachName: activeCoach.displayName,
          meetUrl: booking.meetUrl || activeCoach.defaultMeetUrl,
          pricePaise: activeSessionType.pricePaise,
        });
        setStep(9);
      } else {
        // Razorpay Checkout integration
        setBookingError("Razorpay live checkout modal is prepared for production environment.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Booking process failed";
      setBookingError(msg);
    } finally {
      setIsBookingSubmitting(false);
    }
  };

  // Helper for .ics calendar download
  const handleDownloadIcs = () => {
    if (!confirmedBookingData) return;
    const start = parseISO(confirmedBookingData.startsAt);
    const end = new Date(start.getTime() + confirmedBookingData.durationMinutes * 60000);

    const formatIcsDate = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Two Rooks//Chess Academy//EN",
      "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `SUMMARY:Chess Coaching with ${confirmedBookingData.coachName} (${confirmedBookingData.reference})`,
      `DESCRIPTION:1:1 Chess Class. Meet link: ${confirmedBookingData.meetUrl}`,
      `DTSTART:${formatIcsDate(start)}`,
      `DTEND:${formatIcsDate(end)}`,
      `LOCATION:${confirmedBookingData.meetUrl}`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `${confirmedBookingData.reference}-class.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-8 md:py-12">
      {/* Stepper Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none">
          {stepLabels.map((lbl, idx) => {
            const stepNum = idx + 1;
            const isCompleted = stepNum < step;
            const isCurrent = stepNum === step;

            return (
              <button
                key={lbl}
                onClick={() => {
                  if (isCompleted && step < 9) setStep(stepNum);
                }}
                disabled={!isCompleted || step === 9}
                className={`flex items-center gap-1.5 text-[11px] md:text-[12px] font-[family-name:var(--font-mono)] uppercase tracking-[0.04em] whitespace-nowrap px-2 py-1 rounded-[50px] transition-colors ${
                  isCurrent
                    ? "bg-[#e3fc03] text-[#000000] font-normal"
                    : isCompleted
                    ? "text-[#000000] hover:text-[#323232] cursor-pointer"
                    : "text-[#323232] opacity-40 cursor-not-allowed"
                }`}
              >
                <span>{lbl}</span>
                {idx < stepLabels.length - 1 && (
                  <span className="text-[#323232]/30 ml-1">/</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Left Flow / Right Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Active Step */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* STEP 1: LEVEL */}
          {step === 1 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h2 className="text-[26px] md:text-[32px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                  Select your current chess level
                </h2>
                <p className="text-[16px] text-[#323232] font-[family-name:var(--font-body)]">
                  Pick the tier that best matches you or your child&apos;s familiarity with chess.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {[
                  {
                    id: "BEGINNER",
                    title: "Absolute Beginner",
                    coachNote: "Coach Shreyash",
                    desc: "New to chess or learning piece movement and basic rules. Ideal for young children.",
                  },
                  {
                    id: "FOUNDATIONS",
                    title: "Foundations",
                    coachNote: "Coach Shreyash",
                    desc: "Knows rules, wants to learn checkmate patterns, basic tactics, and opening principles.",
                  },
                  {
                    id: "INTERMEDIATE",
                    title: "Intermediate",
                    coachNote: "Coach Tapesh (FIDE)",
                    desc: "Plays online or club games. Wants deeper tactics, positional play, and calculation.",
                  },
                  {
                    id: "ADVANCED",
                    title: "Advanced / Competitive",
                    coachNote: "Coach Tapesh (FIDE)",
                    desc: "Tournament player or rated competitor. Opening repertoires and deep game analysis.",
                  },
                ].map((lvl) => {
                  const isSelected = selectedLevel === lvl.id;
                  return (
                    <div
                      key={lvl.id}
                      onClick={() => {
                        setSelectedLevel(lvl.id);
                        if (lvl.id === "BEGINNER" || lvl.id === "FOUNDATIONS") {
                          setSelectedCoachSlug("shreyash");
                        } else {
                          setSelectedCoachSlug("tapesh");
                        }
                      }}
                      className={`p-5 rounded-[16px] border cursor-pointer transition-all duration-150 flex flex-col justify-between h-[180px] ${
                        isSelected
                          ? "border-2 border-[#000000] bg-[#e3fc03]/15"
                          : "border-[#000000] bg-[#ffffff] hover:border-[#323232]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[18px] font-[family-name:var(--font-heading)] text-[#000000]">
                            {lvl.title}
                          </span>
                          <Tag variant="outline" size="sm">
                            {lvl.coachNote}
                          </Tag>
                        </div>
                        <p className="text-[13px] text-[#323232] leading-[1.5]">
                          {lvl.desc}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-[family-name:var(--font-mono)] uppercase">
                        {isSelected ? (
                          <span className="text-[#000000] font-normal">Selected</span>
                        ) : (
                          <span className="text-[#323232]">Click to select</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Not sure? Trial routing */}
              <div className="p-4 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
                <div>
                  <span className="text-[14px] font-[family-name:var(--font-heading)] text-[#000000]">
                    Not sure where you stand?
                  </span>
                  <p className="text-[13px] text-[#323232]">
                    Book a free 30-minute diagnostic assessment session with a coach.
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSelectedLevel("BEGINNER");
                    setSelectedCoachSlug("shreyash");
                    const trial = sessionTypes.find((s) => s.isTrial);
                    if (trial) setSelectedSessionTypeId(trial.id);
                    setStep(2);
                  }}
                >
                  Diagnostic Class
                </Button>
              </div>

              <div className="mt-4 flex justify-end">
                <Button
                  variant="primary"
                  disabled={!selectedLevel}
                  onClick={() => setStep(2)}
                >
                  Continue to Coach
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: COACH */}
          {step === 2 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h2 className="text-[26px] md:text-[32px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                  Choose your coach
                </h2>
                <p className="text-[16px] text-[#323232] font-[family-name:var(--font-body)]">
                  Each coach specializes in specific stages of mastery.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {coaches.map((coach) => {
                  const isSelected = selectedCoachSlug === coach.slug;
                  const isShreyash = coach.slug === "shreyash";
                  const coachBrand = isShreyash
                    ? BRAND_CONFIG.coaches.shreyash
                    : BRAND_CONFIG.coaches.tapesh;

                  return (
                    <div
                      key={coach.id}
                      onClick={() => setSelectedCoachSlug(coach.slug)}
                      className={`p-5 rounded-[16px] border cursor-pointer transition-all duration-150 flex flex-col justify-between ${
                        isSelected
                          ? "border-2 border-[#000000] bg-[#e3fc03]/15"
                          : "border-[#000000] bg-[#ffffff] hover:border-[#323232]"
                      }`}
                    >
                      <div>
                        {/* Top bar with avatar placeholder */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-[44px] h-[44px] rounded-[16px] bg-[#e6e6e6] border border-[#000000] flex items-center justify-center font-[family-name:var(--font-mono)] text-[16px]">
                            {coachBrand.avatarPlaceholderInitial}
                          </div>
                          <div>
                            <span className="text-[20px] font-[family-name:var(--font-heading)] text-[#000000]">
                              {coach.displayName}
                            </span>
                            {coach.fideRating ? (
                              <p className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                                FIDE {coach.fideRating}
                              </p>
                            ) : coachBrand.fideRated ? (
                              <p className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                                FIDE-rated Player
                              </p>
                            ) : (
                              <p className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                                Foundations Specialist
                              </p>
                            )}
                          </div>
                        </div>

                        <p className="text-[13px] text-[#323232] leading-[1.6]">
                          {coachBrand.focus}
                        </p>
                      </div>

                      <div className="pt-4 mt-4 border-t border-[#000000]/10 flex items-center justify-between">
                        <Tag variant={isSelected ? "lime" : "outline"} size="sm">
                          {isSelected ? "Selected" : "Select Coach"}
                        </Tag>
                        <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                          Live on Meet
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  disabled={!selectedCoachSlug}
                  onClick={() => setStep(3)}
                >
                  Continue to Session
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: SESSION TYPE */}
          {step === 3 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h2 className="text-[26px] md:text-[32px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                  Select class type
                </h2>
                <p className="text-[16px] text-[#323232] font-[family-name:var(--font-body)]">
                  Available sessions offered by {activeCoach?.displayName}.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-2">
                {sessionTypes
                  .filter((st) => st.coachId === activeCoach?.id)
                  .map((session) => {
                    const isSelected = selectedSessionTypeId === session.id;
                    const priceFormatted =
                      session.pricePaise === 0
                        ? "Free Trial"
                        : `₹${(session.pricePaise / 100).toLocaleString("en-IN")}`;

                    return (
                      <div
                        key={session.id}
                        onClick={() => setSelectedSessionTypeId(session.id)}
                        className={`p-5 rounded-[16px] border cursor-pointer transition-all duration-150 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                          isSelected
                            ? "border-2 border-[#000000] bg-[#e3fc03]/15"
                            : "border-[#000000] bg-[#ffffff] hover:border-[#323232]"
                        }`}
                      >
                        <div className="flex flex-col gap-1 max-w-[480px]">
                          <div className="flex items-center gap-2">
                            <span className="text-[18px] font-[family-name:var(--font-heading)] text-[#000000]">
                              {session.name}
                            </span>
                            {session.isTrial && (
                              <Tag variant="lime" size="sm">
                                Assessment
                              </Tag>
                            )}
                          </div>
                          <p className="text-[13px] text-[#323232]">
                            {session.description}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                            <span className="flex items-center gap-1">
                              <Clock size={13} strokeWidth={1.5} />
                              {session.durationMinutes} min
                            </span>
                            <span>·</span>
                            <span>Includes Meet link + Homework</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-[#000000]/10">
                          <span className="text-[20px] font-[family-name:var(--font-mono)] text-[#000000]">
                            {priceFormatted}
                          </span>
                          <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] mt-0.5">
                            {isSelected ? "Selected" : "Select"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button variant="secondary" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  disabled={!selectedSessionTypeId}
                  onClick={() => setStep(4)}
                >
                  Continue to Calendar
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: DATE PICKER */}
          {step === 4 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h2 className="text-[26px] md:text-[32px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                  Pick a date
                </h2>
                <p className="text-[16px] text-[#323232] font-[family-name:var(--font-body)]">
                  Only dates with open slots for {activeCoach?.displayName} are selectable.
                </p>
              </div>

              {isLoadingSlots ? (
                <div className="flex flex-col items-center justify-center p-12 border border-[#000000] rounded-[16px]">
                  <KnightPath />
                </div>
              ) : slotsError ? (
                <div className="p-6 border-2 border-[#000000] rounded-[16px] text-center">
                  <p className="text-[14px] text-[#B3261E] mb-3">{slotsError}</p>
                  <Button variant="secondary" size="sm" onClick={() => setStep(3)}>
                    Change Session Type
                  </Button>
                </div>
              ) : (
                <div className="border border-[#000000] rounded-[16px] p-5 bg-[#ffffff]">
                  {/* Calendar Month Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-[#000000]/10">
                    <span className="text-[16px] font-[family-name:var(--font-heading)] uppercase tracking-[0.04em]">
                      {format(currentMonth, "MMMM yyyy")}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
                        className="w-[36px] h-[36px] rounded-[50px] inline-flex items-center justify-center border border-[#000000] hover:bg-[#fafafa]"
                        aria-label="Previous month"
                      >
                        <ChevronLeft size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
                        className="w-[36px] h-[36px] rounded-[50px] inline-flex items-center justify-center border border-[#000000] hover:bg-[#fafafa]"
                        aria-label="Next month"
                      >
                        <ChevronRight size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>

                  {/* Day of Week Headers with subtle rank & file labels */}
                  <div className="grid grid-cols-7 gap-1 text-center py-3 text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                    {[
                      { name: "Sun", file: "a" },
                      { name: "Mon", file: "b" },
                      { name: "Tue", file: "c" },
                      { name: "Wed", file: "d" },
                      { name: "Thu", file: "e" },
                      { name: "Fri", file: "f" },
                      { name: "Sat", file: "g" },
                    ].map((d) => (
                      <div key={d.name} className="flex flex-col items-center">
                        <span className="font-normal">{d.name}</span>
                        <span aria-hidden="true" className="text-[9px] opacity-40">
                          {d.file}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {Array.from({ length: 35 }).map((_, idx) => {
                      const firstDayOfMonth = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        1
                      );
                      const startDay = firstDayOfMonth.getDay();
                      const dayNumber = idx - startDay + 1;
                      const dateObj = new Date(
                        currentMonth.getFullYear(),
                        currentMonth.getMonth(),
                        dayNumber
                      );
                      const isCurrentMonth =
                        dateObj.getMonth() === currentMonth.getMonth();
                      const dateStr = format(dateObj, "yyyy-MM-dd");
                      const hasSlots = datesWithSlots.includes(dateStr);
                      const isSelected = selectedDate === dateStr;
                      const isToday = isSameDay(dateObj, new Date());

                      if (!isCurrentMonth) {
                        return <div key={idx} className="h-[44px]" />;
                      }

                      return (
                        <button
                          key={idx}
                          disabled={!hasSlots}
                          onClick={() => {
                            setSelectedDate(dateStr);
                            setSelectedSlot(null); // Reset time when date changes
                          }}
                          className={`h-[44px] rounded-[50px] flex flex-col items-center justify-center font-[family-name:var(--font-mono)] text-[14px] transition-all relative ${
                            isSelected
                              ? "bg-[#e3fc03] text-[#000000] font-normal border border-[#000000]"
                              : hasSlots
                              ? "bg-[#ffffff] text-[#000000] border border-[#000000]/20 hover:border-[#000000] cursor-pointer"
                              : "text-[#323232]/30 cursor-not-allowed"
                          }`}
                        >
                          <span>{dayNumber}</span>
                          {isToday && !isSelected && (
                            <span className="w-1 h-1 rounded-full bg-[#000000] mt-0.5" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <Button variant="secondary" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  disabled={!selectedDate}
                  onClick={() => setStep(5)}
                >
                  Continue to Times
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: TIME SLOT PICKER */}
          {step === 5 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h2 className="text-[26px] md:text-[32px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                  Select session time
                </h2>
                <p className="text-[16px] text-[#323232] font-[family-name:var(--font-body)]">
                  Available times for {selectedDate} (IST).
                </p>
              </div>

              {slotsForSelectedDate.length === 0 ? (
                <div className="p-8 border border-[#000000] rounded-[16px] text-center">
                  <p className="text-[14px] text-[#323232] mb-3">
                    No open slots remaining on this date.
                  </p>
                  <Button variant="secondary" size="sm" onClick={() => setStep(4)}>
                    Select another date
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {slotsForSelectedDate.map((slot) => {
                    const isSelected = selectedSlot?.startsAt === slot.startsAt;

                    return (
                      <button
                        key={slot.startsAt}
                        onClick={() => setSelectedSlot(slot)}
                        className={`h-[48px] px-4 rounded-[50px] font-[family-name:var(--font-mono)] text-[14px] border transition-all duration-150 flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-[#e3fc03] text-[#000000] border-2 border-[#000000]"
                            : "bg-[#ffffff] text-[#000000] border-[#000000] hover:bg-[#fafafa]"
                        }`}
                      >
                        {slot.timeStr} IST
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <Button variant="secondary" onClick={() => setStep(4)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  disabled={!selectedSlot}
                  onClick={() => setStep(currentUser ? 6 : 7)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* STEP 6: LEARNER PROFILE (WHO IS IT FOR) */}
          {step === 6 && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h2 className="text-[26px] md:text-[32px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                  Who is this class for?
                </h2>
                <p className="text-[16px] text-[#323232] font-[family-name:var(--font-body)]">
                  Coaching is customized to the learner&apos;s background and goals.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <button
                    onClick={() => setIsForChild(false)}
                    className={`h-[44px] px-6 rounded-[50px] border text-[14px] font-[family-name:var(--font-mono)] transition-all ${
                      !isForChild
                        ? "bg-[#e3fc03] text-[#000000] border-2 border-[#000000]"
                        : "bg-[#ffffff] text-[#000000] border-[#000000]"
                    }`}
                  >
                    Myself
                  </button>
                  <button
                    onClick={() => setIsForChild(true)}
                    className={`h-[44px] px-6 rounded-[50px] border text-[14px] font-[family-name:var(--font-mono)] transition-all ${
                      isForChild
                        ? "bg-[#e3fc03] text-[#000000] border-2 border-[#000000]"
                        : "bg-[#ffffff] text-[#000000] border-[#000000]"
                    }`}
                  >
                    My Child
                  </button>
                </div>

                {currentUser?.students && currentUser.students.length > 0 && (
                  <div className="flex flex-col gap-2 mt-2">
                    <label className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                      Select Student Profile
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {currentUser.students.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => {
                            setSelectedStudentId(st.id);
                            setLearnerName(st.displayName);
                          }}
                          className={`h-[38px] px-4 rounded-[50px] border text-[13px] font-[family-name:var(--font-mono)] ${
                            selectedStudentId === st.id
                              ? "bg-[#e3fc03] text-[#000000] border-2 border-[#000000]"
                              : "bg-[#ffffff] text-[#000000] border-[#000000]"
                          }`}
                        >
                          {st.displayName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <Input
                  label="Student Full Name"
                  value={learnerName}
                  onChange={(e) => setLearnerName(e.target.value)}
                  placeholder="e.g. Arjun Patel"
                />
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Button variant="secondary" onClick={() => setStep(5)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  disabled={!learnerName.trim()}
                  onClick={() => setStep(currentUser ? 8 : 7)}
                >
                  Continue to Review
                </Button>
              </div>
            </div>
          )}

          {/* STEP 7: ACCOUNT / INLINE AUTH (NO PAGE RELOAD) */}
          {step === 7 && !currentUser && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div>
                <h2 className="text-[26px] md:text-[32px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                  {authMode === "signup" ? "Create your account" : "Log in to your account"}
                </h2>
                <p className="text-[16px] text-[#323232] font-[family-name:var(--font-body)]">
                  Your booking details and Meet link will be saved to your dashboard.
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-4 mt-2">
                {authMode === "signup" && (
                  <Input
                    label="Full Name"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required
                    placeholder="e.g. Meera Patel"
                  />
                )}

                <Input
                  label="Email Address"
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />

                <Input
                  label="Password"
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                />

                {isForChild && authMode === "signup" && (
                  <label className="flex items-start gap-2.5 text-[13px] text-[#323232] mt-1 select-none">
                    <input
                      type="checkbox"
                      required
                      className="mt-1 w-4 h-4 rounded border-[#000000] accent-[#000000]"
                    />
                    <span>
                      I confirm I am the parent or legal guardian booking on behalf of a minor student.
                    </span>
                  </label>
                )}

                {authError && (
                  <div className="flex items-center gap-2 text-[13px] text-[#B3261E]">
                    <AlertCircle size={15} strokeWidth={1.5} />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode(authMode === "signup" ? "login" : "signup");
                      setAuthError("");
                    }}
                    className="text-[13px] text-[#323232] hover-underline-animation"
                  >
                    {authMode === "signup"
                      ? "Already have an account? Log in"
                      : "New here? Create account"}
                  </button>

                  <Button
                    type="submit"
                    variant="primary"
                    disabled={isSubmittingAuth}
                  >
                    {isSubmittingAuth
                      ? "Verifying..."
                      : authMode === "signup"
                      ? "Create Account & Continue"
                      : "Log In & Continue"}
                  </Button>
                </div>
              </form>

              <div className="mt-2">
                <Button variant="secondary" onClick={() => setStep(5)}>
                  Back
                </Button>
              </div>
            </div>
          )}

          {/* STEP 8: REVIEW AND PAY */}
          {step === 8 && (
            <div className="flex flex-col gap-6 animate-fade-in">
              <div>
                <h2 className="text-[26px] md:text-[32px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                  Review and confirm
                </h2>
                <p className="text-[16px] text-[#323232] font-[family-name:var(--font-body)]">
                  Confirm your session time and complete your booking.
                </p>
              </div>

              <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
                <div className="flex items-center justify-between pb-4 border-b border-[#000000]/10">
                  <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                    Coach
                  </span>
                  <span className="text-[16px] font-[family-name:var(--font-heading)] text-[#000000]">
                    {activeCoach?.displayName}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-[#000000]/10">
                  <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                    Class Type
                  </span>
                  <span className="text-[16px] text-[#000000]">
                    {activeSessionType?.name} ({activeSessionType?.durationMinutes} min)
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-[#000000]/10">
                  <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                    Date & Time
                  </span>
                  <span className="text-[16px] font-[family-name:var(--font-mono)] text-[#000000]">
                    {selectedDate} at {selectedSlot?.timeStr} IST
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-[#000000]/10">
                  <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                    Learner Profile
                  </span>
                  <span className="text-[16px] text-[#000000]">
                    {learnerName || currentUser?.name}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[16px] font-[family-name:var(--font-heading)] text-[#000000]">
                    Total Amount
                  </span>
                  <span className="text-[24px] font-[family-name:var(--font-mono)] text-[#000000]">
                    {activeSessionType?.pricePaise === 0
                      ? "Free Assessment"
                      : `₹${((activeSessionType?.pricePaise || 0) / 100).toLocaleString("en-IN")}`}
                  </span>
                </div>
              </div>

              {/* Policy Reassurance */}
              <div className="p-4 border border-[#000000] rounded-[16px] bg-[#ffffff] flex items-start gap-3">
                <ShieldCheck size={20} strokeWidth={1.5} className="text-[#000000] shrink-0 mt-0.5" />
                <div className="text-[13px] text-[#323232] leading-[1.5]">
                  <p className="text-[#000000] font-normal">Cancellation & Reschedule Policy</p>
                  <p>{POLICY_CONFIG.refundPolicySummary}</p>
                </div>
              </div>

              {bookingError && (
                <div className="p-4 border-2 border-[#000000] rounded-[16px] text-[13px] text-[#B3261E] flex items-center gap-2">
                  <AlertCircle size={16} strokeWidth={1.5} />
                  <span>{bookingError}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Button variant="secondary" onClick={() => setStep(6)}>
                  Back
                </Button>

                <Button
                  variant="primary"
                  size="lg"
                  disabled={isBookingSubmitting}
                  onClick={handleConfirmAndPay}
                >
                  {isBookingSubmitting
                    ? "Securing slot..."
                    : activeSessionType?.pricePaise === 0
                    ? "Confirm Assessment Class"
                    : `Pay ₹${((activeSessionType?.pricePaise || 0) / 100).toLocaleString("en-IN")} and Confirm`}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 9: CONFIRMATION SCREEN */}
          {step === 9 && confirmedBookingData && (
            <div className="flex flex-col items-center text-center gap-6 animate-fade-in py-6">
              {/* Signature Knight Animation Landing on Lime Square */}
              <KnightPath isConfirmation={true} />

              <div className="max-w-[480px]">
                <Tag variant="lime" size="md" className="mb-3">
                  {confirmedBookingData.reference}
                </Tag>
                <h2 className="text-[32px] md:text-[38px] font-[family-name:var(--font-heading)] font-normal text-[#000000] mb-2">
                  Your class is booked.
                </h2>
                <p className="text-[16px] text-[#323232] leading-[1.6]">
                  A confirmation email has been dispatched with calendar invite and meeting details.
                </p>
              </div>

              {/* Class Card */}
              <div className="w-full max-w-[520px] p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] text-left flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10">
                  <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                    Coach
                  </span>
                  <span className="text-[16px] font-[family-name:var(--font-heading)] text-[#000000]">
                    {confirmedBookingData.coachName}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10">
                  <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                    Time
                  </span>
                  <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#000000]">
                    {format(parseISO(confirmedBookingData.startsAt), "PPpp")} IST
                  </span>
                </div>

                {/* Google Meet Link Display */}
                <div className="p-4 rounded-[16px] bg-[#e6e6e6]/60 border border-[#000000]/20 flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#000000]">
                    <Video size={16} strokeWidth={1.5} />
                    <span>Google Meet Classroom</span>
                  </div>
                  <a
                    href={confirmedBookingData.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-[family-name:var(--font-mono)] text-[#000000] underline break-all"
                  >
                    {confirmedBookingData.meetUrl}
                  </a>
                  <p className="text-[11px] text-[#323232]">
                    Link activates 10 minutes prior to class start.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-[520px]">
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  onClick={handleDownloadIcs}
                  className="flex items-center justify-center gap-2"
                >
                  <Download size={16} strokeWidth={1.5} />
                  <span>Add to Calendar (.ics)</span>
                </Button>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  href="/app"
                >
                  Open in Dashboard
                </Button>
              </div>

              {/* What to prepare checklist */}
              <div className="w-full max-w-[520px] p-5 border border-[#000000] rounded-[16px] text-left">
                <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000]">
                  What to prepare:
                </span>
                <ul className="mt-2 text-[13px] text-[#323232] space-y-1.5 list-disc list-inside">
                  <li>A laptop or tablet with a working microphone and camera.</li>
                  <li>Stable internet connection.</li>
                  <li>Physical chessboard optional (board is shared on screen).</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Persistent Summary Card (Desktop) */}
        {step < 9 && (
          <div className="hidden lg:block lg:col-span-4 sticky top-6">
            <Card className="flex flex-col gap-4">
              <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase tracking-[0.06em] text-[#323232] pb-2 border-b border-[#000000]/10">
                Session Summary
              </span>

              <div className="flex flex-col gap-3 text-[14px]">
                <div>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
                    Level
                  </span>
                  <span className="text-[15px] text-[#000000]">
                    {selectedLevel || "Not selected yet"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
                    Coach
                  </span>
                  <span className="text-[15px] text-[#000000]">
                    {activeCoach?.displayName || "Not selected yet"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
                    Session
                  </span>
                  <span className="text-[15px] text-[#000000]">
                    {activeSessionType?.name || "Not selected yet"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
                    Date & Time
                  </span>
                  <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#000000]">
                    {selectedDate && selectedSlot
                      ? `${selectedDate} · ${selectedSlot.timeStr} IST`
                      : "Pending selection"}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#000000]/10 flex items-center justify-between">
                <span className="text-[14px] font-[family-name:var(--font-heading)] text-[#000000]">
                  Price
                </span>
                <span className="text-[20px] font-[family-name:var(--font-mono)] text-[#000000]">
                  {activeSessionType
                    ? activeSessionType.pricePaise === 0
                      ? "Free Assessment"
                      : `₹${(activeSessionType.pricePaise / 100).toLocaleString("en-IN")}`
                    : "—"}
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
