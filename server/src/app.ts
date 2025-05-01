import cors from 'cors';
import express from 'express';
import 'express-async-errors';
import { rateLimiter } from './middlewares/rateLimit';
import { ordersRoutes, productsRoutes, usersRoutes } from './routes';
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
  res.send('Hello World');
});

app.use('/orders', rateLimiter, ordersRoutes);
app.use('/users', rateLimiter, usersRoutes);
app.use('/products', rateLimiter, productsRoutes);

app.use((req: express.Request, res: express.Response) => {
  logger.warn('⚠️ Route not found', { requestInfo: getRequestInfo(req) });
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

app.use((err: any, req: express.Request, res: express.Response) => {
  logger.error('❌ Unhandled error', {
    error: err.message,
    requestInfo: getRequestInfo(req),
  });
  res
    .status(500)
    .json({ status: 'error', message: err.message || 'Internal server error' });
});
