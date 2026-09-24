import React from "react";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { BookingFlow } from "@/components/booking/BookingFlow";

export default async function BookPage() {
  const coaches = await prisma.coach.findMany({
    where: { isActive: true },
    select: {
      id: true,
      slug: true,
      displayName: true,
      focusLevels: true,
      defaultMeetUrl: true,
      fideId: true,
      fideRating: true,
    },
  });

  const sessionTypes = await prisma.sessionType.findMany({
    where: { isActive: true },
    select: {
      id: true,
      coachId: true,
      name: true,
      level: true,
      durationMinutes: true,
      pricePaise: true,
      description: true,
      isTrial: true,
    },
  });

  const session = await getSession();
  let initialUserData = null;

  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: { studentProfiles: true },
    });
    if (user) {
      initialUserData = {
        id: user.id,
        email: user.email,
        name: user.name,
        students: user.studentProfiles.map((s) => ({
          id: s.id,
          displayName: s.displayName,
          level: s.level,
        })),
      };
    }
  }

  return (
    <div className="w-full bg-[#000000] text-[#ffffff] min-h-[calc(100vh-140px)]">
      <BookingFlow
        coaches={coaches}
        sessionTypes={sessionTypes}
        initialUser={initialUserData}
      />
    </div>
  );
}
