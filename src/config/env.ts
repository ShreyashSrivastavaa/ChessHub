import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, "DATABASE_URL must be specified"),
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 characters long").default("chess-hub-secure-auth-secret-key-32chars!"),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().default("https://chess-hub-six.vercel.app"),
  NEXT_PUBLIC_TIMEZONE: z.string().optional().default("Asia/Kolkata"),
  RESEND_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export function getValidatedEnv() {
  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL || "file:./dev.db",
    AUTH_SECRET: process.env.AUTH_SECRET || "chess-hub-secure-auth-secret-key-32chars!",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "https://chess-hub-six.vercel.app",
    NEXT_PUBLIC_TIMEZONE: process.env.NEXT_PUBLIC_TIMEZONE || "Asia/Kolkata",
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
  });

  if (!result.success) {
    console.error("❌ Environment validation error:", result.error.format());
    throw new Error("Invalid environment configuration. Check your .env file.");
  }

  return result.data;
}
