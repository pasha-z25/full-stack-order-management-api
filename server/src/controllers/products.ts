import type { Request, Response } from 'express';

import { ProductService } from '@/services/productService';
import { ResponseStatus } from '@/types';
import logger from '@/utils/logger';

export const getAllProducts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  logger.info('GET /products');

  try {
    const productService = new ProductService();

    const products = await productService.getAllProducts();

    logger.info('Products retrieved successfully', {
      productsCount: products.length,
    });

    res.status(200).json({
      status: ResponseStatus.SUCCESS,
      data: products,
    });
  } catch (error: unknown) {
    const unknownError = new Error('Unknown error occurred');
    const errorMessage =
      error instanceof Error ? error.message : String(unknownError);

    logger.error('❌ Error retrieving products', { error: errorMessage });
    res.status(500).json({
      status: ResponseStatus.ERROR,
      message: errorMessage || 'Internal server error',
    });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  const productId: string = req.params.id;
  logger.info(`GET /product ${productId}`);

  try {
    const productService = new ProductService();

    const product = await productService.getProductById(productId);

    logger.info(`Product ${productId} retrieved successfully`);

    res.status(200).send({ status: ResponseStatus.SUCCESS, data: product });
  } catch (error) {
    const unknownError = new Error('Unknown error occurred');
    const errorMessage =
      error instanceof Error ? error.message : String(unknownError);

    logger.error(`❌ Error retrieving product ${productId}`, {
      error: errorMessage,
    });
    res.status(500).json({
      status: ResponseStatus.ERROR,
      message: errorMessage || 'Internal server error',
    });
  }
};
