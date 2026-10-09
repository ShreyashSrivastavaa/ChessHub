import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { format } from "date-fns";
import { Shield, Clock, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAuditPage() {
  const session = await requireRole(["ADMIN"]);

  const [auditLogs, pendingCount] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        adminUser: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
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
      title="Audit Log"
      subtitle="Immutable chronological ledger of all administrative changes and actions"
      tabs={adminTabs}
    >
      <div className="rounded-2xl border border-[#2e2e36] bg-[#141418] overflow-hidden">
        <div className="p-4 bg-[#0e0e10] border-b border-[#2e2e36] flex items-center justify-between text-[11px] font-[family-name:var(--font-mono)] uppercase text-[#a8a39a]">
          <span>Timestamp / Admin</span>
          <span>Action / Target</span>
          <span className="hidden md:inline">Details</span>
        </div>

        <div className="divide-y divide-[#2e2e36]">
          {auditLogs.length === 0 ? (
            <div className="py-12 text-center text-[#a8a39a] text-[14px]">
              No administrative audit entries recorded yet.
            </div>
          ) : (
            auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center hover:bg-[#1a1a1e] text-[13px]"
              >
                <div className="md:col-span-3 flex flex-col">
                  <span className="font-[family-name:var(--font-mono)] text-[#f5f3ef]">
                    {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </span>
                  <span className="text-[11px] text-[#a8a39a]">
                    {log.adminUser?.name || "Administrator"} ({log.ipAddress || "system"})
                  </span>
                </div>

                <div className="md:col-span-4 flex flex-col">
                  <span className="font-[family-name:var(--font-mono)] font-semibold text-[#cfa859]">
                    {log.action}
                  </span>
                  <span className="text-[12px] text-[#a8a39a]">
                    Entity: {log.entity} {log.entityId ? `(#${log.entityId})` : ""}
                  </span>
                </div>

                <div className="md:col-span-5 text-[#dcd8d0] text-[12px] break-words">
                  {log.details || "—"}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
