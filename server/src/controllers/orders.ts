import type { NextFunction, Request, Response } from 'express';

import { HttpError } from '@/errors/httpError';
import { ResponseStatus } from '@/types';
import OrderService from '@services/orderService';
import { getRequestInfo } from '@utils/helpers';
import logger, { LOG_LEVEL } from '@utils/logger';
import { toPublicOrder } from '@utils/present';

const replyWithHttpError = (res: Response, error: unknown): boolean => {
  if (!(error instanceof HttpError)) return false;

  res.status(error.statusCode).json({
    status: ResponseStatus.ERROR,
    message: error.message,
  });
  return true;
};

const requireUserId = (req: Request, res: Response): string | null => {
  const userId = req.user?.sub;
  if (userId) return userId;

  res.status(401).json({
    status: ResponseStatus.ERROR,
    message: 'Unauthorized',
  });
  return null;
};

export const addOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { productId, quantity = 1 } = req.body;

  if (!productId || quantity <= 0) {
    logger.warn('⚠️  Invalid request data', { userId, productId, quantity });
    res.status(400).json({
      status: ResponseStatus.ERROR,
      message:
        'Invalid request data. productId and quantity (positive integer) are required.',
    });
    return;
  }

  try {
    const order = await OrderService.addToOrder({
      userId,
      productId,
      quantity,
    });

    logger.info('ℹ️  Order updated/created successfully', {
      orderId: order.id,
      userId,
      productId,
    });

    res.status(201).json({
      status: ResponseStatus.SUCCESS,
      data: toPublicOrder(order),
    });
  } catch (error: unknown) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:orders',
      message: '❌  Error adding to order',
      requestInfo: getRequestInfo(req),
      error,
    });

    if (replyWithHttpError(res, error)) return;
    next(error);
  }
};

export const removeFromOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { orderId, productId } = req.params;

  if (!orderId || !productId) {
    logger.warn('⚠️  Invalid request data', { orderId, productId });
    res.status(400).json({
      status: ResponseStatus.ERROR,
      message: 'Invalid request data. orderId and productId are required.',
    });
    return;
  }

  try {
    const updatedOrder = await OrderService.removeFromOrder(
      userId,
      orderId,
      productId
    );

    if (!updatedOrder) {
      logger.info('ℹ️  Order deleted as it became empty', { orderId });
      res.status(204).json({
        status: ResponseStatus.SUCCESS,
        message: 'Order deleted as it became empty',
      });
      return;
    }

    logger.info('ℹ️  Product removed from order successfully', {
      orderId,
      productId,
    });

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: toPublicOrder(updatedOrder),
    });
  } catch (error: unknown) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:orders',
      message: '❌  Error removing product from order',
      requestInfo: getRequestInfo(req),
      error,
    });

    if (replyWithHttpError(res, error)) return;
    next(error);
  }
};

export const updateQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  const { orderId, productId } = req.params;
  const { quantity } = req.body;

  if (!orderId || !productId || !quantity || quantity <= 0) {
    logger.warn('⚠️  Invalid request data', { orderId, productId, quantity });
    res.status(400).json({
      status: ResponseStatus.ERROR,
      message:
        'Invalid request data. orderId, productId, and quantity (positive integer) are required.',
    });
    return;
  }

  try {
    const updatedOrder = await OrderService.updateQuantity(
      userId,
      orderId,
      productId,
      quantity
    );

    logger.info('ℹ️  Quantity updated successfully', {
      orderId,
      productId,
      quantity,
    });

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: toPublicOrder(updatedOrder),
    });
  } catch (error: unknown) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:orders',
      message: '❌ Error updating quantity',
      requestInfo: getRequestInfo(req),
      error,
    });

    if (replyWithHttpError(res, error)) return;
    next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = requireUserId(req, res);
  if (!userId) return;

  try {
    const orders = await OrderService.getOrdersByUserId(userId);

    logger.info('ℹ️  Orders retrieved successfully', {
      userId,
      orderCount: orders.length,
    });

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: orders.map(toPublicOrder),
    });
  } catch (error: unknown) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:orders',
      message: `❌ Error retrieving orders for user ${userId}`,
      requestInfo: getRequestInfo(req),
      error,
    });

    if (replyWithHttpError(res, error)) return;
    next(error);
  }
};
