import { OrderService } from '@/services/orderService';
import { BCRYPT_SALT_ROUNDS, CUSTOM_DATE_TIME_FORMAT } from '@/utils/constants';
import { getRandomInt } from '@/utils/helpers';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { Repository } from 'typeorm';
import { AppDataSource, initializeDataSource } from '.';
import { Order, Product, User } from './entities';
import { products, users } from './mock';
import { getRepository } from './repository';

dayjs.extend(customParseFormat);

const ONE_YEAR_IN_MS = 31536000000;

const currentTime = new Date().getTime();
const startTime = currentTime - ONE_YEAR_IN_MS;
const minStockQuantity = 10;
const maxStockQuantity = 100;

const userRepository: Repository<User> = getRepository(User);
const productRepository: Repository<Product> = getRepository(Product);
const orderRepository: Repository<Order> = getRepository(Order);

const createUser = async (user: Partial<User>, index: number) => {
  try {
    const password = await bcrypt.hash(`password${index}`, BCRYPT_SALT_ROUNDS);
    return userRepository.create({
      ...user,
      id: randomUUID(),
      password,
      registered: dayjs(new Date(getRandomInt(startTime, currentTime))).format(
        CUSTOM_DATE_TIME_FORMAT
      ),
    });
  } catch (error) {
    throw new Error(
      `⚠️ Failed to create user ${user.email}: ${(error as Error).message}`
    );
  }
};

const createProduct = (product: Partial<Product>) =>
  productRepository.create({
    ...product,
    id: randomUUID(),
    stock: getRandomInt(minStockQuantity, maxStockQuantity),
  });

const createOrder = () => {};

export async function seedDatabase(clearPrevious?: boolean) {
  await initializeDataSource();

  if (!AppDataSource.isInitialized) {
    throw new Error('⚠️ AppDataSource is not initialized');
  }

  if (clearPrevious) {
    await userRepository.delete({});
    await productRepository.delete({});
    await orderRepository.delete({});
  }

  const userCount = await userRepository.count();
  const productCount = await productRepository.count();
  const orderCount = await orderRepository.count();

  if (userCount > 0 && productCount > 0 && orderCount > 0) {
    console.log('💡 Database already seeded, skipping...');
    await AppDataSource.destroy();
    return;
  } else {
    await userRepository.delete({});
    await productRepository.delete({});
    await orderRepository.delete({});
  }

  const initialUsers = await Promise.all(users.map(createUser));
  const savedUsers = await userRepository.save(initialUsers);
  console.log('ℹ️ Users created:', savedUsers);

  const initialProducts = products.map(createProduct);
  const savedProducts = await productRepository.save(initialProducts);
  console.log('ℹ️ Products created:', savedProducts);

  const ordersData = [
    { userId: savedUsers[0].id, productId: savedProducts[0].id, quantity: 1 },
    { userId: savedUsers[0].id, productId: savedProducts[2].id, quantity: 2 },
    { userId: savedUsers[1].id, productId: savedProducts[1].id, quantity: 1 },
    { userId: savedUsers[2].id, productId: savedProducts[3].id, quantity: 3 },
  ];

  const savedOrders: Order[] = [];
  const orderService = new OrderService();

  for (const orderData of ordersData) {
    try {
      const order = await orderService.addToOrder(orderData);
      if (!savedOrders.some((o) => o.id === order.id)) {
        savedOrders.push(order);
      }
      console.log(`ℹ️ Order updated/created for user ${order.user.id}:`, order);
    } catch (error: any) {
      console.warn(
        `⚠️ Failed to create/update order for user ${orderData.userId}: ${error.message}`
      );
    }
  }

  console.log('ℹ️ Orders created:', savedOrders);
}
