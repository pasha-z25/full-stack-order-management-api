import { OrderService } from '@/services/orderService';
import logger from '@/utils/logger';
import type { NextFunction, Request, Response } from 'express';

export const addOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { userId, productId, quantity = 1 } = req.body;

  logger.info('POST /orders', { userId, productId, quantity });

  if (!userId || !productId || quantity <= 0) {
    logger.warn('Invalid request data', { userId, productId, quantity });
    res.status(400).json({
      status: 'error',
      message:
        'Invalid request data. userId, productId, and quantity (positive integer) are required.',
    });
    return;
  }

  try {
    const orderService = new OrderService();

    const order = await orderService.addToOrder({
      userId,
      productId,
      quantity,
    });

    logger.info('Order updated/created successfully', {
      orderId: order.id,
      userId,
      productId,
    });

    res.status(201).json({
      status: 'success',
      data: order,
    });
  } catch (error: any) {
    logger.error('❌ Error adding to order', {
      error: error.message,
      userId,
      productId,
    });

    if (error.message.includes('User not found')) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    if (error.message.includes('Product not found')) {
      res.status(404).json({ status: 'error', message: 'Product not found' });
      return;
    }
    if (error.message.includes('Insufficient stock')) {
      res.status(403).json({ status: 'error', message: error.message });
      return;
    }
    if (error.message.includes('Insufficient balance')) {
      res.status(403).json({ status: 'error', message: error.message });
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

  logger.info('DELETE /orders/:orderId/product/:productId', {
    orderId,
    productId,
  });

  if (!orderId || !productId) {
    logger.warn('Invalid request data', { orderId, productId });
    res.status(400).json({
      status: 'error',
      message: 'Invalid request data. orderId and productId are required.',
    });
    return;
  }

  try {
    const orderService = new OrderService();

    const updatedOrder = await orderService.removeFromOrder(orderId, productId);

    if (!updatedOrder) {
      logger.info('Order deleted as it became empty', { orderId });
      res.status(204).json({
        status: 'success',
        message: 'Order deleted as it became empty',
      });
      return;
    }

    logger.info('Product removed from order successfully', {
      orderId,
      productId,
    });

    res.status(200).json({
      status: 'success',
      data: updatedOrder,
    });
  } catch (error: any) {
    logger.error('❌ Error removing product from order', {
      error: error.message,
      orderId,
      productId,
    });

    if (error.message.includes('Order not found')) {
      res.status(404).json({ status: 'error', message: 'Order not found' });
      return;
    }
    if (error.message.includes('Product not found in order')) {
      res
        .status(404)
        .json({ status: 'error', message: 'Product not found in order' });
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

  logger.info('PATCH /orders/:orderId/product/:productId', {
    orderId,
    productId,
    quantity,
  });

  if (!orderId || !productId || !quantity || quantity <= 0) {
    logger.warn('Invalid request data', { orderId, productId, quantity });
    res.status(400).json({
      status: 'error',
      message:
        'Invalid request data. orderId, productId, and quantity (positive integer) are required.',
    });
    return;
  }

  try {
    const orderService = new OrderService();

    const updatedOrder = await orderService.updateQuantity(
      orderId,
      productId,
      quantity
    );

    logger.info('Quantity updated successfully', {
      orderId,
      productId,
      quantity,
    });

    res.status(200).json({
      status: 'success',
      data: updatedOrder,
    });
  } catch (error: any) {
    logger.error('❌ Error updating quantity', {
      error: error.message,
      orderId,
      productId,
    });

    if (error.message.includes('Order not found')) {
      res.status(404).json({ status: 'error', message: 'Order not found' });
      return;
    }
    if (error.message.includes('Product not found in order')) {
      res
        .status(404)
        .json({ status: 'error', message: 'Product not found in order' });
      return;
    }
    if (error.message.includes('Quantity must be at least 1')) {
      res.status(400).json({ status: 'error', message: error.message });
      return;
    }
    if (error.message.includes('Insufficient stock')) {
      res.status(403).json({ status: 'error', message: error.message });
      return;
    }
    if (error.message.includes('Insufficient balance')) {
      res.status(403).json({ status: 'error', message: error.message });
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

  logger.info('GET /orders/:userId', { userId });

  if (!userId) {
    logger.warn('Invalid request data', { userId });
    res.status(400).json({
      status: 'error',
      message: 'Invalid request data. userId is required.',
    });
    return;
  }

  try {
    const orderService = new OrderService();

    const orders = await orderService.getOrdersByUserId(userId);

    logger.info('Orders retrieved successfully', {
      userId,
      orderCount: orders.length,
    });

    res.status(200).json({
      status: 'success',
      data: orders,
    });
  } catch (error: any) {
    logger.error('❌ Error retrieving orders', {
      error: error.message,
      userId,
    });

    if (error.message.includes('User not found')) {
      res.status(404).json({ status: 'error', message: 'User not found' });
      return;
    }
    next(error);
  }
};

export const getAllOrders = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  logger.info('GET /orders');

  try {
    const orderService = new OrderService();

    const orders = await orderService.getAllOrders();

    logger.info('Orders retrieved successfully', {
      orderCount: orders.length,
    });

    res.status(200).json({
      status: 'success',
      data: orders,
    });
  } catch (error: any) {
    logger.error('❌ Error retrieving orders', { error: error.message });
    next(error);
  }
};
