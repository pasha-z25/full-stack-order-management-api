import * as ordersController from '@controllers/orders';
import { AuthService } from '@services/authService';
import { Router } from 'express';

import { authMiddleware } from '@/middlewares/auth';

const router = Router();
const authService = new AuthService();

router.use(authMiddleware(authService));

router.post('/', ordersController.addOrder);

router.delete('/:orderId/product/:productId', ordersController.removeFromOrder);

router.patch('/:orderId/product/:productId', ordersController.updateQuantity);

router.get('/', ordersController.getUserOrders);

export default router;
