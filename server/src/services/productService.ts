import type { Repository } from 'typeorm';

import { Product } from '@/db/entities';
import { getRepository } from '@/db/repository';

export class ProductService {
  private productRepository: Repository<Product> = getRepository(Product);

  async getAllProducts(): Promise<Product[]> {
    try {
      return await this.productRepository.find();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async getProductById(productId: string) {
    try {
      return await this.productRepository.findOne({
        where: { id: productId },
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
