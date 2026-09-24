import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { format, startOfMonth, subMonths } from "date-fns";

export default async function CoachPaymentsPage() {
  const session = await requireRole(["COACH", "ADMIN"]);

  const coach = await prisma.coach.findFirst({
    where: { userId: session.id },
  });

  if (!coach && session.role !== "ADMIN") return <div>Coach profile missing</div>;

  const payments = await prisma.payment.findMany({
    where: {
      booking: { coachId: coach?.id },
    },
    include: {
      booking: {
        include: { student: true, sessionType: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));

  const thisMonthTotal = payments
    .filter((p) => p.status === "CAPTURED" && p.createdAt >= thisMonthStart)
    .reduce((acc, p) => acc + p.amountPaise, 0);

  const lastMonthTotal = payments
    .filter(
      (p) =>
        p.status === "CAPTURED" &&
        p.createdAt >= lastMonthStart &&
        p.createdAt < thisMonthStart
    )
    .reduce((acc, p) => acc + p.amountPaise, 0);

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
      title="Payments Ledger"
      subtitle="Financial overview of sessions booked and settled"
      tabs={coachTabs}
    >
      <div className="flex flex-col gap-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff]">
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
              This Month ({format(now, "MMMM yyyy")})
            </span>
            <span className="text-[32px] font-[family-name:var(--font-mono)] text-[#000000]">
              ₹{(thisMonthTotal / 100).toLocaleString("en-IN")}
            </span>
          </div>

          <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff]">
            <span className="text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232] block">
              Last Month ({format(subMonths(now, 1), "MMMM yyyy")})
            </span>
            <span className="text-[32px] font-[family-name:var(--font-mono)] text-[#000000]">
              ₹{(lastMonthTotal / 100).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff]">
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#fafafa] border-b border-[#000000] text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
            <span className="col-span-3">Date</span>
            <span className="col-span-4">Student & Session</span>
            <span className="col-span-2">Amount</span>
            <span className="col-span-3 text-right">Status</span>
          </div>

          {payments.length === 0 ? (
            <p className="p-8 text-center text-[14px] text-[#323232]">
              No payments recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-[#000000]/10">
              {payments.map((p) => (
                <div
                  key={p.id}
                  className="p-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center hover:bg-[#fafafa]/50"
                >
                  <div className="md:col-span-3 text-[13px] font-[family-name:var(--font-mono)] text-[#323232]">
                    {format(p.createdAt, "PPpp")}
                  </div>

                  <div className="md:col-span-4">
                    <span className="text-[15px] font-[family-name:var(--font-heading)] text-[#000000] block">
                      {p.booking.student.displayName}
                    </span>
                    <span className="text-[12px] text-[#323232]">
                      {p.booking.sessionType.name} · Ref: {p.booking.reference}
                    </span>
                  </div>

                  <div className="md:col-span-2 text-[16px] font-[family-name:var(--font-mono)] text-[#000000]">
                    ₹{(p.amountPaise / 100).toLocaleString("en-IN")}
                  </div>

                  <div className="md:col-span-3 flex md:justify-end">
                    <Tag
                      variant={
                        p.status === "CAPTURED"
                          ? "lime"
                          : p.status === "REFUNDED"
                          ? "concrete"
                          : "outline"
                      }
                      size="sm"
                    >
                      {p.status}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
