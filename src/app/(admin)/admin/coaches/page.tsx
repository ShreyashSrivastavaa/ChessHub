import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { revalidatePath } from "next/cache";

export default async function AdminCoachesPage() {
  const session = await requireRole(["ADMIN"]);

  const coaches = await prisma.coach.findMany({
    include: {
      user: true,
      credentials: true,
      sessionTypes: true,
    },
  });

  async function handleToggleCoachActive(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const coach = await prisma.coach.findUnique({ where: { id } });
    if (!coach) return;
    await prisma.coach.update({
      where: { id },
      data: { isActive: !coach.isActive },
    });
    revalidatePath("/admin/coaches");
    revalidatePath("/coaches");
  }

  const adminTabs: NavTabItem[] = [
    { label: "Overview", href: "/admin" },
    { label: "Coaches", href: "/admin/coaches" },
    { label: "Session Types", href: "/admin/session-types" },
    { label: "Bookings", href: "/admin/bookings" },
    { label: "Payments", href: "/admin/payments" },
    { label: "Testimonials", href: "/admin/testimonials" },
    { label: "Users", href: "/admin/users" },
  ];

  return (
    <DashboardShell
      role="ADMIN"
      userName={session.name}
      title="Coach Faculty Management"
      subtitle="Manage coach statuses, profiles, and Google Meet rooms"
      tabs={adminTabs}
    >
      <div className="flex flex-col gap-6">
        {coaches.map((c) => (
          <div
            key={c.id}
            className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[20px] font-[family-name:var(--font-heading)] text-[#000000]">
                  {c.displayName}
                </span>
                <Tag variant={c.isActive ? "lime" : "concrete"} size="sm">
                  {c.isActive ? "Active Faculty" : "Inactive"}
                </Tag>
              </div>

              <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#323232]">
                Slug: /{c.slug} · Email: {c.user.email}
              </span>

              <p className="text-[14px] text-[#323232] mt-1 max-w-[500px]">
                {c.bio}
              </p>

              <div className="mt-2 text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                Default Classroom: <span className="text-[#000000] underline">{c.defaultMeetUrl}</span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <form action={handleToggleCoachActive}>
                <input type="hidden" name="id" value={c.id} />
                <Button
                  type="submit"
                  variant={c.isActive ? "secondary" : "primary"}
                  size="sm"
                >
                  {c.isActive ? "Deactivate Coach" : "Activate Coach"}
                </Button>
              </form>

              <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                {c.sessionTypes.length} active session types
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
