import { Product } from '@/db/entities';
import { getRepository } from '@/db/repository';
import { Repository } from 'typeorm';

export class ProductService {
  private productRepository: Repository<Product> = getRepository(Product);

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find();
  }
}
