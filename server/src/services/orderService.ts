import { Order, OrderItem, Product, User } from '@/db/entities';
import { getRepository } from '@/db/repository';
import { DataSource, Repository } from 'typeorm';

interface OrderData {
  userId: string;
  productId: string;
  quantity?: number;
}

export class OrderService {
  private orderRepository: Repository<Order> = getRepository(Order);
  private userRepository: Repository<User> = getRepository(User);
  private productRepository: Repository<Product> = getRepository(Product);
  private orderItemRepository: Repository<OrderItem> = getRepository(OrderItem);
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.orderRepository = dataSource.getRepository(Order);
    this.userRepository = dataSource.getRepository(User);
    this.productRepository = dataSource.getRepository(Product);
    this.orderItemRepository = dataSource.getRepository(OrderItem);
  }

  private async findOrCreateOrder(userId: string, user: User): Promise<Order> {
    let order = await this.orderRepository.findOne({
      where: { user: { id: userId }, status: 'pending' },
      relations: ['items', 'items.product'],
    });

    if (!order) {
      order = this.orderRepository.create({
        user,
        items: [],
        totalPrice: 0,
        status: 'pending',
      });
    }
    return order;
  }

  private async validateAndUpdate(
    user: User,
    product: Product,
    quantity: number
  ): Promise<number> {
    const totalPrice = product.price * quantity;

    if (user.balance < totalPrice) {
      throw new Error(
        `⚠️ Insufficient balance for user ${user.name}. Required: ${totalPrice}, Available: ${user.balance}`
      );
    }

    if (product.stock < quantity) {
      throw new Error(
        `⚠️ Insufficient stock for product ${product.title}. Available: ${product.stock}, Requested: ${quantity}`
      );
    }

    user.balance -= totalPrice;
    product.stock -= quantity;

    return totalPrice;
  }

  async addToOrder(orderData: OrderData): Promise<Order> {
    const { userId, productId, quantity = 1 } = orderData;

    return await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.withRepository(this.userRepository);
      const productRepository = manager.withRepository(this.productRepository);
      const orderRepository = manager.withRepository(this.orderRepository);
      const orderItemRepository = manager.withRepository(
        this.orderItemRepository
      );

      const user = await userRepository.findOneBy({ id: userId });
      if (!user) throw new Error(`⚠️ User with ID ${userId} not found`);

      const product = await productRepository.findOneBy({ id: productId });
      if (!product)
        throw new Error(`⚠️ Product with ID ${productId} not found`);

      const order = await this.findOrCreateOrder(userId, user);
      const existingItem = order.items.find(
        (item) => item.product.id === productId
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        await orderItemRepository.save(existingItem);
      } else {
        const newItem = orderItemRepository.create({ product, quantity });
        order.items.push(newItem);
      }

      const priceAdjustment = await this.validateAndUpdate(
        user,
        product,
        quantity
      );
      order.totalPrice += priceAdjustment;

      return await orderRepository.save(order);
    });
  }

  async removeFromOrder(
    orderId: string,
    productId: string
  ): Promise<Order | null> {
    return await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.withRepository(this.userRepository);
      const productRepository = manager.withRepository(this.productRepository);
      const orderRepository = manager.withRepository(this.orderRepository);

      const order = await orderRepository.findOne({
        where: { id: orderId },
        relations: ['items', 'items.product', 'user'],
      });
      if (!order) throw new Error(`⚠️ Order with ID ${orderId} not found`);

      const itemToRemove = order.items.find(
        (item) => item.product.id === productId
      );
      if (!itemToRemove)
        throw new Error(`⚠️ Product with ID ${productId} not found in order`);

      const user = order.user;
      const product = itemToRemove.product;
      const quantity = itemToRemove.quantity;

      user.balance += product.price * quantity;
      product.stock += quantity;

      await userRepository.save(user);
      await productRepository.save(product);

      order.items = order.items.filter((item) => item.product.id !== productId);
      order.totalPrice -= product.price * quantity;

      if (order.items.length === 0) {
        await orderRepository.remove(order);
        return null;
      }

      return await orderRepository.save(order);
    });
  }

  async updateQuantity(
    orderId: string,
    productId: string,
    newQuantity: number
  ): Promise<Order> {
    if (newQuantity < 1) throw new Error(`⚠️ Quantity must be at least 1`);

    return await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.withRepository(this.userRepository);
      const productRepository = manager.withRepository(this.productRepository);
      const orderRepository = manager.withRepository(this.orderRepository);
      const orderItemRepository = manager.withRepository(
        this.orderItemRepository
      );

      const order = await orderRepository.findOne({
        where: { id: orderId },
        relations: ['items', 'items.product', 'user'],
      });
      if (!order) throw new Error(`⚠️ Order with ID ${orderId} not found`);

      const item = order.items.find((item) => item.product.id === productId);
      if (!item)
        throw new Error(`⚠️ Product with ID ${productId} not found in order`);

      const user = order.user;
      const product = item.product;
      const oldQuantity = item.quantity;

      const quantityDifference = newQuantity - oldQuantity;
      const priceDifference = product.price * quantityDifference;

      if (quantityDifference > 0) {
        await this.validateAndUpdate(user, product, quantityDifference);
      } else if (quantityDifference < 0) {
        user.balance -= priceDifference;
        product.stock -= quantityDifference;
        await userRepository.save(user);
        await productRepository.save(product);
      }

      item.quantity = newQuantity;
      order.totalPrice += priceDifference;

      await orderItemRepository.save(item);
      return await orderRepository.save(order);
    });
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new Error('⚠️ User not found');

    return await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.product'],
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
    });
  }
}
