import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Default seed password hash: "Password123!"
  const passwordHash = await bcrypt.hash("Password123!", 10);

  // 1. Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@tworooks.com" },
    update: {},
    create: {
      email: "admin@tworooks.com",
      passwordHash,
      name: "Academy Director",
      role: "ADMIN",
    },
  });

  // 2. Coaches
  // Shreyash
  const shreyashUser = await prisma.user.upsert({
    where: { email: "shreyash@tworooks.com" },
    update: {},
    create: {
      email: "shreyash@tworooks.com",
      passwordHash,
      name: "Shreyash",
      role: "COACH",
    },
  });

  const shreyashCoach = await prisma.coach.upsert({
    where: { slug: "shreyash" },
    update: {},
    create: {
      userId: shreyashUser.id,
      slug: "shreyash",
      displayName: "Shreyash",
      bio: "Specializes in building deep foundational intuition, spatial awareness, and calm calculation for beginners and young learners.",
      philosophy:
        "Every master was once a beginner who learned to see the board clearly. We start with how pieces coordinate and build confidence move by move without memorization overload.",
      focusLevels: JSON.stringify(["BEGINNER", "FOUNDATIONS"]),
      defaultMeetUrl: "https://meet.google.com/tr-shreyash-demo", // PLACEHOLDER MEET URL
      timeZone: "Asia/Kolkata",
      slotBufferMinutes: 10,
      minNoticeHours: 12,
      maxAdvanceDays: 30,
      isActive: true,
    },
  });

  // Shreyash credentials (explicitly marked placeholder)
  await prisma.coachCredential.deleteMany({ where: { coachId: shreyashCoach.id } });
  await prisma.coachCredential.createMany({
    data: [
      {
        coachId: shreyashCoach.id,
        label: "Teaching Focus",
        detail: "Foundations & Beginner Chess Pedagogy",
        sortOrder: 1,
      },
      {
        coachId: shreyashCoach.id,
        label: "Certification",
        detail: "[PLACEHOLDER: add certification or teaching experience]",
        sortOrder: 2,
      },
    ],
  });

  // Tapesh
  const tapeshUser = await prisma.user.upsert({
    where: { email: "tapesh@tworooks.com" },
    update: {},
    create: {
      email: "tapesh@tworooks.com",
      passwordHash,
      name: "Tapesh",
      role: "COACH",
    },
  });

  const tapeshCoach = await prisma.coach.upsert({
    where: { slug: "tapesh" },
    update: {},
    create: {
      userId: tapeshUser.id,
      slug: "tapesh",
      displayName: "Tapesh",
      bio: "FIDE-rated competitive player and analytical coach working with intermediate and tournament-aspiring players.",
      philosophy:
        "Chess at the competitive level is about concrete calculation, opening discipline, and exploiting dynamic imbalances. We analyze your real games to eliminate systemic inaccuracies.",
      focusLevels: JSON.stringify(["INTERMEDIATE", "ADVANCED"]),
      defaultMeetUrl: "https://meet.google.com/tr-tapesh-demo", // PLACEHOLDER MEET URL
      timeZone: "Asia/Kolkata",
      slotBufferMinutes: 10,
      minNoticeHours: 12,
      maxAdvanceDays: 30,
      fideId: null, // Left null until confirmed per instructions
      fideRating: null, // Left null until confirmed per instructions
      isActive: true,
    },
  });

  // Tapesh credentials (FIDE-rated only, no fabricated ratings)
  await prisma.coachCredential.deleteMany({ where: { coachId: tapeshCoach.id } });
  await prisma.coachCredential.createMany({
    data: [
      {
        coachId: tapeshCoach.id,
        label: "Status",
        detail: "FIDE-rated Player",
        sortOrder: 1,
      },
      {
        coachId: tapeshCoach.id,
        label: "Competitive Focus",
        detail: "Positional Play & Tournament Calculation",
        sortOrder: 2,
      },
    ],
  });

  // 3. Session Types (All prices in paise, marked PLACEHOLDER)
  await prisma.sessionType.deleteMany({});
  await prisma.sessionType.createMany({
    data: [
      // Shreyash
      {
        coachId: shreyashCoach.id,
        name: "Trial & Placement (Foundations)",
        level: "BEGINNER",
        durationMinutes: 30,
        pricePaise: 0, // // PLACEHOLDER PRICE: Free trial
        description: "A 30-minute diagnostic session to assess board comfort, piece coordination, and learning style.",
        isTrial: true,
        isActive: true,
      },
      {
        coachId: shreyashCoach.id,
        name: "Foundations 1:1 Class",
        level: "BEGINNER",
        durationMinutes: 50,
        pricePaise: 99900, // // PLACEHOLDER PRICE: ₹999
        description: "1:1 coaching covering board geometry, opening safety, and tactical vision.",
        isTrial: false,
        isActive: true,
      },
      {
        coachId: shreyashCoach.id,
        name: "Tactics & Checkmates 1:1",
        level: "FOUNDATIONS",
        durationMinutes: 50,
        pricePaise: 119900, // // PLACEHOLDER PRICE: ₹1,199
        description: "Pattern recognition for mating nets, forks, pins, and basic endgame technique.",
        isTrial: false,
        isActive: true,
      },
      // Tapesh
      {
        coachId: tapeshCoach.id,
        name: "Diagnostic & Rating Assessment",
        level: "INTERMEDIATE",
        durationMinutes: 30,
        pricePaise: 0, // // PLACEHOLDER PRICE: Free assessment
        description: "Deep dive into your recent game history, blunder patterns, and current opening choices.",
        isTrial: true,
        isActive: true,
      },
      {
        coachId: tapeshCoach.id,
        name: "Intermediate 1:1 Coaching",
        level: "INTERMEDIATE",
        durationMinutes: 60,
        pricePaise: 149900, // // PLACEHOLDER PRICE: ₹1,499
        description: "Positional play, pawn structure transitions, and calculation techniques in dynamic positions.",
        isTrial: false,
        isActive: true,
      },
      {
        coachId: tapeshCoach.id,
        name: "Opening Repertoire Deep-Dive",
        level: "ADVANCED",
        durationMinutes: 60,
        pricePaise: 199900, // // PLACEHOLDER PRICE: ₹1,999
        description: "Building a coherent, tailored opening repertoire with plans, pawn breaks, and typical middlegame structures.",
        isTrial: false,
        isActive: true,
      },
      {
        coachId: tapeshCoach.id,
        name: "Tournament Game Analysis",
        level: "ADVANCED",
        durationMinutes: 75,
        pricePaise: 249900, // // PLACEHOLDER PRICE: ₹2,499
        description: "Rigorous forensic analysis of your over-the-board or classical rated games to isolate decision weaknesses.",
        isTrial: false,
        isActive: true,
      },
    ],
  });

  // 4. Availability Rules (Monday - Saturday)
  await prisma.availabilityRule.deleteMany({});
  const weekdays = [1, 2, 3, 4, 5, 6]; // Mon to Sat

  // Shreyash: 10:00 - 13:00 (600 - 780) and 15:00 - 19:00 (900 - 1140)
  for (const day of weekdays) {
    await prisma.availabilityRule.create({
      data: {
        coachId: shreyashCoach.id,
        weekday: day,
        startMinute: 600, // 10:00
        endMinute: 780, // 13:00
      },
    });
    await prisma.availabilityRule.create({
      data: {
        coachId: shreyashCoach.id,
        weekday: day,
        startMinute: 900, // 15:00
        endMinute: 1140, // 19:00
      },
    });
  }

  // Tapesh: 14:00 - 20:00 (840 - 1200)
  for (const day of weekdays) {
    await prisma.availabilityRule.create({
      data: {
        coachId: tapeshCoach.id,
        weekday: day,
        startMinute: 840, // 14:00
        endMinute: 1200, // 20:00
      },
    });
  }

  // 5. Skill Areas
  await prisma.skillArea.deleteMany({});
  const foundationsSkills = [
    "Board and piece movement",
    "Checkmate patterns",
    "Opening principles",
    "Basic tactics",
    "Basic endgames",
    "Thinking before moving",
  ];

  const improvementSkills = [
    "Opening repertoire",
    "Tactical awareness",
    "Calculation",
    "Positional understanding",
    "Endgames",
    "Game analysis",
    "Decision making under time",
    "Tournament readiness",
  ];

  let sort = 1;
  for (const name of foundationsSkills) {
    await prisma.skillArea.create({
      data: { name, track: "FOUNDATIONS", sortOrder: sort++ },
    });
  }
  for (const name of improvementSkills) {
    await prisma.skillArea.create({
      data: { name, track: "IMPROVEMENT", sortOrder: sort++ },
    });
  }

  // 6. Testimonials table left completely empty (NO FAKE TESTIMONIALS)
  await prisma.testimonial.deleteMany({});

  // 7. Demo student data if SEED_DEMO=true
  if (process.env.SEED_DEMO === "true") {
    console.log("Seeding demo student data...");

    const guardianUser = await prisma.user.upsert({
      where: { email: "guardian@example.com" },
      update: {},
      create: {
        email: "guardian@example.com",
        passwordHash,
        name: "Meera Patel",
        role: "STUDENT",
        phone: "+91 98765 00000",
      },
    });

    const studentProfile = await prisma.student.create({
      data: {
        ownerUserId: guardianUser.id,
        displayName: "Arjun Patel",
        birthYear: 2015,
        isMinor: true,
        level: "BEGINNER",
        chessPlatformUsername: "arjun_chess2015",
        currentRating: 640,
        notes: "Enthusiastic 9-year-old. Loves knights and tactical puzzles.",
      },
    });

    // Seed student skills
    const allSkills = await prisma.skillArea.findMany();
    const movementSkill = allSkills.find((s) => s.name === "Board and piece movement");
    const checkmateSkill = allSkills.find((s) => s.name === "Checkmate patterns");
    const openingSkill = allSkills.find((s) => s.name === "Opening principles");
    const tacticsSkill = allSkills.find((s) => s.name === "Basic tactics");

    if (movementSkill) {
      await prisma.studentSkill.create({
        data: {
          studentId: studentProfile.id,
          skillAreaId: movementSkill.id,
          stage: "FLUENT",
          coachComment: "Pieces move intuitively; diagonal vision is sharp.",
          updatedByCoachId: shreyashCoach.id,
        },
      });
    }
    if (checkmateSkill) {
      await prisma.studentSkill.create({
        data: {
          studentId: studentProfile.id,
          skillAreaId: checkmateSkill.id,
          stage: "RELIABLE",
          coachComment: "Consistently identifies back-rank and helper mates.",
          updatedByCoachId: shreyashCoach.id,
        },
      });
    }
    if (openingSkill) {
      await prisma.studentSkill.create({
        data: {
          studentId: studentProfile.id,
          skillAreaId: openingSkill.id,
          stage: "DEVELOPING",
          coachComment: "Developing center control and castling before attacking.",
          updatedByCoachId: shreyashCoach.id,
        },
      });
    }
    if (tacticsSkill) {
      await prisma.studentSkill.create({
        data: {
          studentId: studentProfile.id,
          skillAreaId: tacticsSkill.id,
          stage: "INTRODUCED",
          coachComment: "Introduced forks and pins in 1-move puzzles.",
          updatedByCoachId: shreyashCoach.id,
        },
      });
    }

    // Rating progression snapshots
    await prisma.ratingSnapshot.createMany({
      data: [
        { studentId: studentProfile.id, rating: 420, source: "SELF", recordedAt: new Date(Date.now() - 60 * 86400000) },
        { studentId: studentProfile.id, rating: 510, source: "COACH", recordedAt: new Date(Date.now() - 40 * 86400000) },
        { studentId: studentProfile.id, rating: 580, source: "LICHESS", recordedAt: new Date(Date.now() - 20 * 86400000) },
        { studentId: studentProfile.id, rating: 640, source: "COACH", recordedAt: new Date(Date.now() - 5 * 86400000) },
      ],
    });

    // Goal
    await prisma.goal.create({
      data: {
        studentId: studentProfile.id,
        title: "Solve 5 tactics puzzles without checking hints",
        description: "Focus on spotting unprotected pieces before calculating.",
        status: "ACTIVE",
        createdBy: "COACH",
      },
    });

    // Fetch Shreyash's foundations session
    const foundationsSession = await prisma.sessionType.findFirst({
      where: { coachId: shreyashCoach.id, name: { contains: "Foundations" } },
    });

    if (foundationsSession) {
      // Upcoming booking tomorrow
      const tomorrow17 = new Date();
      tomorrow17.setDate(tomorrow17.getDate() + 1);
      tomorrow17.setHours(17, 0, 0, 0);
      const tomorrow17End = new Date(tomorrow17.getTime() + 50 * 60000);

      const booking = await prisma.booking.create({
        data: {
          reference: "TR-0101",
          studentId: studentProfile.id,
          bookedByUserId: guardianUser.id,
          coachId: shreyashCoach.id,
          sessionTypeId: foundationsSession.id,
          startsAt: tomorrow17,
          endsAt: tomorrow17End,
          status: "CONFIRMED",
          meetUrl: shreyashCoach.defaultMeetUrl,
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          provider: "mock",
          providerOrderId: "order_mock_0101",
          providerPaymentId: "pay_mock_0101",
          amountPaise: foundationsSession.pricePaise,
          status: "CAPTURED",
        },
      });

      // Active homework
      await prisma.homework.create({
        data: {
          studentId: studentProfile.id,
          coachId: shreyashCoach.id,
          bookingId: booking.id,
          title: "Spot the Unprotected Piece",
          instructions: "Find 3 unprotected pieces in your last played game on Lichess.",
          tags: JSON.stringify(["Tactics", "Blunder Check"]),
          dueDate: tomorrow17,
          status: "ASSIGNED",
        },
      });

      // Coach Note
      await prisma.coachNote.create({
        data: {
          bookingId: booking.id,
          studentId: studentProfile.id,
          coachId: shreyashCoach.id,
          body: "Arjun did very well with rook checkmates. Next class we will introduce knight forks.",
          visibleToStudent: true,
        },
      });
    }
  }

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
