import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { revalidatePath } from "next/cache";

export default async function CoachProfilePage() {
  const session = await requireRole(["COACH", "ADMIN"]);

  const coach = await prisma.coach.findFirst({
    where: { userId: session.id },
  });

  if (!coach && session.role !== "ADMIN") return <div>Coach profile missing</div>;

  async function handleUpdateProfile(formData: FormData) {
    "use server";
    const bio = formData.get("bio") as string;
    const philosophy = formData.get("philosophy") as string;
    const defaultMeetUrl = formData.get("defaultMeetUrl") as string;
    const slotBufferMinutes = parseInt(formData.get("slotBufferMinutes") as string, 10);
    const minNoticeHours = parseInt(formData.get("minNoticeHours") as string, 10);
    const maxAdvanceDays = parseInt(formData.get("maxAdvanceDays") as string, 10);

    await prisma.coach.update({
      where: { id: coach!.id },
      data: {
        bio,
        philosophy,
        defaultMeetUrl,
        slotBufferMinutes: slotBufferMinutes || 10,
        minNoticeHours: minNoticeHours || 12,
        maxAdvanceDays: maxAdvanceDays || 30,
      },
    });

    revalidatePath("/coach/profile");
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
      title="Coach Settings & Meet Link"
      subtitle="Public profile, classroom link, and booking constraints"
      tabs={coachTabs}
    >
      <div className="p-6 md:p-8 border border-[#000000] rounded-[16px] bg-[#ffffff]">
        <form action={handleUpdateProfile} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#000000]">
                Display Name (Locked)
              </label>
              <input
                type="text"
                disabled
                defaultValue={coach?.displayName}
                className="h-[46px] px-4 rounded-[50px] border border-[#000000] bg-[#e6e6e6]/60 text-[#323232] cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#000000]">
                Default Google Meet Link
              </label>
              <input
                type="url"
                name="defaultMeetUrl"
                required
                defaultValue={coach?.defaultMeetUrl}
                placeholder="https://meet.google.com/..."
                className="h-[46px] px-4 rounded-[50px] border border-[#000000] text-[14px] outline-none font-[family-name:var(--font-mono)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#000000]">
              Short Biography
            </label>
            <textarea
              name="bio"
              rows={2}
              required
              defaultValue={coach?.bio}
              className="w-full p-4 rounded-[16px] border border-[#000000] text-[14px] outline-none resize-none"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-[family-name:var(--font-mono)] uppercase text-[#000000]">
              Teaching Philosophy
            </label>
            <textarea
              name="philosophy"
              rows={3}
              required
              defaultValue={coach?.philosophy}
              className="w-full p-4 rounded-[16px] border border-[#000000] text-[14px] outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#000000]/10">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Slot Buffer (Minutes)
              </label>
              <input
                type="number"
                name="slotBufferMinutes"
                defaultValue={coach?.slotBufferMinutes}
                min={0}
                max={60}
                className="h-[44px] px-4 rounded-[50px] border border-[#000000] text-[14px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Min Notice (Hours)
              </label>
              <input
                type="number"
                name="minNoticeHours"
                defaultValue={coach?.minNoticeHours}
                min={1}
                max={72}
                className="h-[44px] px-4 rounded-[50px] border border-[#000000] text-[14px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Max Horizon (Days)
              </label>
              <input
                type="number"
                name="maxAdvanceDays"
                defaultValue={coach?.maxAdvanceDays}
                min={7}
                max={90}
                className="h-[44px] px-4 rounded-[50px] border border-[#000000] text-[14px] outline-none"
              />
            </div>
          </div>

          <div>
            <Button type="submit" variant="primary" size="md">
              Save Profile & Settings
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
