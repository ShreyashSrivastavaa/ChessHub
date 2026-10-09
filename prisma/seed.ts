import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { BUSINESS_CONFIG } from "../src/config/business";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Chess Hub database...");

  // 1. Initial Admin Users
  const adminEmails = [
    process.env.ADMIN_EMAIL || "shreyashsr2004@gmail.com",
    "admin@chesshub.in",
  ];
  const rawAdminPassword = process.env.ADMIN_PASSWORD || "Admin123!";
  const passwordHash = await bcrypt.hash(rawAdminPassword, 10);

  for (const email of Array.from(new Set(adminEmails))) {
    const admin = await prisma.adminUser.upsert({
      where: { email },
      update: { passwordHash, role: "ADMIN" },
      create: {
        email,
        passwordHash,
        name: email === "shreyashsr2004@gmail.com" ? "Shreyash" : "Chess Hub Admin",
        role: "ADMIN",
      },
    });

    await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: "ADMIN" },
      create: {
        email,
        passwordHash,
        name: email === "shreyashsr2004@gmail.com" ? "Shreyash" : "Chess Hub Admin",
        role: "ADMIN",
      },
    });

    console.log(`✓ Admin user created/verified: ${admin.email}`);
  }

  // 2. Coaches (Shreyash and Tapesnu)
  for (const coach of BUSINESS_CONFIG.coaches) {
    const c = await prisma.coach.upsert({
      where: { slug: coach.slug },
      update: {
        name: coach.name,
        displayName: coach.displayName,
      },
      create: {
        slug: coach.slug,
        name: coach.name,
        displayName: coach.displayName,
        email: coach.slug === "shreyash" ? BUSINESS_CONFIG.email : undefined,
        phone: coach.slug === "tapesnu" ? BUSINESS_CONFIG.phone : undefined,
        isActive: true,
      },
    });
    console.log(`✓ Coach created/verified: ${c.displayName} (${c.slug})`);
  }

  // 3. Weekly Availability Rules (e.g., Monday through Saturday 10:00 - 18:00)
  // Day of week: 1 (Mon) to 6 (Sat)
  const existingRules = await prisma.availabilityRule.count();
  if (existingRules === 0) {
    const weekdays = [1, 2, 3, 4, 5, 6]; // Mon to Sat
    for (const day of weekdays) {
      await prisma.availabilityRule.create({
        data: {
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "18:00",
          duration: 60,
          capacity: 1,
          isActive: true,
        },
      });
    }
    console.log("✓ Default weekly availability rules created (Mon-Sat, 10:00-18:00)");
  }

  // 4. Generate initial concrete slots for the next 14 days based on rules
  const today = new Date();
  const timeSlots = ["10:00", "11:30", "14:00", "15:30", "17:00"];

  let slotsCreated = 0;
  for (let i = 1; i <= 14; i++) {
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + i);

    // Skip Sundays (0)
    if (targetDate.getDay() === 0) continue;

    const dateStr = targetDate.toISOString().split("T")[0];

    for (const timeStr of timeSlots) {
      const [hours, minutes] = timeStr.split(":").map(Number);
      
      // Calculate start and end UTC timestamps assuming Asia/Kolkata (+05:30)
      // IST is UTC + 5:30 => UTC = IST - 5:30
      const istDate = new Date(`${dateStr}T${timeStr}:00+05:30`);
      const endsAt = new Date(istDate.getTime() + 60 * 60 * 1000);

      const [endHours, endMinutes] = [
        String(new Date(istDate.getTime() + 60 * 60 * 1000).getHours()).padStart(2, "0"),
        String(minutes).padStart(2, "0")
      ];
      const endTimeStr = `${endHours}:${endMinutes}`;

      const existingSlot = await prisma.slot.findUnique({
        where: {
          date_startTime: {
            date: dateStr,
            startTime: timeStr,
          },
        },
      });

      if (!existingSlot) {
        await prisma.slot.create({
          data: {
            date: dateStr,
            startTime: timeStr,
            endTime: endTimeStr,
            startsAt: istDate,
            endsAt: endsAt,
            durationMinutes: 60,
            capacity: 1,
            isBlocked: false,
            isSoldOut: false,
          },
        });
        slotsCreated++;
      }
    }
  }

  console.log(`✓ Initial bookable slots generated: ${slotsCreated} slots over the next 14 days.`);
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
