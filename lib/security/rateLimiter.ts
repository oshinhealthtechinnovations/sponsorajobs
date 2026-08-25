/**
 * Edge-compatible sliding-window in-memory Rate Limiter
 * Reference: Section 54 & 110
 */

interface RateLimitRecord {
  timestamps: number[];
}

export class RateLimiter {
  private requests: Map<string, RateLimitRecord> = new Map();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number = 60, windowMs: number = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  /**
   * Check if an identifier (IP / client token) is within rate limits
   */
  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(identifier) || { timestamps: [] };

    // Filter out timestamps outside the current window
    const recentTimestamps = record.timestamps.filter((t) => now - t < this.windowMs);

    if (recentTimestamps.length >= this.maxRequests) {
      const oldest = recentTimestamps[0];
      const resetTime = Math.ceil((oldest + this.windowMs - now) / 1000);
      return {
        allowed: false,
        remaining: 0,
        resetTime: Math.max(1, resetTime),
      };
    }

    recentTimestamps.push(now);
    this.requests.set(identifier, { timestamps: recentTimestamps });

    return {
      allowed: true,
      remaining: this.maxRequests - recentTimestamps.length,
      resetTime: Math.ceil(this.windowMs / 1000),
    };
  }

  reset(): void {
    this.requests.clear();
  }
}

// Global default limiters
export const publicApiRateLimiter = new RateLimiter(60, 60000); // 60 req/min for public search
export const authRateLimiter = new RateLimiter(5, 60000); // 5 login attempts/min
