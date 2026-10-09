import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireRole(["ADMIN"]);

  const [admins, pendingCount] = await Promise.all([
    prisma.adminUser.findMany({
      orderBy: { createdAt: "desc" },
    }),
    prisma.booking.count({ where: { status: "PENDING" } }),
  ]);

  const adminTabs: NavTabItem[] = [
    { label: "Overview", href: "/admin" },
    { label: "Bookings", href: "/admin/bookings", badge: pendingCount },
    { label: "Availability", href: "/admin/availability" },
    { label: "Audit Log", href: "/admin/audit" },
  ];

  return (
    <DashboardShell
      role="ADMIN"
      userName={session.name}
      title="Admin Accounts"
      subtitle="Authorized administrators managing Chess Hub operations"
      tabs={adminTabs}
    >
      <div className="rounded-2xl border border-[#2e2e36] bg-[#141418] overflow-hidden">
        <div className="p-4 bg-[#0e0e10] border-b border-[#2e2e36] text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
          <span>Administrator / Email</span>
        </div>

        <div className="divide-y divide-[#2e2e36]">
          {admins.map((u) => (
            <div key={u.id} className="p-4 flex items-center justify-between hover:bg-[#1a1a1e]">
              <div>
                <span className="text-[15px] font-medium text-[#f5f3ef] block">
                  {u.name}
                </span>
                <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#cfa859]">
                  {u.email}
                </span>
              </div>
              <span className="text-[11px] font-[family-name:var(--font-mono)] text-[#a8a39a]">
                Created {format(new Date(u.createdAt), "MMM d, yyyy")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
