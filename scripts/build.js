const { execSync } = require("child_process");

const fs = require("fs");

// Load .env if present
if (typeof process.loadEnvFile === "function") {
  try {
    process.loadEnvFile();
  } catch {}
} else if (!process.env.DATABASE_URL && fs.existsSync(".env")) {
  try {
    const envContent = fs.readFileSync(".env", "utf8");
    const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) {
      process.env.DATABASE_URL = match[1];
    }
  } catch {}
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://localhost:5432/postgres";
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
