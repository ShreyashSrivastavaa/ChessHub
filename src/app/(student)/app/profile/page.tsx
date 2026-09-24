import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import { Tag } from "@/components/ui/Tag";
import { revalidatePath } from "next/cache";

export default async function StudentProfilePage() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { studentProfiles: true },
  });

  if (!user) return <div>User not found</div>;

  async function handleAddStudent(formData: FormData) {
    "use server";
    const displayName = formData.get("displayName") as string;
    const level = (formData.get("level") as any) || "BEGINNER";
    const isMinor = formData.get("isMinor") === "on";
    const chessPlatformUsername = (formData.get("chessUsername") as string) || undefined;

    if (!displayName) return;

    await prisma.student.create({
      data: {
        ownerUserId: user!.id,
        displayName,
        level,
        isMinor,
        chessPlatformUsername,
      },
    });

    revalidatePath("/app/profile");
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
      title="Account & Student Profiles"
      subtitle="Manage guardian account and associated learner profiles"
      tabs={studentTabs}
    >
      <div className="flex flex-col gap-8">
        {/* Account Info */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff]">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] block mb-4 pb-2 border-b border-[#000000]/10">
            Account Holder
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[14px]">
            <div>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                Name
              </span>
              <span className="text-[#000000] font-normal">{user.name}</span>
            </div>
            <div>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                Email
              </span>
              <span className="text-[#000000]">{user.email}</span>
            </div>
            <div>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#323232] uppercase block">
                Phone
              </span>
              <span className="text-[#000000]">{user.phone || "Not set"}</span>
            </div>
          </div>
        </div>

        {/* Existing Student Profiles */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
            Managed Student Profiles ({user.studentProfiles.length})
          </span>

          <div className="flex flex-col divide-y divide-[#000000]/10">
            {user.studentProfiles.map((sp) => (
              <div key={sp.id} className="py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-[family-name:var(--font-heading)] text-[#000000]">
                      {sp.displayName}
                    </span>
                    {sp.isMinor && <Tag variant="outline" size="sm">Minor</Tag>}
                  </div>
                  <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                    Level: {sp.level} {sp.chessPlatformUsername && `· Lichess/Chess.com: ${sp.chessPlatformUsername}`}
                  </span>
                </div>

                <Tag variant="lime" size="sm">
                  Active Learner
                </Tag>
              </div>
            ))}
          </div>
        </div>

        {/* Add Learner Profile Form */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#fafafa]">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] block mb-3">
            Add Another Student Profile (e.g. Sibling)
          </span>

          <form action={handleAddStudent} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#000000]">
                  Student Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  required
                  placeholder="e.g. Aarav Patel"
                  className="h-[44px] px-4 rounded-[50px] border border-[#000000] bg-[#ffffff] text-[14px] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#000000]">
                  Initial Level
                </label>
                <select
                  name="level"
                  className="h-[44px] px-4 rounded-[50px] border border-[#000000] bg-[#ffffff] text-[14px] outline-none"
                >
                  <option value="BEGINNER">Absolute Beginner</option>
                  <option value="FOUNDATIONS">Foundations</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#000000]">
                  Chess.com or Lichess Username (Optional)
                </label>
                <input
                  type="text"
                  name="chessUsername"
                  placeholder="e.g. aarav_chess"
                  className="h-[44px] px-4 rounded-[50px] border border-[#000000] bg-[#ffffff] text-[14px] outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="isMinorCheckbox"
                  name="isMinor"
                  defaultChecked
                  className="w-4 h-4 accent-[#000000]"
                />
                <label htmlFor="isMinorCheckbox" className="text-[13px] text-[#000000] select-none cursor-pointer">
                  Student is under 18 years old
                </label>
              </div>
            </div>

            <div>
              <Button type="submit" variant="secondary" size="md">
                Add Learner Profile
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
