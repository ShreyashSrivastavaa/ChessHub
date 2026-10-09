import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { BUSINESS_CONFIG } from "@/config/business";

export const dynamic = "force-dynamic";

export default async function AdminCoachesPage() {
  const session = await requireRole(["ADMIN"]);

  const [coaches, pendingCount] = await Promise.all([
    prisma.coach.findMany(),
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
      title="Coach Profiles"
      subtitle="Coaching roster for Chess Hub"
      tabs={adminTabs}
    >
      <div className="flex flex-col gap-6">
        {coaches.map((c) => (
          <div
            key={c.id}
            className="p-6 rounded-2xl bg-[#141418] border border-[#2e2e36] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[20px] font-[family-name:var(--font-heading)] font-normal text-[#f5f3ef]">
                  {c.displayName}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#2e5a44]/30 text-[#4e8765] text-[11px] font-[family-name:var(--font-mono)] uppercase">
                  Active Coach
                </span>
              </div>
              <span className="text-[13px] font-[family-name:var(--font-mono)] text-[#cfa859] block mt-1">
                Slug: /{c.slug}
              </span>
              <span className="text-[13px] text-[#a8a39a] block">
                {c.slug === "tapesnu" ? `Phone: ${BUSINESS_CONFIG.phone}` : `Email: ${BUSINESS_CONFIG.email}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </DashboardShell>
  );
}
