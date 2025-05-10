import type { Request, Response } from 'express';

import { UserService } from '@/services/userService';
import logger from '@/utils/logger';

export const getAllUsers = async (
  _req: Request,
  res: Response
): Promise<void> => {
  logger.info('GET /users');

  try {
    const userService = new UserService();

    const users = await userService.getAllUsers();

    logger.info('Users retrieved successfully', {
      usersCount: users.length,
    });

    res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (error: unknown) {
    const unknownError = new Error('Unknown error occurred');
    const errorMessage =
      error instanceof Error ? error.message : String(unknownError);

    logger.error('❌ Error retrieving users', { error: errorMessage });
    res.status(500).json({
      status: 'error',
      message: errorMessage || 'Internal server error',
    });
  }
};

export const getUserById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const userId = req.params.id;

  logger.info('GET /users/:userId', { userId });

  try {
    const userService = new UserService();

    const user = await userService.getUserById(userId);

    logger.info('Users retrieved successfully', {
      user: user,
    });

    res.status(200).json({
      status: 'success',
      data: user,
    });
  } catch (error: unknown) {
    const unknownError = new Error('Unknown error occurred');
    const errorMessage =
      error instanceof Error ? error.message : String(unknownError);

    logger.error('❌ Error retrieving user', { error: errorMessage });
    res.status(500).json({
      status: 'error',
      message: errorMessage || 'Internal server error',
    });
  }
};
