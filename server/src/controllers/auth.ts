import type { NextFunction, Request, Response } from 'express';

import AuthService from '@services/authService';
import { getRequestInfo } from '@utils/helpers';
import { LOG_LEVEL, logger } from '@utils/logger';

import { ResponseStatus } from '@/types';

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.log({
      level: LOG_LEVEL.WARN,
      scope: 'controller:auth',
      message: '⚠️  Email or password is empty',
      requestInfo: getRequestInfo(req),
    });

    res.status(400).send({
      status: ResponseStatus.ERROR,
      error: { message: 'Email or password is empty' },
    });
    return;
  }

  try {
    const user = await AuthService.login(email, password);

    if (!user) {
      logger.log({
        level: LOG_LEVEL.WARN,
        scope: 'controller:auth',
        message: '⚠️  User not found',
        requestInfo: getRequestInfo(req),
      });

      res.status(404).send({
        status: ResponseStatus.ERROR,
        error: { message: 'User not found' },
      });
      return;
    }

    logger.info('ℹ️  User found successfully');

    res.status(200).send({ status: ResponseStatus.SUCCESS, data: user });
  } catch (error) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:auth',
      message: '❌  Error login user',
      requestInfo: getRequestInfo(req),
      error,
    });

    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('ℹ️  User registered successfully');
    res.status(200).send({ status: ResponseStatus.SUCCESS, data: 'user data' });
  } catch (error) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:auth',
      message: '❌  Error register user',
      requestInfo: getRequestInfo(req),
      error,
    });

    next(error);
  }
};
