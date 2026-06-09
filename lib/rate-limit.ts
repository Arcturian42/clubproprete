// Rate limiter simple en mémoire (à remplacer par Redis en production)

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}

export function rateLimit(key: string, maxRequests = 5, windowMs = 60_000): { success: boolean; remaining: number; resetAt: number } {
  cleanup();
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

export function rateLimitByIp(ip: string, action: string, maxRequests = 5, windowMs = 60_000) {
  return rateLimit(`${ip}:${action}`, maxRequests, windowMs);
}

export function rateLimitByEmail(email: string, action: string, maxRequests = 5, windowMs = 60_000) {
  return rateLimit(`${email.toLowerCase()}:${action}`, maxRequests, windowMs);
}
