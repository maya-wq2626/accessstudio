// Simple in-memory rate limit: 10 generations per IP per hour.
// Note: on Vercel each serverless instance keeps its own counter, so this
// is a fair-use guard, not a hard global cap. See README for details.

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;

type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function rateLimit(key: string): {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_PER_WINDOW - 1, retryAfterSeconds: 0 };
  }
  if (entry.count >= MAX_PER_WINDOW) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000),
    };
  }
  entry.count += 1;
  return {
    allowed: true,
    remaining: MAX_PER_WINDOW - entry.count,
    retryAfterSeconds: 0,
  };
}

// Keep the map from growing forever.
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.resetAt) store.delete(key);
  }
}, WINDOW_MS).unref();
