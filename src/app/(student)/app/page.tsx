import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { EmptyState } from "@/components/ui/EmptyState";
import { SkillRank } from "@/components/chess/SkillRank";
import { MeetJoinButton } from "@/components/dashboard/MeetJoinButton";
import { format } from "date-fns";
import { Video, BookOpen, Target, Calendar, ArrowRight } from "lucide-react";

export default async function StudentDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ student?: string }>;
}) {
  const session = await requireRole(["STUDENT", "COACH", "ADMIN"]);
  const { student: activeStudentQuery } = await searchParams;

  // Fetch guardian user with all student profiles
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      studentProfiles: true,
    },
  });

  const studentProfiles = user?.studentProfiles || [];
  const activeStudent =
    studentProfiles.find((s) => s.id === activeStudentQuery) ||
    studentProfiles[0] ||
    null;

  // Navigation tabs for student
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

  if (!activeStudent) {
    return (
      <DashboardShell
        role="STUDENT"
        userName={session.name}
        title="Student Portal"
        tabs={studentTabs}
      >
        <EmptyState
          title="No student profile found"
          description="Create your first learner profile to begin booking coaching sessions."
          actionLabel="Create Student Profile"
          actionHref="/app/profile"
        />
      </DashboardShell>
    );
  }

  // 1. Next upcoming confirmed class
  const nextClass = await prisma.booking.findFirst({
    where: {
      studentId: activeStudent.id,
      status: "CONFIRMED",
      endsAt: { gt: new Date() },
    },
    include: {
      coach: true,
      sessionType: true,
    },
    orderBy: { startsAt: "asc" },
  });

  // 2. Homework due (top 3)
  const pendingHomework = await prisma.homework.findMany({
    where: {
      studentId: activeStudent.id,
      status: "ASSIGNED",
    },
    include: { coach: true },
    orderBy: { dueDate: "asc" },
    take: 3,
  });

  // 3. Latest visible coach note
  const latestNote = await prisma.coachNote.findFirst({
    where: {
      studentId: activeStudent.id,
      visibleToStudent: true,
    },
    include: { coach: true },
    orderBy: { createdAt: "desc" },
  });

  // 4. Progress snapshot: top 3 skills & active goal
  const studentSkills = await prisma.studentSkill.findMany({
    where: { studentId: activeStudent.id },
    include: { skillArea: true },
    take: 3,
    orderBy: { updatedAt: "desc" },
  });

  const activeGoal = await prisma.goal.findFirst({
    where: { studentId: activeStudent.id, status: "ACTIVE" },
  });

  // 5. Recent completed classes
  const recentClasses = await prisma.booking.findMany({
    where: {
      studentId: activeStudent.id,
      status: { in: ["COMPLETED", "CONFIRMED"] },
      endsAt: { lt: new Date() },
    },
    include: { coach: true, sessionType: true },
    orderBy: { startsAt: "desc" },
    take: 3,
  });

  return (
    <DashboardShell
      role="STUDENT"
      userName={session.name}
      title="Student Overview"
      subtitle={`Learner: ${activeStudent.displayName} (${activeStudent.level})`}
      tabs={studentTabs}
      headerActions={
        studentProfiles.length > 1 ? (
          <div className="flex items-center gap-1.5 p-1 border border-[#000000] rounded-[50px] bg-[#ffffff]">
            {studentProfiles.map((st) => (
              <Link
                key={st.id}
                href={`/app?student=${st.id}`}
                className={`px-3 py-1 rounded-[50px] text-[12px] font-[family-name:var(--font-mono)] uppercase ${
                  st.id === activeStudent.id
                    ? "bg-[#e3fc03] text-[#000000] font-normal"
                    : "text-[#323232] hover:text-[#000000]"
                }`}
              >
                {st.displayName}
              </Link>
            ))}
          </div>
        ) : null
      }
    >
      {/* 1. Next Class Card (Dominant Hero Card) */}
      {nextClass ? (
        <div className="p-6 md:p-8 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#000000]/10 gap-3">
            <div className="flex items-center gap-2">
              <Tag variant="lime" size="sm">
                Next Upcoming Class
              </Tag>
              <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#323232]">
                {nextClass.reference}
              </span>
            </div>
            <div className="flex items-center gap-4 text-[13px]">
              <Link
                href={`/app/classes/${nextClass.id}?action=reschedule`}
                className="text-[#323232] hover:text-[#000000] hover-underline-animation"
              >
                Reschedule
              </Link>
              <Link
                href={`/app/classes/${nextClass.id}?action=cancel`}
                className="text-[#323232] hover:text-[#000000] hover-underline-animation"
              >
                Cancel
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 flex flex-col gap-2">
              <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Coach {nextClass.coach.displayName} · {nextClass.sessionType.name}
              </span>
              <h2 className="text-[26px] md:text-[32px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                {format(nextClass.startsAt, "EEEE, MMMM d")}
              </h2>
              <p className="text-[18px] font-[family-name:var(--font-mono)] text-[#000000]">
                {format(nextClass.startsAt, "HH:mm")} IST ({nextClass.sessionType.durationMinutes} min)
              </p>
            </div>

            <div className="md:col-span-5 flex flex-col items-start md:items-end justify-center gap-3">
              <MeetJoinButton
                startsAt={nextClass.startsAt}
                endsAt={nextClass.endsAt}
                meetUrl={nextClass.meetUrl || nextClass.coach.defaultMeetUrl}
              />
              <Link
                href={`/app/classes/${nextClass.id}`}
                className="text-[13px] font-[family-name:var(--font-mono)] text-[#000000] hover-underline-animation"
              >
                View session details &rarr;
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <EmptyState
          title="No classes booked yet"
          description="Reserve a 1:1 slot with Shreyash or Tapesh to start your chess progression."
          actionLabel="Book a Class"
          actionHref="/book"
        />
      )}

      {/* Grid Row: Homework Due & Latest Coach Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Homework Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10 mb-3">
              <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Homework Due ({pendingHomework.length})
              </span>
              <Link
                href="/app/homework"
                className="text-[12px] font-[family-name:var(--font-mono)] text-[#000000] hover-underline-animation"
              >
                View all &rarr;
              </Link>
            </div>

            {pendingHomework.length > 0 ? (
              <div className="flex flex-col divide-y divide-[#000000]/10">
                {pendingHomework.map((hw) => (
                  <div key={hw.id} className="py-2.5 flex flex-col gap-1">
                    <span className="text-[15px] font-[family-name:var(--font-body)] text-[#000000]">
                      {hw.title}
                    </span>
                    <p className="text-[13px] text-[#323232] line-clamp-2">
                      {hw.instructions}
                    </p>
                    {hw.dueDate && (
                      <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232]">
                        Due by: {format(hw.dueDate, "PP")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[14px] text-[#323232] py-4">
                Nothing assigned. After your next class, Shreyash or Tapesh may add a few positions to work through.
              </p>
            )}
          </div>
        </Card>

        {/* Coach Note Card */}
        <Card className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10 mb-3">
              <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Latest Coach Note
              </span>
              <Link
                href="/app/notes"
                className="text-[12px] font-[family-name:var(--font-mono)] text-[#000000] hover-underline-animation"
              >
                View all &rarr;
              </Link>
            </div>

            {latestNote ? (
              <div className="flex flex-col gap-2 py-1">
                <p className="text-[15px] text-[#000000] leading-[1.6] italic">
                  &ldquo;{latestNote.body}&rdquo;
                </p>
                <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232] mt-1">
                  — Coach {latestNote.coach.displayName} · {format(latestNote.createdAt, "PP")}
                </span>
              </div>
            ) : (
              <p className="text-[14px] text-[#323232] py-4">
                No session notes yet. Notes will appear here after your first completed coaching class.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Progress & Goals Snapshot */}
      <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10">
          <div className="flex items-center gap-2">
            <Target size={16} strokeWidth={1.5} />
            <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000]">
              Skill Progress Snapshot
            </span>
          </div>
          <Link
            href="/app/progress"
            className="text-[12px] font-[family-name:var(--font-mono)] text-[#000000] hover-underline-animation"
          >
            Full skill tree &rarr;
          </Link>
        </div>

        {activeGoal && (
          <div className="p-3 bg-[#fafafa] rounded-[16px] border border-[#000000]/10 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
                Current Learning Goal
              </span>
              <span className="text-[15px] font-[family-name:var(--font-body)] text-[#000000]">
                {activeGoal.title}
              </span>
            </div>
            <Tag variant="outline" size="sm">Active</Tag>
          </div>
        )}

        {studentSkills.length > 0 ? (
          <div className="flex flex-col divide-y divide-[#000000]/10 pt-2">
            {studentSkills.map((sk) => (
              <SkillRank
                key={sk.id}
                name={sk.skillArea.name}
                stage={sk.stage as any}
                comment={sk.coachComment}
              />
            ))}
          </div>
        ) : (
          <p className="text-[14px] text-[#323232] py-2">
            Skill ratings are evaluated during coaching sessions across foundations and tactical vision.
          </p>
        )}
      </div>

      {/* Recent Classes Table */}
      {recentClasses.length > 0 && (
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
            Recent Completed Sessions
          </span>
          <div className="flex flex-col divide-y divide-[#000000]/10">
            {recentClasses.map((rc) => (
              <div
                key={rc.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <span className="text-[15px] text-[#000000] font-[family-name:var(--font-body)] block">
                    {rc.sessionType.name} with Coach {rc.coach.displayName}
                  </span>
                  <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                    {rc.reference} · {format(rc.startsAt, "PPP")}
                  </span>
                </div>
                <Tag variant="concrete" size="sm">
                  Completed
                </Tag>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
