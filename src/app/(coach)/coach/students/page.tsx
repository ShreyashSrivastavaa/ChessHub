import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";

export default async function CoachStudentsPage() {
  const session = await requireRole(["COACH", "ADMIN"]);

  const coach = await prisma.coach.findFirst({
    where: { userId: session.id },
  });

  if (!coach && session.role !== "ADMIN") return <div>Coach profile missing</div>;

  // Query students who have had bookings with this coach
  const coachBookings = await prisma.booking.findMany({
    where: { coachId: coach?.id },
    select: { studentId: true },
  });

  const studentIds = Array.from(new Set(coachBookings.map((b) => b.studentId)));

  const students = await prisma.student.findMany({
    where: { id: { in: studentIds } },
    include: {
      bookings: {
        where: { coachId: coach?.id },
        orderBy: { startsAt: "desc" },
      },
      skills: { include: { skillArea: true } },
    },
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
      title="My Students"
      subtitle="Learners enrolled in your 1:1 coaching track"
      tabs={coachTabs}
    >
      <div className="border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff]">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#fafafa] border-b border-[#000000] text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
          <span className="col-span-4">Student</span>
          <span className="col-span-3">Level / Handle</span>
          <span className="col-span-3">Total Sessions</span>
          <span className="col-span-2 text-right">Action</span>
        </div>

        {students.length === 0 ? (
          <p className="p-8 text-center text-[14px] text-[#323232]">
            No students have booked classes with you yet.
          </p>
        ) : (
          <div className="divide-y divide-[#000000]/10">
            {students.map((st) => (
              <div
                key={st.id}
                className="p-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center hover:bg-[#fafafa]/50"
              >
                <div className="md:col-span-4">
                  <span className="text-[16px] font-[family-name:var(--font-heading)] text-[#000000] block">
                    {st.displayName}
                  </span>
                  {st.isMinor && <Tag variant="outline" size="sm">Minor</Tag>}
                </div>

                <div className="md:col-span-3 text-[13px] text-[#323232] font-[family-name:var(--font-mono)]">
                  <span>Level: {st.level}</span>
                  {st.chessPlatformUsername && (
                    <span className="block text-[11px]">@{st.chessPlatformUsername}</span>
                  )}
                </div>

                <div className="md:col-span-3 text-[14px] font-[family-name:var(--font-mono)] text-[#000000]">
                  {st.bookings.length} classes
                </div>

                <div className="md:col-span-2 flex md:justify-end">
                  <Link
                    href={`/coach/students/${st.id}`}
                    className="h-[36px] px-4 rounded-[50px] border border-[#000000] inline-flex items-center text-[12px] font-[family-name:var(--font-mono)] uppercase hover:bg-[#fafafa]"
                  >
                    Progress Hub &rarr;
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
