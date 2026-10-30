import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '@/errors/httpError';
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

    logger.info('ℹ️  User found successfully');

    res.status(200).send({ status: ResponseStatus.SUCCESS, data: user });
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      logger.log({
        level: LOG_LEVEL.WARN,
        scope: 'controller:auth',
        message: '⚠️  Login failed',
        requestInfo: getRequestInfo(req),
      });

      res.status(error.statusCode).json({
        status: ResponseStatus.ERROR,
        message: error.message,
      });
      return;
    }

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
    const session = await AuthService.register(req.body);

    logger.info('ℹ️  User registered successfully');

    res.status(201).json({ status: ResponseStatus.SUCCESS, data: session });
  } catch (error: unknown) {
    if (error instanceof HttpError) {
      logger.log({
        level: LOG_LEVEL.WARN,
        scope: 'controller:auth',
        message: '⚠️  Registration failed',
        requestInfo: getRequestInfo(req),
      });

      res.status(error.statusCode).json({
        status: ResponseStatus.ERROR,
        message: error.message,
      });
      return;
    }

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
