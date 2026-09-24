import React from "react";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/session";
import { DashboardShell, NavTabItem } from "@/components/layout/DashboardShell";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { MeetJoinButton } from "@/components/dashboard/MeetJoinButton";
import { format } from "date-fns";
import { revalidatePath } from "next/cache";

export default async function CoachSessionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireRole(["COACH", "ADMIN"]);
  const { id } = await params;

  const coach = await prisma.coach.findFirst({
    where: { userId: session.id },
  });

  if (!coach && session.role !== "ADMIN") redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      student: true,
      sessionType: true,
      coachNotes: true,
      homework: true,
    },
  });

  if (!booking) notFound();

  // Server Actions for Coach:
  // 1. Mark status (COMPLETED or NO_SHOW)
  async function handleUpdateStatus(formData: FormData) {
    "use server";
    const status = formData.get("status") as any;
    await prisma.booking.update({
      where: { id },
      data: { status },
    });
    revalidatePath(`/coach/sessions/${id}`);
  }

  // 2. Add Coach Note
  async function handleAddNote(formData: FormData) {
    "use server";
    const body = formData.get("body") as string;
    const visibleToStudent = formData.get("visibleToStudent") === "on";

    if (!body) return;

    await prisma.coachNote.create({
      data: {
        bookingId: id,
        studentId: booking!.studentId,
        coachId: booking!.coachId,
        body,
        visibleToStudent,
      },
    });
    revalidatePath(`/coach/sessions/${id}`);
  }

  // 3. Assign Homework
  async function handleAssignHomework(formData: FormData) {
    "use server";
    const title = formData.get("title") as string;
    const instructions = formData.get("instructions") as string;
    const tagString = (formData.get("tags") as string) || "Tactics";
    const tags = tagString.split(",").map((t) => t.trim());

    if (!title || !instructions) return;

    await prisma.homework.create({
      data: {
        bookingId: id,
        studentId: booking!.studentId,
        coachId: booking!.coachId,
        title,
        instructions,
        tags: JSON.stringify(tags),
        status: "ASSIGNED",
      },
    });
    revalidatePath(`/coach/sessions/${id}`);
  }

  // 4. Update Meet URL override
  async function handleUpdateMeetUrl(formData: FormData) {
    "use server";
    const meetUrl = formData.get("meetUrl") as string;
    await prisma.booking.update({
      where: { id },
      data: { meetUrl: meetUrl || null },
    });
    revalidatePath(`/coach/sessions/${id}`);
  }

  const coachTabs: NavTabItem[] = [
    { label: "Overview", href: "/coach" },
    { label: "Sessions", href: "/coach/sessions" },
    { label: "Students", href: "/coach/students" },
    { label: "Schedule & Hours", href: "/coach/schedule" },
    { label: "Payments", href: "/coach/payments" },
    { label: "Profile & Meet", href: "/coach/profile" },
  ];

  const effectiveMeetUrl = booking.meetUrl || coach?.defaultMeetUrl || "";

  return (
    <DashboardShell
      role="COACH"
      userName={session.name}
      title={`Session Workspace (${booking.reference})`}
      subtitle={`Student: ${booking.student.displayName} · ${booking.sessionType.name}`}
      tabs={coachTabs}
      headerActions={
        <Link
          href="/coach/sessions"
          className="text-[13px] font-[family-name:var(--font-mono)] text-[#000000] hover-underline-animation"
        >
          &larr; Back to sessions
        </Link>
      }
    >
      <div className="flex flex-col gap-8">
        {/* Top Status & Join Room Strip */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Tag
              variant={
                booking.status === "CONFIRMED"
                  ? "lime"
                  : booking.status === "COMPLETED"
                  ? "concrete"
                  : "outline"
              }
              size="md"
            >
              {booking.status}
            </Tag>
            <span className="text-[14px] font-[family-name:var(--font-mono)] text-[#323232]">
              {format(booking.startsAt, "PPPPpp")} IST
            </span>
          </div>

          <div className="flex items-center gap-3">
            <MeetJoinButton
              startsAt={booking.startsAt}
              endsAt={booking.endsAt}
              meetUrl={effectiveMeetUrl}
            />

            {/* Quick Status Setter */}
            <form action={handleUpdateStatus} className="flex gap-2">
              {booking.status === "CONFIRMED" && (
                <>
                  <input type="hidden" name="status" value="COMPLETED" />
                  <Button type="submit" variant="secondary" size="sm">
                    Mark Completed
                  </Button>
                </>
              )}
            </form>
          </div>
        </div>

        {/* Meet URL override */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#fafafa]">
          <span className="text-[13px] font-[family-name:var(--font-heading)] uppercase text-[#000000] block mb-2">
            Classroom Meeting Link Override
          </span>
          <form action={handleUpdateMeetUrl} className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              name="meetUrl"
              defaultValue={booking.meetUrl || coach?.defaultMeetUrl || ""}
              placeholder="https://meet.google.com/..."
              className="h-[44px] px-4 rounded-[50px] border border-[#000000] bg-[#ffffff] text-[14px] flex-1 outline-none font-[family-name:var(--font-mono)]"
            />
            <Button type="submit" variant="secondary" size="md">
              Update Meet URL
            </Button>
          </form>
        </div>

        {/* Coach Notes Section */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
            Session Notes ({booking.coachNotes.length})
          </span>

          <form action={handleAddNote} className="flex flex-col gap-3">
            <textarea
              name="body"
              required
              rows={3}
              placeholder="Record pedagogical notes, tactical weaknesses, or opening positions worked through..."
              className="w-full p-4 rounded-[16px] border border-[#000000] text-[14px] outline-none resize-none"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 select-none cursor-pointer text-[13px] text-[#000000]">
                <input
                  type="checkbox"
                  name="visibleToStudent"
                  defaultChecked
                  className="w-4 h-4 accent-[#000000]"
                />
                <span>Visible to Student on their portal</span>
              </label>
              <Button type="submit" variant="primary" size="sm">
                Save Note
              </Button>
            </div>
          </form>

          {booking.coachNotes.length > 0 && (
            <div className="flex flex-col divide-y divide-[#000000]/10 pt-4">
              {booking.coachNotes.map((n) => (
                <div key={n.id} className="py-3 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[12px] font-[family-name:var(--font-mono)] text-[#323232]">
                    <span>{format(n.createdAt, "PPpp")}</span>
                    <span>{n.visibleToStudent ? "Student Visible" : "Private Note"}</span>
                  </div>
                  <p className="text-[14px] text-[#000000]">{n.body}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assign Homework */}
        <div className="p-6 border border-[#000000] rounded-[16px] bg-[#ffffff] flex flex-col gap-4">
          <span className="text-[14px] font-[family-name:var(--font-heading)] uppercase text-[#000000] pb-2 border-b border-[#000000]/10">
            Assign Homework Task
          </span>

          <form action={handleAssignHomework} className="flex flex-col gap-3">
            <input
              type="text"
              name="title"
              required
              placeholder="Homework Title (e.g. 5 King & Pawn Endgame Puzzles)"
              className="h-[44px] px-4 rounded-[50px] border border-[#000000] text-[14px] outline-none"
            />
            <textarea
              name="instructions"
              required
              rows={3}
              placeholder="Instructions or PGN link for the student to solve before next class..."
              className="w-full p-4 rounded-[16px] border border-[#000000] text-[14px] outline-none resize-none"
            />
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <input
                type="text"
                name="tags"
                defaultValue="Endgames, Pawn Structure"
                placeholder="Comma separated tags"
                className="h-[40px] px-4 rounded-[50px] border border-[#000000] text-[13px] w-full sm:w-[260px] outline-none"
              />
              <Button type="submit" variant="secondary" size="sm">
                Assign Homework
              </Button>
            </div>
          </form>

          {booking.homework.length > 0 && (
            <div className="flex flex-col divide-y divide-[#000000]/10 pt-4">
              {booking.homework.map((hw) => (
                <div key={hw.id} className="py-3 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-normal text-[15px] text-[#000000]">{hw.title}</span>
                    <Tag variant="outline" size="sm">{hw.status}</Tag>
                  </div>
                  <p className="text-[13px] text-[#323232]">{hw.instructions}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
