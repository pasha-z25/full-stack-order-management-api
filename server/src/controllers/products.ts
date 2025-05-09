import type { Request, Response } from 'express';

import { ProductService } from '@/services/productService';
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
      status: 'success',
      data: products,
    });
  } catch (error: unknown) {
    const unknownError = new Error('Unknown error occurred');
    const errorMessage =
      error instanceof Error ? error.message : String(unknownError);

    logger.error('❌ Error retrieving products', { error: errorMessage });
    res.status(500).json({
      status: 'error',
      message: errorMessage || 'Internal server error',
    });
  }
};
