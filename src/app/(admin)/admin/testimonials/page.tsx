import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export default async function AdminTestimonialsPage() {
  const session = await requireRole(["ADMIN"]);

  const testimonials = await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Server Action: Add Real Testimonial
  async function handleAddTestimonial(formData: FormData) {
    "use server";
    const authorName = formData.get("authorName") as string;
    const relationship = formData.get("relationship") as string;
    const body = formData.get("body") as string;
    const isVisible = formData.get("isVisible") === "on";

    if (!authorName || !body) return;

    await prisma.testimonial.create({
      data: {
        authorName,
        relationship,
        body,
        isVisible,
        approvedAt: isVisible ? new Date() : null,
      },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/");
  }

  // Server Action: Toggle Approval
  async function handleToggleApproval(formData: FormData) {
    "use server";
    const id = formData.get("id") as string;
    const t = await prisma.testimonial.findUnique({ where: { id } });
    if (!t) return;

    await prisma.testimonial.update({
      where: { id },
      data: {
        isVisible: !t.isVisible,
        approvedAt: !t.isVisible ? new Date() : null,
      },
    });

    revalidatePath("/admin/testimonials");
    revalidatePath("/");
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
      title="Testimonials Approval"
      subtitle="Manage and verify real reviews from students and guardians"
      tabs={adminTabs}
    >
      <div className="flex flex-col gap-8">
        <div className="p-4 bg-[#e6e6e6]/60 border border-[#000000] rounded-[16px] text-[13px] font-[family-name:var(--font-mono)]">
          POLICY: No fake testimonials are seeded. The public testimonial section remains hidden until at least one authentic approved testimonial is added here.
        </div>

        {/* Add Testimonial Form */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
            Log Real Student / Parent Feedback
          </span>

          <form action={handleAddTestimonial} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                name="authorName"
                required
                placeholder="Author Name (e.g. Meera P.)"
                className="h-[44px] px-4 rounded-[50px] border border-[#000000] text-[14px] outline-none"
              />
              <select
                name="relationship"
                className="h-[44px] px-4 rounded-[50px] border border-[#000000] text-[14px] outline-none"
              >
                <option value="parent">Parent of student</option>
                <option value="student">Adult student</option>
              </select>
            </div>

            <textarea
              name="body"
              required
              rows={3}
              placeholder="Feedback quote..."
              className="w-full p-4 rounded-[16px] border border-[#000000] text-[14px] outline-none resize-none"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 select-none cursor-pointer text-[13px] text-[#000000]">
                <input
                  type="checkbox"
                  name="isVisible"
                  defaultChecked
                  className="w-4 h-4 accent-[#000000]"
                />
                <span>Approve and publish immediately to landing page</span>
              </label>

              <Button type="submit" variant="primary" size="sm">
                Add Feedback
              </Button>
            </div>
          </form>
        </div>

        {/* Testimonials List */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
            Stored Testimonials ({testimonials.length})
          </span>

          {testimonials.length === 0 ? (
            <p className="text-[14px] text-[#323232] py-4 text-center">
              No testimonials logged yet. The public section is currently cleanly hidden.
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-[#000000]/10">
              {testimonials.map((t) => (
                <div key={t.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="max-w-[540px]">
                    <p className="text-[15px] italic text-[#000000]">&ldquo;{t.body}&rdquo;</p>
                    <span className="text-[12px] font-[family-name:var(--font-mono)] text-[#323232] mt-1 block">
                      {t.authorName} ({t.relationship}) · Added {format(t.createdAt, "PP")}
                    </span>
                  </div>

                  <form action={handleToggleApproval}>
                    <input type="hidden" name="id" value={t.id} />
                    <Button
                      type="submit"
                      variant={t.isVisible ? "primary" : "secondary"}
                      size="sm"
                    >
                      {t.isVisible ? "Approved & Live" : "Hidden (Draft)"}
                    </Button>
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
