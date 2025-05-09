import * as ordersController from '@/controllers/orders';
import { Router } from 'express';

const router = Router();

// router.post('/', ordersController.addOrder);

// router.get('/:userId', ordersController.getUserOrders);

// router.get('/', ordersController.getAllOrders);

router.post('/', ordersController.addOrder); // POST /orders

router.delete('/:orderId/product/:productId', ordersController.removeFromOrder); // DELETE /orders/:orderId/product/:productId

router.patch('/:orderId/product/:productId', ordersController.updateQuantity); // PATCH /orders/:orderId/product/:productId

router.get('/:userId', ordersController.getUserOrders); // GET /orders/:userId

router.get('/', ordersController.getAllOrders); // GET /orders

export default router;
