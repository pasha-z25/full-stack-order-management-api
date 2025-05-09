import { UserService } from '@/services/userService';
import logger from '@/utils/logger';
import type { Request, Response } from 'express';

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
  } catch (error: any) {
    logger.error('❌ Error retrieving users', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
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
  } catch (error: any) {
    logger.error('❌ Error retrieving user', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};
