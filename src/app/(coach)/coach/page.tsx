import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { MeetJoinButton } from "@/components/dashboard/MeetJoinButton";
import { format, startOfDay, endOfDay, addDays, startOfMonth, subMonths } from "date-fns";
import { Video, AlertCircle, Clock, Calendar, CheckSquare } from "lucide-react";

export default async function CoachDashboardPage() {
  const session = await requireRole(["COACH", "ADMIN"]);

  const coach = await prisma.coach.findFirst({
    where: { userId: session.id },
  });

  if (!coach) {
    return <div>Coach profile not associated with this account</div>;
  }

  const coachTabs: NavTabItem[] = [
    { label: "Overview", href: "/coach" },
    { label: "Sessions", href: "/coach/sessions" },
    { label: "Students", href: "/coach/students" },
    { label: "Schedule & Hours", href: "/coach/schedule" },
    { label: "Payments", href: "/coach/payments" },
    { label: "Profile & Meet", href: "/coach/profile" },
  ];

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);

  // 1. Today's sessions
  const todaysSessions = await prisma.booking.findMany({
    where: {
      coachId: coach.id,
      startsAt: { gte: todayStart, lte: todayEnd },
      status: { in: ["CONFIRMED", "COMPLETED"] },
    },
    include: { student: true, sessionType: true, coachNotes: true },
    orderBy: { startsAt: "asc" },
  });

  // 2. Needs Attention:
  // - Completed sessions without any notes
  const completedWithoutNotes = await prisma.booking.findMany({
    where: {
      coachId: coach.id,
      status: "COMPLETED",
      coachNotes: { none: {} },
    },
    include: { student: true, sessionType: true },
    take: 3,
  });

  // - Homework submitted awaiting review
  const homeworkAwaitingReview = await prisma.homework.findMany({
    where: {
      coachId: coach.id,
      status: "SUBMITTED",
    },
    include: { student: true },
    take: 3,
  });

  // 3. Upcoming 7 days count
  const next7DaysCount = await prisma.booking.count({
    where: {
      coachId: coach.id,
      startsAt: { gte: now, lte: addDays(now, 7) },
      status: "CONFIRMED",
    },
  });

  // 4. Payments overview: this month vs last month
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));

  const thisMonthPayments = await prisma.payment.aggregate({
    where: {
      booking: { coachId: coach.id },
      status: "CAPTURED",
      createdAt: { gte: thisMonthStart },
    },
    _sum: { amountPaise: true },
    _count: true,
  });

  const lastMonthPayments = await prisma.payment.aggregate({
    where: {
      booking: { coachId: coach.id },
      status: "CAPTURED",
      createdAt: { gte: lastMonthStart, lt: thisMonthStart },
    },
    _sum: { amountPaise: true },
    _count: true,
  });

  const thisMonthEarnings = (thisMonthPayments._sum.amountPaise || 0) / 100;
  const lastMonthEarnings = (lastMonthPayments._sum.amountPaise || 0) / 100;

  return (
    <DashboardShell
      role="COACH"
      userName={session.name}
      title="Coach Command Center"
      subtitle={`Coach ${coach.displayName} · Today is ${format(now, "EEEE, MMMM d")}`}
      tabs={coachTabs}
      headerActions={
        <Button href="/coach/schedule" variant="secondary" size="sm">
          Edit Availability
        </Button>
      }
    >
      {/* Overview Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
            Today&apos;s Sessions
          </span>
          <span className="text-[28px] font-[family-name:var(--font-mono)] text-[#000000]">
            {todaysSessions.length}
          </span>
        </Card>

        <Card>
          <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
            Upcoming Next 7 Days
          </span>
          <span className="text-[28px] font-[family-name:var(--font-mono)] text-[#000000]">
            {next7DaysCount}
          </span>
        </Card>

        <Card>
          <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
            This Month&apos;s Booked Volume
          </span>
          <span className="text-[28px] font-[family-name:var(--font-mono)] text-[#000000]">
            ₹{thisMonthEarnings.toLocaleString("en-IN")}
          </span>
        </Card>
      </div>

      {/* Today's Sessions Timeline */}
      <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000]">
            Today&apos;s Sessions Timeline
          </span>
          <Link
            href="/coach/sessions"
            className="text-[12px] font-[family-name:var(--font-mono)] text-[#000000] hover-underline-animation"
          >
            All sessions &rarr;
          </Link>
        </div>

        {todaysSessions.length === 0 ? (
          <p className="text-[14px] text-[#323232] py-6 text-center">
            No sessions scheduled for today. Check your upcoming 7-day schedule.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-[#000000]/10">
            {todaysSessions.map((s) => {
              const meetUrl = s.meetUrl || coach.defaultMeetUrl;

              return (
                <div
                  key={s.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[18px] font-[family-name:var(--font-mono)] text-[#000000]">
                        {format(s.startsAt, "HH:mm")} IST
                      </span>
                      <Tag variant="outline" size="sm">
                        {s.sessionType.name}
                      </Tag>
                    </div>

                    <span className="text-[14px] text-[#000000]">
                      Student: <strong>{s.student.displayName}</strong> ({s.student.level})
                    </span>

                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232]">
                      Ref: {s.reference} · {s.sessionType.durationMinutes} min
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <MeetJoinButton
                      startsAt={s.startsAt}
                      endsAt={s.endsAt}
                      meetUrl={meetUrl}
                    />

                    <Link
                      href={`/coach/sessions/${s.id}`}
                      className="h-[36px] px-3 rounded-[50px] border border-[#000000] inline-flex items-center text-[12px] font-[family-name:var(--font-mono)] uppercase hover:bg-[#fafafa]"
                    >
                      Session Hub
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Needs Attention Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Completed without notes */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10 mb-3">
            <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
              Sessions Awaiting Notes ({completedWithoutNotes.length})
            </span>
          </div>

          {completedWithoutNotes.length === 0 ? (
            <p className="text-[13px] text-[#323232] py-2">
              All finished sessions have recorded notes.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[#000000]/10">
              {completedWithoutNotes.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[14px] text-[#000000] block">
                      {c.student.displayName}
                    </span>
                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232]">
                      {c.reference} · {format(c.startsAt, "PP")}
                    </span>
                  </div>
                  <Button
                    href={`/coach/sessions/${c.id}`}
                    variant="secondary"
                    size="sm"
                  >
                    Add Notes
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Homework Awaiting Review */}
        <Card>
          <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10 mb-3">
            <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
              Homework To Review ({homeworkAwaitingReview.length})
            </span>
          </div>

          {homeworkAwaitingReview.length === 0 ? (
            <p className="text-[13px] text-[#323232] py-2">
              No pending student homework submissions.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[#000000]/10">
              {homeworkAwaitingReview.map((hw) => (
                <div key={hw.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[14px] text-[#000000] block">{hw.title}</span>
                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232]">
                      Student: {hw.student.displayName}
                    </span>
                  </div>
                  <Button
                    href={`/coach/students/${hw.studentId}`}
                    variant="secondary"
                    size="sm"
                  >
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Financial Snapshot */}
      <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-3">
        <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
          Earnings Comparison
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[14px]">
          <div className="p-4 rounded-[16px] bg-[#fafafa] border border-[#000000]/10">
            <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
              This Month ({format(now, "MMMM yyyy")})
            </span>
            <span className="text-[22px] font-[family-name:var(--font-mono)] text-[#000000]">
              ₹{thisMonthEarnings.toLocaleString("en-IN")}
            </span>
            <p className="text-[11px] text-[#323232] mt-1">
              {thisMonthPayments._count} completed transactions
            </p>
          </div>

          <div className="p-4 rounded-[16px] bg-[#fafafa] border border-[#000000]/10">
            <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
              Previous Month ({format(subMonths(now, 1), "MMMM yyyy")})
            </span>
            <span className="text-[22px] font-[family-name:var(--font-mono)] text-[#000000]">
              ₹{lastMonthEarnings.toLocaleString("en-IN")}
            </span>
            <p className="text-[11px] text-[#323232] mt-1">
              {lastMonthPayments._count} completed transactions
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
