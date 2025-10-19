import type { NextFunction, Request, Response } from 'express';

import { ResponseStatus } from '@/types';
import OrderService from '@services/orderService';
import { getRequestInfo } from '@utils/helpers';
import logger, { LOG_LEVEL } from '@utils/logger';

export const addOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId, productId, quantity = 1 } = req.body;

  if (!userId || !productId || quantity <= 0) {
    logger.warn('⚠️  Invalid request data', { userId, productId, quantity });
    res.status(400).json({
      status: ResponseStatus.ERROR,
      message:
        'Invalid request data. userId, productId, and quantity (positive integer) are required.',
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
      data: order,
    });
  } catch (error: unknown) {
    const unknownError = new Error('Unknown error occurred');
    const errorMessage =
      error instanceof Error ? error.message : String(unknownError);

    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:orders',
      message: '❌  Error adding to order',
      requestInfo: getRequestInfo(req),
      error,
    });

    if (errorMessage.includes('User not found')) {
      res
        .status(404)
        .json({ status: ResponseStatus.ERROR, message: 'User not found' });
      return;
    }
    if (errorMessage.includes('Product not found')) {
      res
        .status(404)
        .json({ status: ResponseStatus.ERROR, message: 'Product not found' });
      return;
    }
    if (errorMessage.includes('Insufficient stock')) {
      res
        .status(403)
        .json({ status: ResponseStatus.ERROR, message: errorMessage });
      return;
    }
    if (errorMessage.includes('Insufficient balance')) {
      res
        .status(403)
        .json({ status: ResponseStatus.ERROR, message: errorMessage });
      return;
    }
    next(error);
  }
};

export const removeFromOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const updatedOrder = await OrderService.removeFromOrder(orderId, productId);

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
      data: updatedOrder,
    });
  } catch (error: unknown) {
    const unknownError = new Error('Unknown error occurred');
    const errorMessage =
      error instanceof Error ? error.message : String(unknownError);

    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:orders',
      message: '❌  Error removing product from order',
      requestInfo: getRequestInfo(req),
      error,
    });

    if (errorMessage.includes('Order not found')) {
      res
        .status(404)
        .json({ status: ResponseStatus.ERROR, message: 'Order not found' });
      return;
    }
    if (errorMessage.includes('Product not found in order')) {
      res.status(404).json({
        status: ResponseStatus.ERROR,
        message: 'Product not found in order',
      });
      return;
    }
    next(error);
  }
};

export const updateQuantity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
      data: updatedOrder,
    });
  } catch (error: unknown) {
    const unknownError = new Error('Unknown error occurred');
    const errorMessage =
      error instanceof Error ? error.message : String(unknownError);

    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:orders',
      message: '❌ Error updating quantity',
      requestInfo: getRequestInfo(req),
      error,
    });

    if (errorMessage.includes('Order not found')) {
      res
        .status(404)
        .json({ status: ResponseStatus.ERROR, message: 'Order not found' });
      return;
    }
    if (errorMessage.includes('Product not found in order')) {
      res.status(404).json({
        status: ResponseStatus.ERROR,
        message: 'Product not found in order',
      });
      return;
    }
    if (errorMessage.includes('Quantity must be at least 1')) {
      res
        .status(400)
        .json({ status: ResponseStatus.ERROR, message: errorMessage });
      return;
    }
    if (errorMessage.includes('Insufficient stock')) {
      res
        .status(403)
        .json({ status: ResponseStatus.ERROR, message: errorMessage });
      return;
    }
    if (errorMessage.includes('Insufficient balance')) {
      res
        .status(403)
        .json({ status: ResponseStatus.ERROR, message: errorMessage });
      return;
    }
    next(error);
  }
};

export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId } = req.params;

  if (!userId) {
    logger.warn('⚠️  Invalid request data', { userId });
    res.status(400).json({
      status: ResponseStatus.ERROR,
      message: 'Invalid request data. userId is required.',
    });
    return;
  }

  try {
    const orders = await OrderService.getOrdersByUserId(userId);

    logger.info('ℹ️  Orders retrieved successfully', {
      userId,
      orderCount: orders.length,
    });

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: orders,
    });
  } catch (error: unknown) {
    const unknownError = new Error('Unknown error occurred');
    const errorMessage =
      error instanceof Error ? error.message : String(unknownError);

    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:orders',
      message: `❌ Error retrieving orders for user ${userId}`,
      requestInfo: getRequestInfo(req),
      error,
    });

    if (errorMessage.includes('User not found')) {
      res
        .status(404)
        .json({ status: ResponseStatus.ERROR, message: 'User not found' });
      return;
    }
    next(error);
  }
};

export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orders = await OrderService.getAllOrders();

    logger.info('ℹ️  Orders retrieved successfully', {
      orderCount: orders.length,
    });

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: orders,
    });
  } catch (error: unknown) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:orders',
      message: '❌  Error retrieving orders',
      requestInfo: getRequestInfo(req),
      error,
    });

    next(error);
  }
};
