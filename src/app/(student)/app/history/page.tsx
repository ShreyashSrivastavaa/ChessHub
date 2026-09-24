import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { EmptyState } from "@/components/ui/EmptyState";
import { format } from "date-fns";

export default async function ClassHistoryPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { studentProfiles: true },
  });

  const studentIds = user?.studentProfiles.map((s) => s.id) || [];

  const pastClasses = await prisma.booking.findMany({
    where: {
      studentId: { in: studentIds },
      status: { in: ["COMPLETED", "CANCELLED", "NO_SHOW", "CONFIRMED"] },
      endsAt: { lt: new Date() },
    },
    include: { coach: true, sessionType: true, student: true },
    orderBy: { startsAt: "desc" },
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
      role={session.role}
      userName={session.name}
      title="Class History"
      subtitle="Complete chronological record of past coaching sessions"
      tabs={studentTabs}
    >
      {pastClasses.length === 0 ? (
        <EmptyState
          title="No completed classes yet"
          description="Once your coaching sessions finish, they move here into your permanent learning record."
          actionLabel="Book a Class"
          actionHref="/book"
        />
      ) : (
        <div className="border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff]">
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#fafafa] border-b border-[#000000] text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
            <span className="col-span-3">Date & Time</span>
            <span className="col-span-3">Session & Coach</span>
            <span className="col-span-3">Student</span>
            <span className="col-span-3 text-right">Status</span>
          </div>

          <div className="divide-y divide-[#000000]/10">
            {pastClasses.map((cls) => (
              <div
                key={cls.id}
                className="p-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center hover:bg-[#fafafa]/50"
              >
                <div className="md:col-span-3">
                  <span className="text-[14px] text-[#000000] font-[family-name:var(--font-mono)] block">
                    {format(cls.startsAt, "PP")}
                  </span>
                  <span className="text-[12px] text-[#323232] font-[family-name:var(--font-mono)]">
                    {format(cls.startsAt, "HH:mm")} IST · {cls.reference}
                  </span>
                </div>

                <div className="md:col-span-3">
                  <span className="text-[15px] font-[family-name:var(--font-heading)] text-[#000000] block">
                    {cls.sessionType.name}
                  </span>
                  <span className="text-[12px] text-[#323232]">
                    Coach {cls.coach.displayName}
                  </span>
                </div>

                <div className="md:col-span-3 text-[14px] text-[#000000]">
                  {cls.student.displayName}
                </div>

                <div className="md:col-span-3 flex md:justify-end">
                  <Tag
                    variant={cls.status === "CANCELLED" ? "cancelled" : "concrete"}
                    size="sm"
                  >
                    {cls.status === "CONFIRMED" ? "COMPLETED" : cls.status}
                  </Tag>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
