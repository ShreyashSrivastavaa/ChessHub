import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { revalidatePath } from "next/cache";

export default async function CoachSchedulePage() {
  const session = await requireRole(["COACH", "ADMIN"]);

  const coach = await prisma.coach.findFirst({
    where: { userId: session.id },
    include: {
      availabilityRules: { orderBy: [{ weekday: "asc" }, { startMinute: "asc" }] },
      exceptions: { orderBy: { date: "asc" } },
    },
  });

  if (!coach) return <div>Coach profile missing</div>;

  const weekdaysMap = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Server Action: Add Availability Rule
  async function handleAddRule(formData: FormData) {
    "use server";
    const weekday = parseInt(formData.get("weekday") as string, 10);
    const startStr = formData.get("start") as string; // "10:00"
    const endStr = formData.get("end") as string; // "13:00"

    const [sh, sm] = startStr.split(":").map(Number);
    const [eh, em] = endStr.split(":").map(Number);

    const startMinute = sh * 60 + sm;
    const endMinute = eh * 60 + em;

    if (endMinute <= startMinute) return;

    await prisma.availabilityRule.create({
      data: {
        coachId: coach!.id,
        weekday,
        startMinute,
        endMinute,
      },
    });

    revalidatePath("/coach/schedule");
  }

  // Server Action: Delete Rule
  async function handleDeleteRule(formData: FormData) {
    "use server";
    const ruleId = formData.get("ruleId") as string;
    await prisma.availabilityRule.delete({ where: { id: ruleId } });
    revalidatePath("/coach/schedule");
  }

  // Server Action: Add Exception (Block or Extra Open)
  async function handleAddException(formData: FormData) {
    "use server";
    const date = formData.get("date") as string; // YYYY-MM-DD
    const kind = (formData.get("kind") as string) || "BLOCKED";
    const reason = (formData.get("reason") as string) || undefined;

    if (!date) return;

    await prisma.availabilityException.create({
      data: {
        coachId: coach!.id,
        date,
        kind,
        reason,
      },
    });

    revalidatePath("/coach/schedule");
  }

  // Server Action: Delete Exception
  async function handleDeleteException(formData: FormData) {
    "use server";
    const exceptionId = formData.get("exceptionId") as string;
    await prisma.availabilityException.delete({ where: { id: exceptionId } });
    revalidatePath("/coach/schedule");
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
      title="Availability & Schedule"
      subtitle={`Timezone: ${coach.timeZone} · Minimum notice: ${coach.minNoticeHours}h · Buffer: ${coach.slotBufferMinutes}m`}
      tabs={coachTabs}
    >
      <div className="flex flex-col gap-8">
        {/* Weekly Recurring Availability */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-6">
          <div className="pb-3 border-b border-[#000000]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
                Weekly Working Windows
              </h2>
              <p className="text-[13px] text-[#323232]">
                Slots are calculated dynamically inside these windows minus your {coach.slotBufferMinutes}-minute buffer.
              </p>
            </div>
          </div>

          {/* Add Rule Form */}
          <form action={handleAddRule} className="p-4 bg-[#fafafa] rounded-[16px] border border-[#000000]/10 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Day of Week
              </label>
              <select
                name="weekday"
                className="h-[40px] px-3 rounded-[50px] border border-[#000000] bg-[#ffffff] text-[13px] outline-none"
              >
                {weekdaysMap.map((day, idx) => (
                  <option key={day} value={idx}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Start Time
              </label>
              <input
                type="time"
                name="start"
                defaultValue="10:00"
                required
                className="h-[40px] px-3 rounded-[50px] border border-[#000000] bg-[#ffffff] text-[13px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                End Time
              </label>
              <input
                type="time"
                name="end"
                defaultValue="13:00"
                required
                className="h-[40px] px-3 rounded-[50px] border border-[#000000] bg-[#ffffff] text-[13px] outline-none"
              />
            </div>

            <Button type="submit" variant="primary" size="sm" className="h-[40px]">
              Add Window
            </Button>
          </form>

          {/* Rules List */}
          <div className="flex flex-col divide-y divide-[#000000]/10">
            {coach.availabilityRules.map((rule) => {
              const startH = String(Math.floor(rule.startMinute / 60)).padStart(2, "0");
              const startM = String(rule.startMinute % 60).padStart(2, "0");
              const endH = String(Math.floor(rule.endMinute / 60)).padStart(2, "0");
              const endM = String(rule.endMinute % 60).padStart(2, "0");

              return (
                <div key={rule.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-24 text-[14px] font-[family-name:var(--font-heading)] text-[#000000]">
                      {weekdaysMap[rule.weekday]}
                    </span>
                    <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#000000]">
                      {startH}:{startM} — {endH}:{endM} IST
                    </span>
                  </div>

                  <form action={handleDeleteRule}>
                    <input type="hidden" name="ruleId" value={rule.id} />
                    <button
                      type="submit"
                      className="text-[12px] font-[family-name:var(--font-mono)] text-[#B3261E] hover:underline cursor-pointer"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date Exceptions (Blocked Holidays & Extra Open Days) */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-6">
          <div className="pb-3 border-b border-[#000000]/10">
            <h2 className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#000000]">
              Date-Specific Exceptions
            </h2>
            <p className="text-[13px] text-[#323232]">
              Block days for travel/tournaments or open extra availability.
            </p>
          </div>

          <form action={handleAddException} className="p-4 bg-[#fafafa] rounded-[16px] border border-[#000000]/10 flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                className="h-[40px] px-3 rounded-[50px] border border-[#000000] bg-[#ffffff] text-[13px] outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Type
              </label>
              <select
                name="kind"
                className="h-[40px] px-3 rounded-[50px] border border-[#000000] bg-[#ffffff] text-[13px] outline-none"
              >
                <option value="BLOCKED">Blocked (No slots)</option>
                <option value="EXTRA_OPEN">Extra Open</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
                Reason (Optional)
              </label>
              <input
                type="text"
                name="reason"
                placeholder="e.g. Over-the-board tournament"
                className="h-[40px] px-3 rounded-[50px] border border-[#000000] bg-[#ffffff] text-[13px] outline-none"
              />
            </div>

            <Button type="submit" variant="primary" size="sm" className="h-[40px]">
              Add Exception
            </Button>
          </form>

          {coach.exceptions.length === 0 ? (
            <p className="text-[13px] text-[#323232] py-2">
              No date exceptions recorded.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[#000000]/10">
              {coach.exceptions.map((exc) => (
                <div key={exc.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#000000]">
                      {exc.date}
                    </span>
                    <Tag variant={exc.kind === "BLOCKED" ? "cancelled" : "lime"} size="sm">
                      {exc.kind}
                    </Tag>
                    {exc.reason && (
                      <span className="text-[13px] text-[#323232] italic">
                        &ldquo;{exc.reason}&rdquo;
                      </span>
                    )}
                  </div>

                  <form action={handleDeleteException}>
                    <input type="hidden" name="exceptionId" value={exc.id} />
                    <button
                      type="submit"
                      className="text-[12px] font-[family-name:var(--font-mono)] text-[#B3261E] hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </form>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
