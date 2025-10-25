import { sequence } from 'astro:middleware';
import { authMiddleware } from './auth';
import { rateLimitMiddleware } from './rate-limit';
import { payloadLimitMiddleware } from './payload-limit';

// Sequence of middleware to be executed in order
export const onRequest = sequence(
  payloadLimitMiddleware,  // First check payload size
  rateLimitMiddleware,     // Then check rate limits
  authMiddleware,          // Finally check authentication
);