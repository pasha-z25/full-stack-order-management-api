import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import helmet from 'helmet';
import morgan from 'morgan';

import { HttpError } from './errors/httpError';
import {
  apiLimiter,
  authLimiter,
  catalogLimiter,
} from './middlewares/rateLimit';
import {
  authRoutes,
  ordersRoutes,
  productsRoutes,
  usersRoutes,
} from './routes';
import { ResponseStatus } from './types';
import { getRequestInfo } from './utils/helpers';
import logger from './utils/logger';

const corsOptions = {
  origin: ['http://localhost:3000', 'http://frontend_web:3000'],
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

export const app = express();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

const morganFormat = ':method :url HTTP/:http-version :status'; // ":user-agent" if is required
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.info(`ℹ️  ${message.trim()}`) },
  })
);

app.get('/', function (_req, res) {
  res.send('Server started successfully!');
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/orders', apiLimiter, ordersRoutes);
app.use('/api/users', apiLimiter, usersRoutes);
app.use('/api/products', catalogLimiter, productsRoutes);

app.use((req: Request, res: Response) => {
  if (req.url.includes('.well-known') || req.url.includes('devtools')) {
    return res.status(404).end();
  }

  logger.warn('⚠️  Route not found', {
    method: req.method,
    url: req.url,
    requestInfo: getRequestInfo(req),
  });
  res
    .status(404)
    .json({ status: ResponseStatus.ERROR, message: 'Route not found' });
});

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  const isDev = process.env.NODE_ENV === 'development';
  const statusCode = err instanceof HttpError ? err.statusCode : 500;
  const message =
    err instanceof HttpError
      ? err.message
      : err instanceof Error && isDev
        ? err.message
        : 'Internal server error';

  logger.error('❌  Unhandled error', {
    error: err,
    statusCode,
    requestInfo: getRequestInfo(req),
  });

  res.status(statusCode).json({
    status: ResponseStatus.ERROR,
    message,
  });
});
