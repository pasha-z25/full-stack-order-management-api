import 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: { sub: number; email: string };
    }
  }
}
