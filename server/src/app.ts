import cors from 'cors';
import express from 'express';
import 'express-async-errors';

import { rateLimiter } from './middlewares/rateLimit';
import {
  authRoutes,
  ordersRoutes,
  productsRoutes,
  usersRoutes,
} from './routes';
import { getRequestInfo } from './utils/helpers';
import logger from './utils/logger';

const corsOptions = {
  origin: ['http://localhost:3000', 'http://frontend_web:3000'],
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const app = express();

app.use(express.json());
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/', function (_req, res) {
  res.send('Server started successfully!');
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', rateLimiter, ordersRoutes);
app.use('/api/users', rateLimiter, usersRoutes);
app.use('/api/products', rateLimiter, productsRoutes);

app.use((req: express.Request, res: express.Response) => {
  logger.warn('⚠️ Route not found', { requestInfo: getRequestInfo(req) });
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

app.use((err: unknown, req: express.Request, res: express.Response) => {
  const unknownError = new Error('Unknown error occurred');
  const errorMessage =
    err instanceof Error ? err.message : String(unknownError);
  logger.error('❌ Unhandled error', {
    error: errorMessage,
    requestInfo: getRequestInfo(req),
  });
  res.status(500).json({
    status: 'error',
    message: errorMessage || 'Internal server error',
  });
});
