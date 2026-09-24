import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { POLICY_CONFIG } from "@/config/policy";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MeetJoinButton } from "@/components/dashboard/MeetJoinButton";
import { format, addHours, isBefore } from "date-fns";
import { Video, Calendar, Clock, AlertCircle, ShieldCheck } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ action?: string; error?: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;
  const { action, error: queryError } = await searchParams;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      coach: true,
      sessionType: true,
      student: true,
      bookedByUser: true,
    },
  });

  if (!booking) notFound();

  // Ownership check
  const isOwner = booking.bookedByUserId === session.id;
  const isCoach = booking.coach.userId === session.id;
  const isAdmin = session.role === "ADMIN";

  if (!isOwner && !isCoach && !isAdmin) {
    redirect("/app");
  }

  const meetUrl = booking.meetUrl || booking.coach.defaultMeetUrl;
  const isConfirmed = booking.status === "CONFIRMED";
  const isCancelled = booking.status === "CANCELLED";
  const now = new Date();
  const minNoticeTime = addHours(now, POLICY_CONFIG.cancelNoticeHours);
  const canModify = isConfirmed && !isBefore(booking.startsAt, minNoticeTime);

  // Server Action for user cancellation
  async function handleCancelClass(formData: FormData) {
    "use server";
    const reason = (formData.get("reason") as string) || "Customer requested cancellation";

    try {
      const { cancelBooking } = await import("@/server/services/bookingService");
      await cancelBooking(id, session.id, reason);
      revalidatePath(`/app/classes/${id}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Cancellation failed";
      redirect(`/app/classes/${id}?error=${encodeURIComponent(msg)}`);
    }
  }

  const studentTabs: NavTabItem[] = [
    { label: "Overview", href: "/app" },
    { label: "Book Class", href: "/book" },
    { label: "My Classes", href: "/app/classes" },
    { label: "Class History", href: "/app/history" },
    { label: "Skill Progress", href: "/app/progress" },
    { label: "Goals", href: "/app/goals" },
    { label: "Homework", href: "/app/homework" },
    { label: "Coach Notes", href: "/app/notes" },
    { label: "Payments", href: "/app/payments" },
    { label: "Profiles", href: "/app/profile" },
  ];

  return (
    <DashboardShell
      role={session.role}
      userName={session.name}
      title={`Class Details (${booking.reference})`}
      subtitle={`Session with Coach ${booking.coach.displayName}`}
      tabs={studentTabs}
      headerActions={
        <Link
          href="/app/classes"
          className="text-[13px] font-[family-name:var(--font-mono)] text-[#000000] hover-underline-animation"
        >
          &larr; Back to all classes
        </Link>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Status Bar */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Tag
              variant={
                isConfirmed
                  ? "lime"
                  : isCancelled
                  ? "cancelled"
                  : "outline"
              }
              size="md"
            >
              {booking.status}
            </Tag>
            <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#323232]">
              Booking Ref: {booking.reference}
            </span>
          </div>

          {isConfirmed && (
            <MeetJoinButton
              startsAt={booking.startsAt}
              endsAt={booking.endsAt}
              meetUrl={meetUrl}
            />
          )}
        </div>

        {queryError && (
          <div className="p-4 border-2 border-[#000000] rounded-[16px] text-[13px] text-[#B3261E] flex items-center gap-2">
            <AlertCircle size={16} strokeWidth={1.5} />
            <span>{queryError}</span>
          </div>
        )}

        {/* Detailed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block pb-2 border-b border-[#000000]/10 mb-3">
              Schedule & Logistics
            </span>
            <div className="flex flex-col gap-3 text-[14px]">
              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                  Date
                </span>
                <span className="text-[16px] text-[#000000]">
                  {format(booking.startsAt, "EEEE, MMMM d, yyyy")}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                  Time & Duration
                </span>
                <span className="text-[16px] font-[family-name:var(--font-mono)] text-[#000000]">
                  {format(booking.startsAt, "HH:mm")} IST ({booking.sessionType.durationMinutes} min)
                </span>
              </div>

              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                  Classroom Meet URL
                </span>
                <a
                  href={meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[14px] font-[family-name:var(--font-mono)] text-[#000000] underline break-all"
                >
                  {meetUrl}
                </a>
              </div>
            </div>
          </Card>

          <Card>
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block pb-2 border-b border-[#000000]/10 mb-3">
              Session & Student
            </span>
            <div className="flex flex-col gap-3 text-[14px]">
              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                  Coach
                </span>
                <span className="text-[16px] text-[#000000]">
                  Coach {booking.coach.displayName}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                  Session Format
                </span>
                <span className="text-[16px] text-[#000000]">
                  {booking.sessionType.name}
                </span>
              </div>

              <div>
                <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                  Student Profile
                </span>
                <span className="text-[16px] text-[#000000]">
                  {booking.student.displayName}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Cancellation or Reschedule Form if action active */}
        {isConfirmed && canModify && (
          <div className="p-6 border border-[#000000] rounded-[16px] bg-[#fafafa] flex flex-col gap-4">
            <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000]">
              Change or Cancel Session
            </span>
            <p className="text-[13px] text-[#323232]">
              You can cancel or reschedule up to {POLICY_CONFIG.cancelNoticeHours} hours before class start free of charge.
            </p>

            <form action={handleCancelClass} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
              <input
                type="text"
                name="reason"
                placeholder="Reason for cancellation (optional)"
                className="h-[44px] px-4 rounded-[50px] border border-[#000000] text-[14px] w-full max-w-[320px] outline-none"
              />
              <Button type="submit" variant="secondary" size="md">
                Cancel Session
              </Button>
            </form>
          </div>
        )}

        {isCancelled && (
          <div className="p-6 border border-dashed border-[#000000] rounded-[16px] bg-[#fafafa]">
            <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#000000] block mb-1">
              Cancellation Record
            </span>
            <p className="text-[13px] text-[#323232]">
              Cancelled by: {booking.cancelledBy} on {booking.cancelledAt ? format(booking.cancelledAt, "PPpp") : "—"}.
            </p>
            {booking.cancelReason && (
              <p className="text-[13px] text-[#323232] mt-1 italic">
                Reason: &ldquo;{booking.cancelReason}&rdquo;
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
