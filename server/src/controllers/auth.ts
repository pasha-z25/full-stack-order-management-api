import { AuthService } from '@/services/authService';
import { ResponseStatus } from '@/types';
import { getRequestInfo } from '@/utils/helpers';
import { LOG_LEVEL, logger } from '@/utils/logger';
import { Request, Response } from 'express';

const authService = new AuthService();

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.log({
      level: LOG_LEVEL.WARN,
      scope: 'controller:auth',
      message: '⚠️ Email or password is empty',
      requestInfo: getRequestInfo(req),
    });

    res.status(400).send({
      status: ResponseStatus.ERROR,
      error: { message: 'Email or password is empty' },
    });
    return;
  }

  try {
    const user = await authService.login(email, password);

    if (!user) {
      logger.log({
        level: LOG_LEVEL.WARN,
        scope: 'controller:auth',
        message: '⚠️ User not found',
        requestInfo: getRequestInfo(req),
      });

      res.status(404).send({
        status: ResponseStatus.ERROR,
        error: { message: 'User not found' },
      });
      return;
    }

    logger.log({
      level: LOG_LEVEL.INFO,
      scope: 'controller:auth',
      message: 'ℹ️ User found successfully',
      requestInfo: getRequestInfo(req),
    });

    res.status(200).send({ status: ResponseStatus.SUCCESS, data: user });
  } catch (error) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:auth',
      message: '❌ Something went wrong!',
      requestInfo: getRequestInfo(req),
      error,
    });

    res.status(400).send({ status: ResponseStatus.ERROR, error });
  }
};
