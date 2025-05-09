import { ProductService } from '@/services/productService';
import logger from '@/utils/logger';
import type { Request, Response } from 'express';

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
  } catch (error: any) {
    logger.error('❌ Error retrieving products', { error: error.message });
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
    });
  }
};
