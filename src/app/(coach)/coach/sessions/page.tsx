import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { format } from "date-fns";

export default async function CoachSessionsPage() {
  const session = await requireRole(["COACH", "ADMIN"]);

  const coach = await prisma.coach.findFirst({
    where: { userId: session.id },
  });

  if (!coach) return <div>Coach profile missing</div>;

  const sessions = await prisma.booking.findMany({
    where: { coachId: coach.id },
    include: { student: true, sessionType: true },
    orderBy: { startsAt: "desc" },
  });

  const coachTabs: NavTabItem[] = [
    { label: "Overview", href: "/coach" },
    { label: "Sessions", href: "/coach/sessions" },
    { label: "Students", href: "/coach/students" },
    { label: "Schedule & Hours", href: "/coach/schedule" },
    { label: "Payments", href: "/coach/payments" },
    { label: "Profile & Meet", href: "/coach/profile" },
  ];

  return (
    <DashboardShell
      role="COACH"
      userName={session.name}
      title="All Coaching Sessions"
      subtitle="Complete register of upcoming, completed, and historical bookings"
      tabs={coachTabs}
    >
      <div className="border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff]">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#fafafa] border-b border-[#000000] text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
          <span className="col-span-3">Time & Ref</span>
          <span className="col-span-3">Student</span>
          <span className="col-span-3">Format</span>
          <span className="col-span-3 text-right">Status / Actions</span>
        </div>

        {sessions.length === 0 ? (
          <p className="p-8 text-center text-[14px] text-[#323232]">
            No sessions found.
          </p>
        ) : (
          <div className="divide-y divide-[#000000]/10">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center hover:bg-[#fafafa]/50"
              >
                <div className="md:col-span-3">
                  <span className="text-[14px] text-[#000000] font-[family-name:var(--font-mono)] block">
                    {format(s.startsAt, "PP")}
                  </span>
                  <span className="text-[12px] text-[#323232] font-[family-name:var(--font-mono)]">
                    {format(s.startsAt, "HH:mm")} IST · {s.reference}
                  </span>
                </div>

                <div className="md:col-span-3">
                  <Link
                    href={`/coach/students/${s.studentId}`}
                    className="text-[15px] font-[family-name:var(--font-heading)] text-[#000000] underline"
                  >
                    {s.student.displayName}
                  </Link>
                  <span className="text-[12px] text-[#323232] block">
                    Level: {s.student.level}
                  </span>
                </div>

                <div className="md:col-span-3 text-[13px] text-[#000000]">
                  {s.sessionType.name} ({s.sessionType.durationMinutes}m)
                </div>

                <div className="md:col-span-3 flex md:justify-end items-center gap-3">
                  <Tag
                    variant={
                      s.status === "CONFIRMED"
                        ? "lime"
                        : s.status === "COMPLETED"
                        ? "concrete"
                        : "outline"
                    }
                    size="sm"
                  >
                    {s.status}
                  </Tag>
                  <Link
                    href={`/coach/sessions/${s.id}`}
                    className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#000000] underline"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
