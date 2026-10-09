import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "readline";

const prisma = new PrismaClient();

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    })
  );
}

async function main() {
  console.log("\n==========================================");
  console.log("   Chess Hub — Create Admin User Script   ");
  console.log("==========================================\n");

  let email = process.env.ADMIN_EMAIL || process.argv[2];
  let password = process.env.ADMIN_PASSWORD || process.argv[3];
  let name = process.argv[4] || "Academy Admin";

  if (!email) {
    email = await askQuestion("Enter admin email address: ");
  }
  if (!password) {
    password = await askQuestion("Enter admin password (min 8 chars): ");
  }

  if (!email || !email.includes("@")) {
    console.error("❌ Error: A valid email address is required.");
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error("❌ Error: Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      passwordHash,
      name,
      role: "ADMIN",
    },
    create: {
      email,
      passwordHash,
      name,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      name,
      role: "ADMIN",
    },
    create: {
      email,
      passwordHash,
      name,
      role: "ADMIN",
    },
  });

  console.log(`\n✅ Admin user created/updated successfully!`);
  console.log(`ID:    ${admin.id}`);
  console.log(`Email: ${admin.email}`);
  console.log(`Name:  ${admin.name}`);
  console.log(`Role:  ${admin.role}\n`);
}

main()
  .catch((err) => {
    console.error("❌ Failed to create admin:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
