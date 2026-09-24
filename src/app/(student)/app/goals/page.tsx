import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export default async function GoalsPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { studentProfiles: true },
  });

  const activeStudent = user?.studentProfiles[0];
  if (!activeStudent) return <div>No student profile found</div>;

  const goals = await prisma.goal.findMany({
    where: { studentId: activeStudent.id },
    orderBy: { createdAt: "desc" },
  });

  async function handleCreateGoal(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || undefined;
    if (!title) return;

    await prisma.goal.create({
      data: {
        studentId: activeStudent!.id,
        title,
        description,
        status: "ACTIVE",
        createdBy: "STUDENT",
      },
    });
    revalidatePath("/app/goals");
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
      title="Learning Goals"
      subtitle={`Student: ${activeStudent.displayName} · Measurable chess milestones`}
      tabs={studentTabs}
    >
      <div className="flex flex-col gap-8">
        {/* Create Goal Form */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff]">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] block mb-3">
            Add a New Goal
          </span>
          <form action={handleCreateGoal} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <input
              type="text"
              name="title"
              required
              placeholder="e.g. Reach 1000 on Lichess or Win school tournament round"
              className="h-[44px] px-4 rounded-[50px] border border-[#000000] text-[14px] flex-1 w-full outline-none"
            />
            <Button type="submit" variant="primary" size="md">
              Add Goal
            </Button>
          </form>
        </div>

        {/* Goals List */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
            Active & Past Goals
          </span>

          {goals.length === 0 ? (
            <p className="text-[14px] text-[#323232] py-4">
              No goals set yet. Add a concrete goal above to review with your coach.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[#000000]/10">
              {goals.map((g) => (
                <div key={g.id} className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-[16px] font-[family-name:var(--font-body)] text-[#000000] block">
                      {g.title}
                    </span>
                    {g.description && (
                      <p className="text-[13px] text-[#323232] mt-0.5">{g.description}</p>
                    )}
                    <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] mt-1 block">
                      Created by {g.createdBy} · {format(g.createdAt, "PP")}
                    </span>
                  </div>

                  <Tag
                    variant={g.status === "COMPLETED" ? "lime" : "outline"}
                    size="sm"
                  >
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
