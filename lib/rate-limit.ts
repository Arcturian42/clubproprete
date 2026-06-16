// Rate limiter hybride : Vercel KV en production, Map en mémoire en dev/fallback.
// Pour activer Vercel KV, configurez KV_URL (ou KV_REST_API_URL + KV_REST_API_TOKEN).
// Sans KV, le rate limiter fonctionne en mémoire (valide pour un seul worker).

import crypto from "crypto";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const memoryStore = new Map<string, RateLimitEntry>();

function memoryCleanup() {
  const now = Date.now();
  for (const [key, entry] of memoryStore) {
    if (entry.resetAt < now) memoryStore.delete(key);
  }
}

function memoryRateLimit(key: string, maxRequests = 5, windowMs = 60_000): { success: boolean; remaining: number; resetAt: number } {
  memoryCleanup();
  const now = Date.now();
  const entry = memoryStore.get(key);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + windowMs;
    memoryStore.set(key, { count: 1, resetAt });
    return { success: true, remaining: maxRequests - 1, resetAt };
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt };
}

// --- Vercel KV adapter ---

function getKvToken(): { url: string; token: string } | null {
  const url = process.env.KV_URL || process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

async function kvRateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60_000
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  const kv = getKvToken();
  if (!kv) {
    return memoryRateLimit(key, maxRequests, windowMs);
  }

  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / windowMs)}`;
  const resetAt = (Math.floor(now / windowMs) + 1) * windowMs;

  try {
    const res = await fetch(`${kv.url}/incr/${encodeURIComponent(windowKey)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${kv.token}` },
    });

    if (!res.ok) {
      // Fallback mémoire si KV est indisponible
      return memoryRateLimit(key, maxRequests, windowMs);
    }

    const count = Number(await res.text());
    const success = count <= maxRequests;
    return { success, remaining: Math.max(0, maxRequests - count), resetAt };
  } catch {
    return memoryRateLimit(key, maxRequests, windowMs);
  }
}

export async function rateLimit(
  key: string,
  maxRequests = 5,
  windowMs = 60_000
): Promise<{ success: boolean; remaining: number; resetAt: number }> {
  if (getKvToken()) {
    return kvRateLimit(key, maxRequests, windowMs);
  }
  return memoryRateLimit(key, maxRequests, windowMs);
}

export async function rateLimitByIp(ip: string, action: string, maxRequests = 5, windowMs = 60_000) {
  return rateLimit(`${ip}:${action}`, maxRequests, windowMs);
}

export async function rateLimitByEmail(email: string, action: string, maxRequests = 5, windowMs = 60_000) {
  return rateLimit(`${email.toLowerCase()}:${action}`, maxRequests, windowMs);
}

/**
 * Rate limit combiné IP + Email pour les actions sensibles (login, register).
 * Bloque si l'un des deux rate limits est dépassé.
 */
export async function rateLimitCombined(
  ip: string,
  email: string,
  action: string,
  maxPerIp = 10,
  maxPerEmail = 5,
  windowMs = 300_000
) {
  const ipLimit = await rateLimitByIp(ip, action, maxPerIp, windowMs);
  if (!ipLimit.success) return ipLimit;

  const emailLimit = await rateLimitByEmail(email, action, maxPerEmail, windowMs);
  if (!emailLimit.success) return emailLimit;

  return { success: true, remaining: Math.min(ipLimit.remaining, emailLimit.remaining), resetAt: Math.max(ipLimit.resetAt, emailLimit.resetAt) };
}

// SHA-256 IP hash pour le logging (RGPD — pas d'IP en clair dans les logs)
export function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}
