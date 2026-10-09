import { prisma } from "@/lib/db/prisma";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

/**
 * DB-Backed Sliding/Fixed Window Rate Limiter
 * 
 * Works out-of-the-box in serverless and containerized environments
 * without needing an external Redis instance.
 */
export async function checkRateLimit(
  key: string,
  limit: number = 10,
  windowSeconds: number = 60
): Promise<RateLimitResult> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    const existing = await prisma.rateLimit.findUnique({
      where: { key },
    });

    if (!existing || existing.expiresAt < now) {
      // Upsert fresh window
      await prisma.rateLimit.upsert({
        where: { key },
        create: {
          key,
          count: 1,
          expiresAt: resetAt,
        },
        update: {
          count: 1,
          expiresAt: resetAt,
        },
      });

      return {
        success: true,
        limit,
        remaining: limit - 1,
        resetAt,
      };
    }

    if (existing.count >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        resetAt: existing.expiresAt,
      };
    }

    // Increment count
    const updated = await prisma.rateLimit.update({
      where: { key },
      data: {
        count: { increment: 1 },
      },
    });

    return {
      success: true,
      limit,
      remaining: Math.max(0, limit - updated.count),
      resetAt: existing.expiresAt,
    };
  } catch (error) {
    // If rate limiter table is unavailable or locked, fail open safely in production
    console.warn("Rate limit check error:", error);
    return {
      success: true,
      limit,
      remaining: 1,
      resetAt,
    };
  }
}
