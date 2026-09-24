const { execSync } = require("child_process");

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

try {
  console.log("\n> npx prisma generate");
  execSync("npx prisma generate", { stdio: "inherit", env: process.env });
} catch (error) {
  console.warn("Postinstall prisma generate warning:", error.message);
}
