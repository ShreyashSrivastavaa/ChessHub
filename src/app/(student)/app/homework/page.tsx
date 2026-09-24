import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export default async function StudentHomeworkPage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { studentProfiles: true },
  });

  const activeStudent = user?.studentProfiles[0];
  if (!activeStudent) return <div>No student profile found</div>;

  const homeworkItems = await prisma.homework.findMany({
    where: { studentId: activeStudent.id },
    include: { coach: true },
    orderBy: { createdAt: "desc" },
  });

  async function handleMarkSubmitted(formData: FormData) {
    "use server";
    const hwId = formData.get("hwId") as string;
    const response = (formData.get("response") as string) || "Completed exercises";

    await prisma.homework.update({
      where: { id: hwId },
      data: {
        status: "SUBMITTED",
        studentResponse: response,
      },
    });
    revalidatePath("/app/homework");
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
      title="Assigned Homework"
      subtitle={`Student: ${activeStudent.displayName} · Practical positions and tactical exercises`}
      tabs={studentTabs}
    >
      <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
        {homeworkItems.length === 0 ? (
          <p className="text-[14px] text-[#323232] py-8 text-center">
            Nothing assigned. After your next class, Shreyash or Tapeshnu may add a few positions to work through.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-[#000000]/10">
            {homeworkItems.map((hw) => {
              const tags = hw.tags ? (JSON.parse(hw.tags) as string[]) : [];

              return (
                <div key={hw.id} className="py-5 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[18px] font-[family-name:var(--font-heading)] text-[#000000]">
                          {hw.title}
                        </span>
                        <Tag
                          variant={hw.status === "ASSIGNED" ? "lime" : "concrete"}
                          size="sm"
                        >
                          {hw.status}
                        </Tag>
                      </div>
                      <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                        Assigned by Coach {hw.coach.displayName} · Due: {hw.dueDate ? format(hw.dueDate, "PP") : "Flexible"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {tags.map((t) => (
                        <span
                          key={t}
                          className="px-2 py-0.5 rounded-[50px] border border-[#000000] text-[11px] font-[family-name:var(--font-mono)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <p className="text-[14px] leading-[1.6] text-[#323232] font-[family-name:var(--font-body)]">
                    {hw.instructions}
                  </p>

                  {hw.status === "ASSIGNED" && (
                    <form action={handleMarkSubmitted} className="pt-2 flex flex-col sm:flex-row gap-2">
                      <input type="hidden" name="hwId" value={hw.id} />
                      <input
                        type="text"
                        name="response"
                        placeholder="Add optional completion note or solution moves..."
                        className="h-[40px] px-4 rounded-[50px] border border-[#000000] text-[13px] flex-1 outline-none"
                      />
                      <Button type="submit" variant="secondary" size="sm">
                        Mark as Completed
                      </Button>
                    </form>
                  )}

                  {hw.studentResponse && (
                    <div className="p-3 bg-[#fafafa] rounded-[16px] border border-[#000000]/10 text-[13px] text-[#323232]">
                      <span className="font-normal text-[#000000] block mb-0.5">Your Response:</span>
                      {hw.studentResponse}
                    </div>
                  )}

                  {hw.coachFeedback && (
                    <div className="p-3 bg-[#e3fc03]/10 rounded-[16px] border border-[#000000]/10 text-[13px] text-[#000000]">
                      <span className="font-normal block mb-0.5">Coach Feedback:</span>
                      {hw.coachFeedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
