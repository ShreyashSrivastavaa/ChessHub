import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { SkillRank } from "@/components/chess/SkillRank";
import { RatingSparkline } from "@/components/chess/RatingSparkline";
import { Tag } from "@/components/ui/Tag";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";

export default async function StudentProgressPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { studentProfiles: true },
  });

  const activeStudent = user?.studentProfiles[0];
  if (!activeStudent) {
    return <div>No student profile found</div>;
  }

  // Fetch all skill areas
  const allSkillAreas = await prisma.skillArea.findMany({
    orderBy: { sortOrder: "asc" },
  });

  // Fetch student skills
  const studentSkills = await prisma.studentSkill.findMany({
    where: { studentId: activeStudent.id },
    include: { skillArea: true },
  });

  const skillMap = new Map(studentSkills.map((s) => [s.skillAreaId, s]));

  // Rating snapshots for sparkline
  const ratingSnapshots = await prisma.ratingSnapshot.findMany({
    where: { studentId: activeStudent.id },
    orderBy: { recordedAt: "asc" },
  });

  const sparklineData = ratingSnapshots.map((r) => ({
    date: format(r.recordedAt, "yyyy-MM-dd"),
    rating: r.rating,
  }));

  // Skill history timeline
  const skillHistory = await prisma.studentSkillHistory.findMany({
    where: { studentId: activeStudent.id },
    include: { skillArea: true },
    orderBy: { changedAt: "desc" },
    take: 5,
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
      title="Chess Progress & Skills"
      subtitle={`Learner: ${activeStudent.displayName} · Tracking real board mastery`}
      tabs={studentTabs}
    >
      <div className="flex flex-col gap-8">
        {/* Rating Sparkline & Stage Legend */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-1 max-w-[380px]">
            <span className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#000000] font-normal">
              Pedagogy Framework
            </span>
            <p className="text-[13px] text-[#323232]">
              Chess mastery is tracked across four distinct stages: Introduced &rarr; Developing &rarr; Reliable &rarr; Fluent.
            </p>
          </div>

          {/* Rating Sparkline (Only if data exists!) */}
          {sparklineData.length >= 2 && (
            <div className="p-3 bg-[#fafafa] rounded-[16px] border border-[#000000]/10">
              <RatingSparkline data={sparklineData} width={260} height={48} />
            </div>
          )}
        </div>

        {/* Foundations Track */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10 mb-2">
            <span className="text-[18px] font-[family-name:var(--font-heading)] text-[#000000]">
              Foundations Track
            </span>
            <Tag variant="outline" size="sm">
              Coach Shreyash
            </Tag>
          </div>

          <div className="flex flex-col divide-y divide-[#000000]/10">
            {allSkillAreas
              .filter((a) => a.track === "FOUNDATIONS")
              .map((area) => {
                const assigned = skillMap.get(area.id);
                return (
                  <SkillRank
                    key={area.id}
                    name={area.name}
                    stage={(assigned?.stage as any) || "INTRODUCED"}
                    comment={assigned?.coachComment}
                  />
                );
              })}
          </div>
        </div>

        {/* Improvement Track */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-2">
          <div className="flex items-center justify-between pb-3 border-b border-[#000000]/10 mb-2">
            <span className="text-[18px] font-[family-name:var(--font-heading)] text-[#000000]">
              Improvement Track
            </span>
            <Tag variant="lime" size="sm">
              Coach Tapesh (FIDE)
            </Tag>
          </div>

          <div className="flex flex-col divide-y divide-[#000000]/10">
            {allSkillAreas
              .filter((a) => a.track === "IMPROVEMENT")
              .map((area) => {
                const assigned = skillMap.get(area.id);
                return (
                  <SkillRank
                    key={area.id}
                    name={area.name}
                    stage={(assigned?.stage as any) || "INTRODUCED"}
                    comment={assigned?.coachComment}
                  />
                );
              })}
          </div>
        </div>

        {/* Skill Timeline */}
        {skillHistory.length > 0 && (
          <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-3">
            <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
              Stage History Timeline
            </span>
            <div className="flex flex-col divide-y divide-[#000000]/10">
              {skillHistory.map((h) => (
                <div key={h.id} className="py-2.5 flex items-center justify-between text-[13px]">
                  <div>
                    <span className="font-normal text-[#000000]">{h.skillArea.name}</span>
                    <span className="text-[#323232] ml-2">
                      promoted to <span className="text-[#000000]">{h.newStage}</span>
                    </span>
                    {h.comment && <p className="text-[12px] text-[#323232] italic mt-0.5">&ldquo;{h.comment}&rdquo;</p>}
                  </div>
                  <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232]">
                    {format(h.changedAt, "PP")}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
