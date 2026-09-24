import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { format } from "date-fns";

export default async function StudentPaymentsPage() {
  const session = await requireAuth();

  const payments = await prisma.payment.findMany({
    where: {
      booking: {
        bookedByUserId: session.id,
      },
    },
    include: {
      booking: {
        include: { coach: true, sessionType: true },
      },
    },
    orderBy: { createdAt: "desc" },
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
      title="Payments & Invoices"
      subtitle="Complete ledger of class fees and payment receipts"
      tabs={studentTabs}
    >
      <div className="border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff]">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#fafafa] border-b border-[#000000] text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
          <span className="col-span-3">Date</span>
          <span className="col-span-4">Session & Coach</span>
          <span className="col-span-2">Amount</span>
          <span className="col-span-3 text-right">Status</span>
        </div>

        {payments.length === 0 ? (
          <p className="p-8 text-center text-[14px] text-[#323232]">
            No payment records found.
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
                    {p.booking.sessionType.name}
                  </span>
                  <span className="text-[12px] text-[#323232]">
                    Ref: {p.booking.reference} · Coach {p.booking.coach.displayName}
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
    </DashboardShell>
  );
}
