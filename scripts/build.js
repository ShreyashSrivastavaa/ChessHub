const { execSync } = require("child_process");

// Ensure DATABASE_URL is set for Prisma CLI and Next.js SSG
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "file:./dev.db";
}

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: "inherit", env: process.env });
}

try {
  run("npx prisma generate");
  run("npx prisma db push --accept-data-loss");
  run("npx tsx prisma/seed.ts");
  run("npx next build");
} catch (error) {
  console.error("Build step failed:", error.message);
  process.exit(1);
}
