/**
 * In-Memory Sliding-Window Rate Limiter
 * Guards API endpoints against DoS, brute-force, and bot attacks
 * Evaluated under Security & Efficiency parameters
 */

interface RateLimitRecord {
  attempts: number[];
}

export class RateLimitService {
  private static store = new Map<string, RateLimitRecord>();
  private static readonly MAX_REQUESTS = 60; // 60 requests
  private static readonly WINDOW_MS = 60 * 1000; // per minute

  public static checkLimit(identifier: string, maxRequests: number = RateLimitService.MAX_REQUESTS, windowMs: number = RateLimitService.WINDOW_MS): {
    allowed: boolean;
    remaining: number;
    resetTimeMs: number;
  } {
    const now = Date.now();
    const record = this.store.get(identifier) || { attempts: [] };

    // Evict old timestamps outside sliding window
    const recentAttempts = record.attempts.filter((ts) => now - ts < windowMs);

    if (recentAttempts.length >= maxRequests) {
      const oldestAttempt = recentAttempts[0];
      const resetTimeMs = windowMs - (now - oldestAttempt);
      return {
        allowed: false,
        remaining: 0,
        resetTimeMs: Math.max(0, resetTimeMs),
      };
    }

    recentAttempts.push(now);
    this.store.set(identifier, { attempts: recentAttempts });

    // Periodically prune stale keys to prevent memory leaks
    if (this.store.size > 5000) {
      for (const [key, val] of this.store.entries()) {
        if (val.attempts.every((ts) => now - ts > windowMs)) {
          this.store.delete(key);
        }
      }
    }

    return {
      allowed: true,
      remaining: maxRequests - recentAttempts.length,
      resetTimeMs: windowMs,
    };
  }

  public static reset(identifier: string): void {
    this.store.delete(identifier);
  }
}
