import type { NextFunction, Request, Response } from 'express';

import ProductService from '@services/productService';
import { getRequestInfo } from '@utils/helpers';
import logger, { LOG_LEVEL } from '@utils/logger';

import { ResponseStatus } from '@/types';

export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await ProductService.getAllProducts();

    logger.info('ℹ️  Products retrieved successfully', {
      productsCount: products.length,
    });

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: products,
    });
  } catch (error: unknown) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:products',
      message: '❌  Error retrieving products',
      requestInfo: getRequestInfo(req),
      error,
    });

    next(error);
  }
};

export const getProductById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const productId: string = req.params.id;

  try {
    const product = await ProductService.getProductById(productId);

    logger.info(`ℹ️  Product ${productId} retrieved successfully`);

    res.status(200).send({ status: ResponseStatus.SUCCESS, data: product });
  } catch (error) {
    logger.log({
      level: LOG_LEVEL.ERROR,
      scope: 'controller:products',
      message: `❌  Error retrieving product ${productId}`,
      requestInfo: getRequestInfo(req),
      error,
    });

    next(error);
  }
};
