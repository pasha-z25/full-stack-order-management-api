import express from 'express';

import * as productController from '@/controllers/products';

const router = express.Router();

router.get('/', productController.getAllProducts);

router.get('/:id', productController.getProductById);

export default router;
