import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { format } from "date-fns";

export default async function StudentNotesPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { studentProfiles: true },
  });

  const activeStudent = user?.studentProfiles[0];
  if (!activeStudent) return <div>No student profile found</div>;

  const notes = await prisma.coachNote.findMany({
    where: {
      studentId: activeStudent.id,
      visibleToStudent: true,
    },
    include: { coach: true, booking: true },
    orderBy: { createdAt: "desc" },
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
      title="Coach Notes"
      subtitle={`Student: ${activeStudent.displayName} · Written feedback and tactical guidance`}
      tabs={studentTabs}
    >
      <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
        {notes.length === 0 ? (
          <p className="text-[14px] text-[#323232] py-8 text-center">
            No notes recorded yet. Your coach will log notes and key position takeaways following each class.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-[#000000]/10">
            {notes.map((note) => (
              <div key={note.id} className="py-5 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-[family-name:var(--font-heading)] text-[#000000]">
                    Coach {note.coach.displayName}
                  </span>
                  <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                    {format(note.createdAt, "PPP")}
                  </span>
                </div>
                <p className="text-[15px] leading-[1.6] text-[#323232] font-[family-name:var(--font-body)]">
                  {note.body}
                </p>
                {note.booking && (
                  <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232]/70 mt-1">
                    Associated session: {note.booking.reference}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
