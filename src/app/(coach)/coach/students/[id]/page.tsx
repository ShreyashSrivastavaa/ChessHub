import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SkillRank } from "@/components/chess/SkillRank";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export default async function CoachStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["COACH", "ADMIN"]);
  const { id: studentId } = await params;

  const coach = await prisma.coach.findFirst({
    where: { userId: session.id },
  });

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      ownerUser: true,
      skills: { include: { skillArea: true } },
      goals: true,
      coachNotes: { where: { coachId: coach?.id } },
      homework: { where: { coachId: coach?.id } },
      bookings: {
        where: { coachId: coach?.id },
        include: { sessionType: true },
        orderBy: { startsAt: "desc" },
      },
    },
  });

  if (!student) notFound();

  // All skill areas
  const allSkillAreas = await prisma.skillArea.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const skillMap = new Map(student.skills.map((s) => [s.skillAreaId, s]));

  // Server Action: Update Skill Stage & Log History
  async function handleUpdateSkill(formData: FormData) {
    "use server";
    const skillAreaId = formData.get("skillAreaId") as string;
    const stage = formData.get("stage") as any;
    const comment = (formData.get("comment") as string) || undefined;

    const existingSkill = await prisma.studentSkill.findUnique({
      where: {
        studentId_skillAreaId: {
          studentId,
          skillAreaId,
        },
      },
    });

    const oldStage = existingSkill?.stage;

    await prisma.studentSkill.upsert({
      where: {
        studentId_skillAreaId: {
          studentId,
          skillAreaId,
        },
      },
      create: {
        studentId,
        skillAreaId,
        stage,
        coachComment: comment,
        updatedByCoachId: coach?.id,
      },
      update: {
        stage,
        coachComment: comment,
        updatedByCoachId: coach?.id,
      },
    });

    // Write to history
    await prisma.studentSkillHistory.create({
      data: {
        studentId,
        skillAreaId,
        oldStage,
        newStage: stage,
        comment,
        changedByCoachId: coach?.id,
      },
    });

    revalidatePath(`/coach/students/${studentId}`);
  }

  // Server Action: Add Coach Goal
  async function handleAddGoal(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    if (!title) return;

    await prisma.goal.create({
      data: {
        studentId,
        title,
        status: "ACTIVE",
        createdBy: "COACH",
      },
    });
    revalidatePath(`/coach/students/${studentId}`);
  }

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
      title={`Student Progress: ${student.displayName}`}
      subtitle={`Level: ${student.level} · Guardian: ${student.ownerUser.name}`}
      tabs={coachTabs}
      headerActions={
        <Link
          href="/coach/students"
          className="text-[13px] font-[family-name:var(--font-mono)] text-[#000000] hover-underline-animation"
        >
          &larr; Back to all students
        </Link>
      }
    >
      <div className="flex flex-col gap-8">
        {/* Student Bio Card */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
              Current Rating / Handle
            </span>
            <span className="text-[16px] font-[family-name:var(--font-heading)] text-[#000000]">
              {student.currentRating ? `${student.currentRating} (Est)` : "Unrated"} · {student.chessPlatformUsername || "No handle"}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
              Total Classes
            </span>
            <span className="text-[16px] font-[family-name:var(--font-heading)] text-[#000000]">
              {student.bookings.length} completed / booked
            </span>
          </div>
          <div>
            <span className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
              Guardian Contact
            </span>
            <span className="text-[14px] text-[#000000]">
              {student.ownerUser.email}
            </span>
          </div>
        </div>

        {/* Skill Progress Editor (Segmented Control per skill) */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-6">
          <div className="pb-3 border-b border-[#000000]/10">
            <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
              Pedagogy Stage Evaluation
            </h2>
            <p className="text-[13px] text-[#323232]">
              Set stage per skill area. Every adjustment writes to student history.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-[#000000]/10">
            {allSkillAreas.map((area) => {
              const currentSkill = skillMap.get(area.id);
              const currentStage = currentSkill?.stage || "INTRODUCED";

              return (
                <div key={area.id} className="py-4 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[16px] font-[family-name:var(--font-body)] text-[#000000] font-normal">
                      {area.name} ({area.track})
                    </span>

                    {/* Stage Segmented Control Form */}
                    <form action={handleUpdateSkill} className="flex flex-wrap items-center gap-1.5">
                      <input type="hidden" name="skillAreaId" value={area.id} />
                      {(["INTRODUCED", "DEVELOPING", "RELIABLE", "FLUENT"] as const).map(
                        (stg) => {
                          const isSelected = currentStage === stg;
                          return (
                            <button
                              key={stg}
                              type="submit"
                              name="stage"
                              value={stg}
                              className={`h-[32px] px-2.5 rounded-[50px] border text-[11px] font-[family-name:var(--font-mono)] uppercase transition-all ${
                                isSelected
                                  ? "bg-[#e3fc03] text-[#000000] border-[#000000] font-normal"
                                  : "bg-[#ffffff] text-[#323232] border-[#000000]/20 hover:border-[#000000]"
                              }`}
                            >
                              {stg}
                            </button>
                          );
                        }
                      )}
                    </form>
                  </div>

                  {/* Optional Comment Input */}
                  <form action={handleUpdateSkill} className="flex gap-2">
                    <input type="hidden" name="skillAreaId" value={area.id} />
                    <input type="hidden" name="stage" value={currentStage} />
                    <input
                      type="text"
                      name="comment"
                      defaultValue={currentSkill?.coachComment || ""}
                      placeholder="Add brief coach remark (e.g. Diagonals vision is improving)..."
                      className="h-[36px] px-3 rounded-[50px] border border-[#000000]/30 text-[13px] flex-1 outline-none"
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      Save Note
                    </Button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>

        {/* Goals Management */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
            Student Goals
          </span>

          <form action={handleAddGoal} className="flex gap-2">
            <input
              type="text"
              name="title"
              required
              placeholder="Assign a new milestone goal (e.g. Solve 10 tactics puzzles without hints)..."
              className="h-[44px] px-4 rounded-[50px] border border-[#000000] text-[14px] flex-1 outline-none"
            />
            <Button type="submit" variant="primary" size="md">
              Assign Goal
            </Button>
          </form>

          {student.goals.length > 0 && (
            <div className="flex flex-col divide-y divide-[#000000]/10 pt-2">
              {student.goals.map((g) => (
                <div key={g.id} className="py-3 flex items-center justify-between">
                  <span className="text-[14px] text-[#000000]">{g.title}</span>
                  <Tag variant={g.status === "COMPLETED" ? "lime" : "outline"} size="sm">
                    {g.status}
                  </Tag>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
