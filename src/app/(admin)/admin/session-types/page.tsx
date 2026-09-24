import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { revalidatePath } from "next/cache";

export default async function AdminSessionTypesPage() {
  const session = await requireRole(["ADMIN"]);

  const sessionTypes = await prisma.sessionType.findMany({
    include: { coach: true },
    orderBy: { coachId: "asc" },
  });

  // Server Action: Update price & duration
  async function handleUpdateSession(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const pricePaise = Math.round(parseFloat(formData.get("priceRupees") as string) * 100);
    const durationMinutes = parseInt(formData.get("durationMinutes") as string, 10);
    const isActive = formData.get("isActive") === "on";

    await prisma.sessionType.update({
      where: { id },
      data: {
        pricePaise,
        durationMinutes,
        isActive,
      },
    });

    revalidatePath("/admin/session-types");
    revalidatePath("/pricing");
    revalidatePath("/book");
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
      title="Session Types & Pricing"
      subtitle="Configure pricing in INR and class durations"
      tabs={adminTabs}
    >
      <div className="flex flex-col gap-6">
        <div className="p-4 bg-[#e6e6e6]/60 border border-[#000000] rounded-[16px] text-[13px] font-[family-name:var(--font-mono)]">
          NOTE: Seed prices are placeholders. You can adjust real live pricing directly here, which immediately propagates to the public booking flow and pricing table.
        </div>

        <div className="flex flex-col gap-4">
          {sessionTypes.map((st) => (
            <div
              key={st.id}
              className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="max-w-[360px]">
                <div className="flex items-center gap-2">
                  <span className="text-[16px] font-[family-name:var(--font-heading)] text-[#000000]">
                    {st.name}
                  </span>
                  {st.isTrial && <Tag variant="lime" size="sm">Trial</Tag>}
                </div>
                <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                  Coach {st.coach.displayName} · Level: {st.level}
                </span>
                <p className="text-[13px] text-[#323232] mt-1">{st.description}</p>
              </div>

              <form action={handleUpdateSession} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="id" value={st.id} />

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    name="priceRupees"
                    defaultValue={st.pricePaise / 100}
                    className="h-[38px] w-[100px] px-3 rounded-[50px] border border-[#000000] text-[14px] outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                    Duration (Min)
                  </label>
                  <input
                    type="number"
                    name="durationMinutes"
                    defaultValue={st.durationMinutes}
                    className="h-[38px] w-[80px] px-3 rounded-[50px] border border-[#000000] text-[14px] outline-none"
                  />
                </div>

                <div className="flex items-center gap-1.5 pt-5">
                  <input
                    type="checkbox"
                    id={`active-${st.id}`}
                    name="isActive"
                    defaultChecked={st.isActive}
                    className="w-4 h-4 accent-[#000000]"
                  />
                  <label htmlFor={`active-${st.id}`} className="text-[12px] text-[#000000]">
                    Active
                  </label>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="secondary" size="sm">
                    Save
                  </Button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
