import rateLimit, { type RateLimitRequestHandler } from 'express-rate-limit';

import { ResponseStatus } from '@/types';

const WINDOW_MS = 60 * 1000;

const AUTH_LIMIT = 5;

const CATALOG_LIMIT = 60;

const API_LIMIT = 30;

const limitedResponse = {
  status: ResponseStatus.ERROR,
  message: '⚠️ Too many requests, please try again later.',
};

function limiter(limit: number): RateLimitRequestHandler {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: limitedResponse,
  });
}

// Login and register share one bucket per client IP. A different userId in
// the body does not open a new one: the library keys by req.ip.
export const authLimiter = limiter(AUTH_LIMIT);

// Public product reads are hit on every catalog view.
export const catalogLimiter = limiter(CATALOG_LIMIT);

// Orders and users, including writes.
export const apiLimiter = limiter(API_LIMIT);
