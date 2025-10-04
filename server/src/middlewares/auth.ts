import type { NextFunction, Request, Response } from 'express';

import { AuthService } from '@/services/authService';

export const authMiddleware = (authService: AuthService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res
          .status(401)
          .json({ message: 'Access token is missing or invalid' });
      }

      const token = authHeader.substring(7); // Remove "Bearer "
      const payload = authService.verifyToken(token);

      req.user = payload;

      next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: (error as Error).message || 'Unauthorized' });
    }
  };
};
