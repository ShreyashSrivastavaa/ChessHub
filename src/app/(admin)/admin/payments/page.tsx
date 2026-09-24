import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export default async function AdminPaymentsPage() {
  const session = await requireRole(["ADMIN"]);

  const payments = await prisma.payment.findMany({
    include: {
      booking: {
        include: { coach: true, student: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Server Action: Mark refund processed
  async function handleMarkRefunded(formData: FormData) {
    "use server";
    const paymentId = formData.get("paymentId") as string;
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "REFUNDED",
        refundedAt: new Date(),
      },
    });
    revalidatePath("/admin/payments");
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
      title="Payments & Manual Refunds"
      subtitle="Complete ledger of client transactions and refund queues"
      tabs={adminTabs}
    >
      <div className="border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff]">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#fafafa] border-b border-[#000000] text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
          <span className="col-span-3">Time & Ref</span>
          <span className="col-span-4">Student & Coach</span>
          <span className="col-span-2">Amount</span>
          <span className="col-span-3 text-right">Status / Refund</span>
        </div>

        <div className="divide-y divide-[#000000]/10">
          {payments.map((p) => (
            <div
              key={p.id}
              className="p-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center hover:bg-[#fafafa]/50"
            >
              <div className="md:col-span-3">
                <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#000000] block">
                  {format(p.createdAt, "PPpp")}
                </span>
                <span className="text-[11px] text-[#323232] font-[family-name:var(--font-mono)]">
                  {p.providerOrderId}
                </span>
              </div>

              <div className="md:col-span-4 text-[14px]">
                <span className="text-[#000000] block">
                  {p.booking.student.displayName}
                </span>
                <span className="text-[12px] text-[#323232]">
                  Coach {p.booking.coach.displayName} · Ref: {p.booking.reference}
                </span>
              </div>

              <div className="md:col-span-2 text-[16px] font-[family-name:var(--font-mono)] text-[#000000]">
                ₹{(p.amountPaise / 100).toLocaleString("en-IN")}
              </div>

              <div className="md:col-span-3 flex md:justify-end items-center gap-2">
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

                {p.status === "REFUND_DUE" && (
                  <form action={handleMarkRefunded}>
                    <input type="hidden" name="paymentId" value={p.id} />
                    <Button type="submit" variant="secondary" size="sm">
                      Mark Refunded
                    </Button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
