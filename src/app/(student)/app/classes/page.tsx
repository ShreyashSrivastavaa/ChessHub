import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { MeetJoinButton } from "@/components/dashboard/MeetJoinButton";
import { format } from "date-fns";

export default async function StudentClassesPage() {
  const session = await requireRole(["STUDENT", "COACH", "ADMIN"]);

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { studentProfiles: true },
  });

  const studentIds = user?.studentProfiles.map((s) => s.id) || [];

  const upcomingClasses = await prisma.booking.findMany({
    where: {
      studentId: { in: studentIds },
      status: { in: ["CONFIRMED", "PENDING_PAYMENT"] },
      endsAt: { gt: new Date() },
    },
    include: {
      coach: true,
      sessionType: true,
      student: true,
    },
    orderBy: { startsAt: "asc" },
  });

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
      role="STUDENT"
      userName={session.name}
      title="Upcoming Classes"
      subtitle="Scheduled 1:1 sessions on Google Meet"
      tabs={studentTabs}
      headerActions={
        <Button href="/book" variant="primary" size="sm">
          Book Another Class
        </Button>
      }
    >
      {upcomingClasses.length === 0 ? (
        <EmptyState
          title="No upcoming classes scheduled"
          description="Your upcoming confirmed bookings will appear here with your Google Meet link."
          actionLabel="Book a Class"
          actionHref="/book"
        />
      ) : (
        <div className="flex flex-col gap-4">
          {upcomingClasses.map((cls) => {
            const isConfirmed = cls.status === "CONFIRMED";
            const meetUrl = cls.meetUrl || cls.coach.defaultMeetUrl;

            return (
              <div
                key={cls.id}
                className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Tag variant={isConfirmed ? "lime" : "outline"} size="sm">
                      {isConfirmed ? "Confirmed" : "Pending Hold"}
                    </Tag>
                    <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#323232]">
                      {cls.reference} · {cls.student.displayName}
                    </span>
                  </div>

                  <h3 className="text-[22px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                    {format(cls.startsAt, "EEEE, MMMM d, yyyy")}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[14px] text-[#323232] font-[family-name:var(--font-mono)]">
                    <span className="text-[#000000]">
                      {format(cls.startsAt, "HH:mm")} IST ({cls.sessionType.durationMinutes} min)
                    </span>
                    <span>·</span>
                    <span>Coach {cls.coach.displayName}</span>
                    <span>·</span>
                    <span>{cls.sessionType.name}</span>
                  </div>
                </div>

                <div className="flex flex-col items-start md:items-end justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-[#000000]/10">
                  {isConfirmed && (
                    <MeetJoinButton
                      startsAt={cls.startsAt}
                      endsAt={cls.endsAt}
                      meetUrl={meetUrl}
                    />
                  )}

                  <div className="flex items-center gap-4 text-[13px]">
                    <Link
                      href={`/app/classes/${cls.id}`}
                      className="text-[#000000] underline font-normal"
                    >
                      View details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
