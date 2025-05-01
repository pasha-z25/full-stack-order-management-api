import { DataSource } from 'typeorm';
import { Order, OrderItem, Product, User } from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
  database: process.env.DB_NAME || 'dev_db',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Product, Order, OrderItem],
  extra: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 60000,
    connectionTimeoutMillis: 20000,
    keepAlive: true,
  },
});

export async function initializeDataSource(retries = 5, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      await AppDataSource.initialize();
      console.log('📦 Database initialized successfully');
      return;
    } catch (error: any) {
      console.error(
        `🔄 Failed to initialize database (attempt ${i + 1}/${retries}):`,
        error.message
      );
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
