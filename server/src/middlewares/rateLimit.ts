import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';

import { ResponseStatus } from '@/types';

export const rateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req: Request) => {
    return (req.params.userId || req.body.userId || 'anonymous').toString();
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      status: ResponseStatus.ERROR,
      message: 'Too many requests, please try again later.',
    });
  },
});
