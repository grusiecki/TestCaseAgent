import type { APIContext } from 'astro';
import { APIError } from '../lib/errors/api-errors';

// Simple in-memory store for rate limiting
// In production, use Redis or similar for distributed systems
const store = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  max: number;       // Maximum requests per window
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100                  // 100 requests per window
};

export const rateLimit = (config: RateLimitConfig = defaultConfig) => {
  return async (context: APIContext) => {
    const { request } = context;
    
    // Get user IP or session ID for rate limiting key
    const key = request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown';

    const now = Date.now();
    const record = store.get(key) || { count: 0, resetTime: now + config.windowMs };

    // Reset if window has expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + config.windowMs;
    }

    record.count++;
    store.set(key, record);

    // Check if rate limit exceeded
    if (record.count > config.max) {
      const resetInSeconds = Math.ceil((record.resetTime - now) / 1000);
      throw new APIError(429, 'Too Many Requests', {
        retryAfter: resetInSeconds,
        limit: config.max,
        windowMs: config.windowMs
      });
    }

    // Add rate limit headers
    context.response.headers.set('X-RateLimit-Limit', config.max.toString());
    context.response.headers.set('X-RateLimit-Remaining', 
      Math.max(0, config.max - record.count).toString());
    context.response.headers.set('X-RateLimit-Reset', 
      Math.ceil(record.resetTime / 1000).toString());
  };
};
