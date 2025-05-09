import { Order, OrderItem, Product, User } from '@/db/entities';
import { getRepository } from '@/db/repository';
import { Repository } from 'typeorm';

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

  // Допоміжна функція для перевірки та оновлення балансу і запасів
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

    await this.userRepository.save(user);
    await this.productRepository.save(product);

    return totalPrice;
  }

  // Створення або оновлення замовлення (додавання одного товару)
  async addToOrder(orderData: OrderData): Promise<Order> {
    const { userId, productId, quantity = 1 } = orderData;

    // Знайти користувача
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error(`⚠️ User with ID ${userId} not found`);
    }

    // Знайти продукт
    const product = await this.productRepository.findOneBy({ id: productId });
    if (!product) {
      throw new Error(`⚠️ Product with ID ${productId} not found`);
    }

    // Знайти існуюче замовлення зі статусом 'pending'
    let order = await this.orderRepository.findOne({
      where: { user: { id: userId }, status: 'pending' },
      relations: ['items', 'items.product'],
    });

    let totalPriceAdjustment = 0;

    if (order) {
      // Якщо замовлення вже існує, перевірити, чи є продукт у списку
      const existingItem = order.items.find(
        (item) => item.product.id === productId
      );
      if (existingItem) {
        // Якщо продукт уже є, оновити кількість
        existingItem.quantity += quantity;
        totalPriceAdjustment = product.price * quantity;
        await this.orderItemRepository.save(existingItem);
      } else {
        // Якщо продукту немає, додати новий OrderItem
        const newItem = this.orderItemRepository.create({
          product,
          quantity,
        });
        order.items.push(newItem);
        totalPriceAdjustment = product.price * quantity;
      }
    } else {
      // Якщо замовлення немає, створити нове
      const newItem = this.orderItemRepository.create({
        product,
        quantity,
      });
      order = this.orderRepository.create({
        user,
        items: [newItem],
        totalPrice: 0, // Буде оновлено після валідації
        status: 'pending',
      });
      totalPriceAdjustment = product.price * quantity;
    }

    // Перевірити та оновити баланс і запаси
    const priceAdjustment = await this.validateAndUpdate(
      user,
      product,
      quantity
    );
    order.totalPrice += priceAdjustment;

    return await this.orderRepository.save(order);
  }

  // Видалення товару з замовлення
  async removeFromOrder(orderId: string, productId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'user'],
    });
    if (!order) {
      throw new Error(`⚠️ Order with ID ${orderId} not found`);
    }

    const itemToRemove = order.items.find(
      (item) => item.product.id === productId
    );
    if (!itemToRemove) {
      throw new Error(`⚠️ Product with ID ${productId} not found in order`);
    }

    // Повернути баланс і запаси
    const user = order.user;
    const product = itemToRemove.product;
    const quantity = itemToRemove.quantity;

    user.balance += product.price * quantity;
    product.stock += quantity;

    await this.userRepository.save(user);
    await this.productRepository.save(product);

    // Видалити OrderItem
    order.items = order.items.filter((item) => item.product.id !== productId);
    order.totalPrice -= product.price * quantity;

    // Якщо більше немає товарів, видалити замовлення
    if (order.items.length === 0) {
      await this.orderRepository.remove(order);
      return null as any; // Повертаємо null, щоб вказати, що замовлення видалене
    }

    return await this.orderRepository.save(order);
  }

  // Зміна кількості товару в замовленні
  async updateQuantity(
    orderId: string,
    productId: string,
    newQuantity: number
  ): Promise<Order> {
    if (newQuantity < 1) {
      throw new Error(`⚠️ Quantity must be at least 1`);
    }

    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'user'],
    });
    if (!order) {
      throw new Error(`⚠️ Order with ID ${orderId} not found`);
    }

    const item = order.items.find((item) => item.product.id === productId);
    if (!item) {
      throw new Error(`⚠️ Product with ID ${productId} not found in order`);
    }

    const user = order.user;
    const product = item.product;
    const oldQuantity = item.quantity;

    // Обчислити різницю в кількості
    const quantityDifference = newQuantity - oldQuantity;
    const priceDifference = product.price * quantityDifference;

    // Перевірити баланс і запаси для нової кількості
    if (quantityDifference > 0) {
      // Якщо кількість збільшується, перевірити баланс і запаси
      await this.validateAndUpdate(user, product, quantityDifference);
    } else if (quantityDifference < 0) {
      // Якщо кількість зменшується, повернути баланс і запаси
      user.balance -= priceDifference; // priceDifference буде від’ємним
      product.stock -= quantityDifference; // quantityDifference буде від’ємним
      await this.userRepository.save(user);
      await this.productRepository.save(product);
    }

    // Оновити кількість і загальну суму
    item.quantity = newQuantity;
    order.totalPrice += priceDifference;

    await this.orderItemRepository.save(item);
    return await this.orderRepository.save(order);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error('⚠️ User not found');
    }

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
