import type { DataSource, Repository } from 'typeorm';

import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from '@/errors/httpError';
import type { OrderData } from '@/types/order';
import { Order, OrderItem, Product, User } from '@db/entities';
import { AppDataSource } from '@db/index';
import { getRepository } from '@db/repository';

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

  // Shared lock order for every balance and stock change: user, product, then order.
  // QueryBuilder skips eager relations. find() would LEFT JOIN them, and Postgres
  // rejects FOR UPDATE on the nullable side of an outer join.
  private async lockUser(
    userRepository: Repository<User>,
    userId: string
  ): Promise<User> {
    const user = await userRepository.findOne({
      where: { id: userId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!user) throw new NotFoundError(`⚠️ User with ID ${userId} not found`);
    return user;
  }

  private async lockProduct(
    productRepository: Repository<Product>,
    productId: string
  ): Promise<Product> {
    const product = await productRepository.findOne({
      where: { id: productId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!product)
      throw new NotFoundError(`⚠️ Product with ID ${productId} not found`);
    return product;
  }

  private async lockPendingOrder(
    orderRepository: Repository<Order>,
    userId: string
  ): Promise<Order | null> {
    return await orderRepository
      .createQueryBuilder('order')
      .innerJoin('order.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('order.status = :status', { status: 'pending' })
      .setLock('pessimistic_write')
      .getOne();
  }

  private async lockOrderById(
    orderRepository: Repository<Order>,
    orderId: string
  ): Promise<Order | null> {
    return await orderRepository
      .createQueryBuilder('order')
      .setLock('pessimistic_write')
      .where('order.id = :orderId', { orderId })
      .getOne();
  }

  private async findOrderUserId(
    orderRepository: Repository<Order>,
    orderId: string
  ): Promise<string> {
    const order = await orderRepository
      .createQueryBuilder('order')
      .innerJoinAndSelect('order.user', 'user')
      .where('order.id = :orderId', { orderId })
      .getOne();

    if (!order)
      throw new NotFoundError(`⚠️ Order with ID ${orderId} not found`);
    return order.user.id;
  }

  private assertOrderOwner(
    ownerId: string,
    userId: string,
    orderId: string
  ): void {
    if (ownerId !== userId)
      throw new NotFoundError(`⚠️ Order with ID ${orderId} not found`);
  }

  private async loadOrderItems(
    orderItemRepository: Repository<OrderItem>,
    orderId: string
  ): Promise<OrderItem[]> {
    return await orderItemRepository.find({
      where: { order: { id: orderId } },
      relations: ['product'],
    });
  }

  private async findOrCreateOrder(
    orderRepository: Repository<Order>,
    orderItemRepository: Repository<OrderItem>,
    userId: string,
    user: User
  ): Promise<Order> {
    const order = await this.lockPendingOrder(orderRepository, userId);

    if (!order) {
      return orderRepository.create({
        user,
        items: [],
        totalPrice: 0,
        status: 'pending',
      });
    }

    order.user = user;
    order.items = await this.loadOrderItems(orderItemRepository, order.id);
    return order;
  }

  private async validateAndUpdate(
    user: User,
    product: Product,
    quantity: number
  ): Promise<number> {
    const totalPrice = product.price * quantity;

    if (user.balance < totalPrice) {
      throw new ConflictError(
        `⚠️ Insufficient balance for user ${user.id}. Required: ${totalPrice}, Available: ${user.balance}`
      );
    }

    if (product.stock < quantity) {
      throw new ConflictError(
        `⚠️ Insufficient stock for ${product.title}. Available: ${product.stock}, Requested: ${quantity}`
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

      const user = await this.lockUser(userRepository, userId);
      const product = await this.lockProduct(productRepository, productId);
      const order = await this.findOrCreateOrder(
        orderRepository,
        orderItemRepository,
        userId,
        user
      );
      const existingItem = order.items.find(
        (item) => item.product.id === productId
      );

      if (existingItem) {
        existingItem.product = product;
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

      await userRepository.save(user);
      await productRepository.save(product);

      return await orderRepository.save(order);
    });
  }

  async removeFromOrder(
    userId: string,
    orderId: string,
    productId: string
  ): Promise<Order | null> {
    return await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.withRepository(this.userRepository);
      const productRepository = manager.withRepository(this.productRepository);
      const orderRepository = manager.withRepository(this.orderRepository);
      const orderItemRepository = manager.withRepository(
        this.orderItemRepository
      );

      const ownerId = await this.findOrderUserId(orderRepository, orderId);
      this.assertOrderOwner(ownerId, userId, orderId);
      const user = await this.lockUser(userRepository, ownerId);
      const product = await this.lockProduct(productRepository, productId);
      const order = await this.lockOrderById(orderRepository, orderId);
      if (!order)
        throw new NotFoundError(`⚠️ Order with ID ${orderId} not found`);

      order.user = user;
      order.items = await this.loadOrderItems(orderItemRepository, order.id);

      const itemToRemove = order.items.find(
        (item) => item.product.id === productId
      );
      if (!itemToRemove)
        throw new NotFoundError(
          `⚠️ Product with ID ${productId} not found in order`
        );

      const quantity = itemToRemove.quantity;

      user.balance += product.price * quantity;
      product.stock += quantity;

      await userRepository.save(user);
      await productRepository.save(product);
      await orderItemRepository.remove(itemToRemove);

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
    userId: string,
    orderId: string,
    productId: string,
    newQuantity: number
  ): Promise<Order> {
    if (newQuantity < 1)
      throw new BadRequestError('⚠️ Quantity must be at least 1');

    return await this.dataSource.transaction(async (manager) => {
      const userRepository = manager.withRepository(this.userRepository);
      const productRepository = manager.withRepository(this.productRepository);
      const orderRepository = manager.withRepository(this.orderRepository);
      const orderItemRepository = manager.withRepository(
        this.orderItemRepository
      );

      const ownerId = await this.findOrderUserId(orderRepository, orderId);
      this.assertOrderOwner(ownerId, userId, orderId);
      const user = await this.lockUser(userRepository, ownerId);
      const product = await this.lockProduct(productRepository, productId);
      const order = await this.lockOrderById(orderRepository, orderId);
      if (!order)
        throw new NotFoundError(`⚠️ Order with ID ${orderId} not found`);

      order.user = user;
      order.items = await this.loadOrderItems(orderItemRepository, order.id);

      const item = order.items.find((entry) => entry.product.id === productId);
      if (!item)
        throw new NotFoundError(
          `⚠️ Product with ID ${productId} not found in order`
        );

      item.product = product;
      const oldQuantity = item.quantity;

      const quantityDifference = newQuantity - oldQuantity;
      const priceDifference = product.price * quantityDifference;

      if (quantityDifference > 0) {
        await this.validateAndUpdate(user, product, quantityDifference);
      } else if (quantityDifference < 0) {
        user.balance -= priceDifference;
        product.stock -= quantityDifference;
      }

      if (quantityDifference !== 0) {
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
    if (!user) throw new NotFoundError(`⚠️ User with ID ${userId} not found`);

    return await this.orderRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'items', 'items.product'],
    });
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
      loadRelationIds: {
        relations: ['user'],
        disableMixedMap: false,
      },
    });
  }
}

export default new OrderService(AppDataSource);
