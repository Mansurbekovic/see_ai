// Sliding window rate limiter
// Uses in-memory Map for development/single instance
// Can be replaced with Redis/Postgres for production horizontal scaling

export interface RateLimitConfig {
  windowMs: number;    // Window size in ms
  maxRequests: number; // Max requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfterMs?: number;
}

// Predefined limits
export const RATE_LIMITS = {
  chat: { windowMs: 60_000, maxRequests: 20 },
  auth: { windowMs: 300_000, maxRequests: 10 },
  upload: { windowMs: 60_000, maxRequests: 10 },
  search: { windowMs: 60_000, maxRequests: 15 },
  api: { windowMs: 60_000, maxRequests: 60 },
} as const;

export class RateLimiter {
  private windows = new Map<string, { count: number; resetAt: number }>();
  private cleanupTimer?: ReturnType<typeof setInterval>;

  // Clean up expired entries periodically
  constructor(cleanupIntervalMs: number = 60_000) {
    if (typeof setInterval !== 'undefined') {
      this.cleanupTimer = setInterval(() => this.cleanup(), cleanupIntervalMs);
      // Prevent timer from keeping Node process alive if unref is available
      if (this.cleanupTimer && typeof this.cleanupTimer === 'object' && 'unref' in this.cleanupTimer) {
        (this.cleanupTimer as { unref: () => void }).unref();
      }
    }
  }

  check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const existing = this.windows.get(key);

    if (!existing || existing.resetAt <= now) {
      const resetAt = now + config.windowMs;
      this.windows.set(key, { count: 1, resetAt });
      return {
        allowed: true,
        remaining: Math.max(0, config.maxRequests - 1),
        resetAt: new Date(resetAt),
      };
    }

    if (existing.count < config.maxRequests) {
      existing.count += 1;
      return {
        allowed: true,
        remaining: Math.max(0, config.maxRequests - existing.count),
        resetAt: new Date(existing.resetAt),
      };
    }

    // Exceeded limit
    const retryAfterMs = Math.max(0, existing.resetAt - now);
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(existing.resetAt),
      retryAfterMs,
    };
  }

  reset(key: string): void {
    this.windows.delete(key);
  }

  clear(): void {
    this.windows.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.windows.entries()) {
      if (data.resetAt <= now) {
        this.windows.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }
}

export const rateLimiter = new RateLimiter();

// Helper to create rate limit key from user ID and action
export function rateLimitKey(userId: string, action: keyof typeof RATE_LIMITS): string {
  return `${action}:${userId}`;
}
