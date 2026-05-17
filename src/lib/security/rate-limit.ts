/**
 * Rate limiting utility
 *
 * In production this should be backed by Redis (e.g. Upstash Redis with
 * the @upstash/ratelimit package, or ioredis with a sliding-window script).
 *
 * The in-memory Map used here is intentionally lightweight and works for
 * demo/development purposes only. It resets on every server restart and
 * does NOT work in a multi-instance deployment.
 *
 * Production swap-in:
 *   import { Ratelimit } from "@upstash/ratelimit";
 *   import { Redis } from "@upstash/redis";
 *   const ratelimit = new Ratelimit({
 *     redis: Redis.fromEnv(),
 *     limiter: Ratelimit.slidingWindow(5, "1 m"),
 *   });
 */

interface RateLimitResult {
  allowed: boolean;
  /** How many requests remain in the current window */
  remaining: number;
  /** Unix timestamp (ms) when the window resets */
  resetAt: number;
}

interface WindowRecord {
  count: number;
  windowStart: number;
}

// In-memory store — see note above about production limitations
const store = new Map<string, WindowRecord>();

/** Window duration in milliseconds (1 minute) */
const WINDOW_MS = 60_000;

/** Maximum requests per window per key */
const MAX_REQUESTS = 5;

/**
 * Checks whether the given key (typically an IP address or hashed email)
 * has exceeded the allowed request rate.
 *
 * @param key - A unique identifier for the requester (IP, hashed email, etc.)
 */
export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const record = store.get(key);

  // Start a fresh window if none exists or the previous one has expired
  if (!record || now - record.windowStart > WINDOW_MS) {
    const newRecord: WindowRecord = { count: 1, windowStart: now };
    store.set(key, newRecord);
    return {
      allowed: true,
      remaining: MAX_REQUESTS - 1,
      resetAt: now + WINDOW_MS,
    };
  }

  // Increment within the current window
  record.count += 1;
  store.set(key, record);

  const remaining = Math.max(0, MAX_REQUESTS - record.count);
  const resetAt = record.windowStart + WINDOW_MS;

  if (record.count > MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt };
  }

  return { allowed: true, remaining, resetAt };
}

/**
 * Derives a rate-limit key from a Next.js Request object.
 *
 * Prefers CF-Connecting-IP (set by Cloudflare) then X-Forwarded-For,
 * and falls back to a static string so the app doesn't crash if headers
 * are missing (which happens in local dev without a proxy).
 *
 * In production, always validate that these headers are set by a trusted
 * proxy — never trust them raw from an untrusted client.
 */
export function getRateLimitKey(request: Request): string {
  const cfIp = request.headers.get("CF-Connecting-IP");
  if (cfIp) return cfIp;

  const forwarded = request.headers.get("X-Forwarded-For");
  if (forwarded) return forwarded.split(",")[0].trim();

  // Fallback — safe for dev, not suitable for prod without a real IP header
  return "local-dev";
}
