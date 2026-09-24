import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { format } from "date-fns";

export default async function AdminUsersPage() {
  const session = await requireRole(["ADMIN"]);

  const users = await prisma.user.findMany({
    include: { studentProfiles: true },
    orderBy: { createdAt: "desc" },
  });

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
      title="User Accounts"
      subtitle="Registered student guardians, coaches, and administrators"
      tabs={adminTabs}
    >
      <div className="border border-[#000000] rounded-[16px] overflow-hidden bg-[#ffffff]">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-[#fafafa] border-b border-[#000000] text-[12px] font-[family-name:var(--font-mono)] uppercase text-[#323232]">
          <span className="col-span-4">User</span>
          <span className="col-span-3">Email / Phone</span>
          <span className="col-span-3">Learner Profiles</span>
          <span className="col-span-2 text-right">Role</span>
        </div>

        <div className="divide-y divide-[#000000]/10">
          {users.map((u) => (
            <div
              key={u.id}
              className="p-4 flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4 items-start md:items-center hover:bg-[#fafafa]/50"
            >
              <div className="md:col-span-4">
                <span className="text-[15px] font-[family-name:var(--font-heading)] text-[#000000] block">
                  {u.name}
                </span>
                <span className="text-[12px] text-[#323232] font-[family-name:var(--font-mono)]">
                  Joined {format(u.createdAt, "PP")}
                </span>
              </div>

              <div className="md:col-span-3 text-[13px] text-[#000000]">
                <span>{u.email}</span>
                {u.phone && <span className="block text-[11px] text-[#323232]">{u.phone}</span>}
              </div>

              <div className="md:col-span-3 text-[13px] text-[#323232]">
                {u.studentProfiles.map((s) => s.displayName).join(", ") || "None"}
              </div>

              <div className="md:col-span-2 flex md:justify-end">
                <Tag
                  variant={
                    u.role === "ADMIN"
                      ? "lime"
                      : u.role === "COACH"
                      ? "outline"
                      : "concrete"
                  }
                  size="sm"
                >
                  {u.role}
                </Tag>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}
