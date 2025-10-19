import type { NextFunction, Request, Response } from 'express';

import { ResponseStatus } from '@/types';
import UserService from '@services/userService';
import { getRequestInfo } from '@utils/helpers';
import logger, { LOG_LEVEL } from '@utils/logger';

export const getAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const users = await UserService.getAllUsers();

    logger.info('ℹ️  Users retrieved successfully', {
      usersCount: users.length,
    });

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: users,
    });
  } catch (error: unknown) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:users',
      message: '❌  Error retrieving users',
      requestInfo: getRequestInfo(req),
      error,
    });

    next(error);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = req.params.id;

  try {
    const user = await UserService.getUserById(userId);

    logger.info(`ℹ️  User ${userId} retrieved successfully`);

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: user,
    });
  } catch (error: unknown) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:users',
      message: `❌  Error retrieving user ${userId}`,
      requestInfo: getRequestInfo(req),
      error,
    });

    next(error);
  }
};
